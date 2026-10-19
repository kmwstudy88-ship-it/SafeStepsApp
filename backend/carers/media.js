'use strict';
const { createHash } = require('node:crypto');
const MAX_MEDIA_BYTES = 25 * 1024 * 1024;
const MEDIA_TYPES = new Set(['image/jpeg','image/png','image/webp','video/mp4','video/quicktime']);

function verifyMediaBytes(bytes, expectedMime, declaredSize) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 1 || bytes.length > MAX_MEDIA_BYTES || bytes.length !== declaredSize) {
    throw Object.assign(new Error('The stored file size does not match the selected media.'), { statusCode: 400, code: 'INVALID_MEDIA_REQUEST' });
  }
  const signature = expectedMime === 'image/jpeg' ? bytes.subarray(0,3).equals(Buffer.from([255,216,255])) :
    expectedMime === 'image/png' ? bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) :
    expectedMime === 'image/webp' ? bytes.toString('ascii',0,4)==='RIFF' && bytes.toString('ascii',8,12)==='WEBP' :
    expectedMime === 'video/quicktime' ? bytes.toString('ascii',4,8)==='ftyp' && bytes.toString('ascii',8,12)==='qt  ' :
    expectedMime === 'video/mp4' ? bytes.toString('ascii',4,8)==='ftyp' && ['isom','iso2','mp41','mp42','avc1','M4V ','MSNV'].includes(bytes.toString('ascii',8,12)) : false;
  if (!MEDIA_TYPES.has(expectedMime) || !signature) {
    throw Object.assign(new Error('The stored file does not match a supported photo or video format.'), { statusCode: 400, code: 'INVALID_MEDIA_REQUEST' });
  }
  return { sha256: createHash('sha256').update(bytes).digest('hex'), byteSize: bytes.length, mimeType: expectedMime };
}
module.exports = { MAX_MEDIA_BYTES, MEDIA_TYPES, verifyMediaBytes };
