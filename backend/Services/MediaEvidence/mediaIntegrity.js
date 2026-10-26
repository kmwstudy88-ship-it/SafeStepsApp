'use strict';

const { createHash, timingSafeEqual } = require('node:crypto');

function createMediaError(code, message) {
  const err = new Error(message || code);
  err.code = code;
  return err;
}

function sameDigest(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (!/^[0-9a-f]{64}$/i.test(a) || !/^[0-9a-f]{64}$/i.test(b)) return false;
  const bufA = Buffer.from(a.toLowerCase(), 'hex');
  const bufB = Buffer.from(b.toLowerCase(), 'hex');
  if (bufA.length !== 32 || bufB.length !== 32) return false;
  return timingSafeEqual(bufA, bufB);
}

async function hashMediaBytes(stream, expectedBytes) {
  if (!stream || typeof stream[Symbol.asyncIterator] !== 'function') {
    throw new TypeError('Readable binary stream is required');
  }
  if (!Number.isSafeInteger(expectedBytes) || expectedBytes < 0) {
    throw createMediaError('MEDIA_SIZE_MISMATCH', 'Invalid expected byte length');
  }

  const hash = createHash('sha256');
  let byteSize = 0;

  for await (const chunk of stream) {
    if (typeof chunk === 'string' || (!Buffer.isBuffer(chunk) && !(chunk instanceof Uint8Array))) {
      throw new TypeError('Media stream must yield binary Buffer chunks');
    }
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    byteSize += buf.length;
    if (byteSize > expectedBytes) {
      throw createMediaError('MEDIA_SIZE_MISMATCH', 'Stream exceeded expected byte size');
    }
    hash.update(buf);
  }

  if (byteSize !== expectedBytes) {
    throw createMediaError('MEDIA_SIZE_MISMATCH', 'Stream ended before expected byte size');
  }

  return {
    sha256: hash.digest('hex'),
    byteSize,
  };
}

function assertVaultReady(vault) {
  const cap = vault?.capabilities;
  if (
    !vault
    || !cap?.versioned
    || !cap?.retentionEnforced
    || !cap?.sealedIntake
    || !cap?.encrypted
    || typeof vault.sealIntake !== 'function'
    || typeof vault.readIntake !== 'function'
    || typeof vault.preserve !== 'function'
    || typeof vault.readOriginal !== 'function'
  ) {
    throw createMediaError('MEDIA_VAULT_UNAVAILABLE', 'Approved media preservation vault is unavailable');
  }
}

async function preserveMediaOriginal(request = {}, vault) {
  assertVaultReady(vault);

  const {
    evidenceId,
    uploadId,
    expectedBytes,
    claimedSha256,
    retentionClass,
    legalHold,
  } = request;

  await vault.sealIntake({ evidenceId, uploadId });
  const intakeStream = await vault.readIntake({ evidenceId, uploadId });
  const intakeDigest = await hashMediaBytes(intakeStream, expectedBytes);

  if (claimedSha256 != null && !sameDigest(intakeDigest.sha256, claimedSha256)) {
    throw createMediaError('MEDIA_HASH_MISMATCH', 'Client digest does not match sealed intake bytes');
  }

  const preserved = await vault.preserve({
    evidenceId,
    uploadId,
    sha256: intakeDigest.sha256,
    byteSize: intakeDigest.byteSize,
    retentionClass,
    legalHold: Boolean(legalHold),
  });

  if (!preserved?.retentionEnforced || (legalHold && !preserved?.legalHold)) {
    throw createMediaError('MEDIA_RETENTION_UNVERIFIED', 'Vault retention or legal hold was not verified');
  }

  const storedStream = await vault.readOriginal({
    evidenceId,
    version: preserved.version,
  });
  const storedDigest = await hashMediaBytes(storedStream, expectedBytes);

  if (!sameDigest(storedDigest.sha256, intakeDigest.sha256)) {
    throw createMediaError('MEDIA_PRESERVATION_MISMATCH', 'Vault readback digest does not match intake digest');
  }

  return {
    evidenceId,
    version: preserved.version,
    sha256: intakeDigest.sha256,
    byteSize: intakeDigest.byteSize,
    retentionEnforced: true,
    legalHold: Boolean(preserved.legalHold),
  };
}

module.exports = {
  sameDigest,
  hashMediaBytes,
  preserveMediaOriginal,
};
