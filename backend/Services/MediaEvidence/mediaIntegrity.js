'use strict';

const { createHash, timingSafeEqual } = require('node:crypto');

function mediaError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function isDigest(value) {
  return typeof value === 'string' && /^[a-f\d]{64}$/i.test(value);
}

function sameDigest(left, right) {
  if (!isDigest(left) || !isDigest(right)) return false;
  return timingSafeEqual(Buffer.from(left, 'hex'), Buffer.from(right, 'hex'));
}

async function hashMediaBytes(stream, expectedBytes) {
  if (!Number.isSafeInteger(expectedBytes) || expectedBytes < 0) {
    throw new TypeError('expectedBytes must be a non-negative safe integer');
  }

  const hash = createHash('sha256');
  let byteSize = 0;
  for await (const chunk of stream) {
    if (!Buffer.isBuffer(chunk) && !(chunk instanceof Uint8Array)) {
      throw new TypeError('Media streams must yield binary chunks');
    }
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    byteSize += bytes.byteLength;
    if (byteSize > expectedBytes) {
      throw mediaError('MEDIA_SIZE_MISMATCH', 'Media stream exceeded its declared byte size');
    }
    hash.update(bytes);
  }

  if (byteSize !== expectedBytes) {
    throw mediaError('MEDIA_SIZE_MISMATCH', 'Media stream did not match its declared byte size');
  }
  return { sha256: hash.digest('hex'), byteSize };
}

async function preserveMediaOriginal(input, vault) {
  if (!vault || typeof vault.sealIntake !== 'function'
    || typeof vault.readIntake !== 'function'
    || typeof vault.preserve !== 'function'
    || typeof vault.readOriginal !== 'function'
    || !vault.capabilities?.versioned
    || !vault.capabilities?.retentionEnforced
    || !vault.capabilities?.sealedIntake
    || !vault.capabilities?.encrypted) {
    throw mediaError('MEDIA_VAULT_UNAVAILABLE', 'A validated, retention-enforced media vault is required');
  }

  const sealed = await vault.sealIntake({
    evidenceId: input.evidenceId,
    uploadId: input.uploadId,
  });
  if (!sealed || sealed.evidenceId !== input.evidenceId || sealed.uploadId !== input.uploadId || !sealed.version) {
    throw mediaError('MEDIA_VAULT_UNAVAILABLE', 'Media intake could not be sealed');
  }

  const source = await hashMediaBytes(await vault.readIntake(sealed), input.expectedBytes);
  if (input.claimedSha256 !== undefined && !sameDigest(source.sha256, input.claimedSha256)) {
    throw mediaError('MEDIA_HASH_MISMATCH', 'Client digest does not match the sealed upload');
  }

  const receipt = await vault.preserve({
    ...input,
    sha256: source.sha256,
    byteSize: source.byteSize,
    intakeVersion: sealed.version,
  });
  if (!receipt || receipt.evidenceId !== input.evidenceId || !receipt.version) {
    throw mediaError('MEDIA_VAULT_UNAVAILABLE', 'The vault did not return a preservation receipt');
  }
  if (receipt.retentionEnforced !== true || (input.legalHold === true && receipt.legalHold !== true)) {
    throw mediaError('MEDIA_RETENTION_UNVERIFIED', 'Vault retention or legal hold could not be verified');
  }

  const original = await hashMediaBytes(await vault.readOriginal(receipt), input.expectedBytes);
  if (original.byteSize !== source.byteSize || !sameDigest(original.sha256, source.sha256)) {
    throw mediaError('MEDIA_PRESERVATION_MISMATCH', 'Preserved media does not match the sealed upload');
  }

  return { ...receipt, sha256: source.sha256, byteSize: source.byteSize };
}

module.exports = { hashMediaBytes, preserveMediaOriginal, sameDigest };
