import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {createCarerService}=require('../../backend/carers/service');
const {verifyMediaBytes,MAX_MEDIA_BYTES}=require('../../backend/carers/media');
const user='11111111-1111-4111-8111-111111111111';
const caseId='22222222-2222-4222-8222-222222222222';
const tenant='33333333-3333-4333-8333-333333333333';
const upload='dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const png=Buffer.from([137,80,78,71,13,10,26,10,0,0,0,0]);

test('byte verification calculates SHA-256 from stored bytes and rejects format/size mismatches',()=>{
  assert.deepEqual(verifyMediaBytes(png,'image/png',png.length),{
    sha256:createHash('sha256').update(png).digest('hex'),byteSize:png.length,mimeType:'image/png'});
  for(const [bytes,type,size] of [[png,'image/jpeg',png.length],[png,'image/png',99],[Buffer.from('<svg>'),'image/png',5],
    [Buffer.alloc(0),'image/png',0],[Buffer.alloc(MAX_MEDIA_BYTES+1),'image/png',MAX_MEDIA_BYTES+1]]) {
    assert.throws(()=>verifyMediaBytes(bytes,type,size),{statusCode:400});
  }
  const mp4=Buffer.from([0,0,0,16,...Buffer.from('ftypisom'),0,0,0,0]);
  assert.equal(verifyMediaBytes(mp4,'video/mp4',mp4.length).mimeType,'video/mp4');
  assert.throws(()=>verifyMediaBytes(mp4,'video/quicktime',mp4.length),{statusCode:400});
});
function fixture(){
  const calls=[];const machine=[];const storage=[];
  const metadata={id:upload,bucket:'carer-media',path:`${tenant}/${caseId}/${upload}/original`,mimeType:'image/png',byteSize:png.length,state:'reserved'};
  let error=null;
  const db={
    async rpc(name,args){calls.push({name,args});return {data:name==='get_carer_media_location'?metadata:[],error};},
    storage:{from(bucket){storage.push(bucket);return {
      async download(path){storage.push(path);return {data:new Blob([png]),error};},
      async createSignedUrl(path,ttl){storage.push({path,ttl});return {data:{signedUrl:'https://example.test/private-preview'},error};},
    };}},
  };
  const verifier={async rpc(name,args){machine.push({name,args});return {data:{id:upload,state:'ready'},error};}};
  return {calls,machine,storage,metadata,setError(value){error=value;},service:createCarerService({db,userId:user,mediaVerifier:verifier,now:()=>Date.parse('2026-10-17T00:00:00Z')})};
}
test('completion verifies actual private bytes and binds the trusted finalizer actor to the authenticated user',async()=>{
  const f=fixture();await f.service.completeMedia(upload,{});
  assert.deepEqual(f.calls[0],{name:'get_carer_media_location',args:{p_upload_id:upload,p_for_completion:true}});
  assert.deepEqual(f.machine[0],{name:'finalize_carer_media',args:{p_upload_id:upload,p_actor_user_id:user,
    p_sha256:createHash('sha256').update(png).digest('hex'),p_actual_bytes:png.length,p_verified_mime:'image/png'}});
  assert.ok(!f.calls.some(c=>c.name==='finalize_carer_media'));
  await assert.rejects(f.service.completeMedia(upload,{p_actor_user_id:'forged',sha256:'forged'}),{statusCode:400});
  assert.equal(f.machine.length,1);
});
test('completion refuses corrupt metadata, path traversal and unverified-size changes',async()=>{
  for(const change of [meta=>meta.byteSize=1,meta=>meta.path='../other/original',meta=>meta.bucket='public',meta=>meta.id=caseId]){
    const f=fixture();change(f.metadata);
    await assert.rejects(f.service.completeMedia(upload,{}));assert.equal(f.machine.length,0);
  }
});
test('authorized previews have a bounded TTL and use only the private bucket',async()=>{
  const f=fixture();f.metadata.state='ready';const result=await f.service.getMediaView(upload);
  assert.equal(result.mimeType,'image/png');assert.equal(f.storage[0],'carer-media');
  assert.equal(f.storage[1].ttl,60);
  assert.deepEqual(f.calls[0].args,{p_upload_id:upload,p_for_completion:false});
  f.setError({code:'42501'});await assert.rejects(f.service.getMediaView(upload),{statusCode:403});
});
test('preview TTL cannot outlive a known parent grant expiry',async()=>{
  const f=fixture();f.metadata.state='ready';f.metadata.accessExpiresAt='2026-10-17T00:00:10Z';
  await f.service.getMediaView(upload);assert.equal(f.storage[1].ttl,10);
  f.metadata.accessExpiresAt='2026-10-16T23:59:59Z';await assert.rejects(f.service.getMediaView(upload),{statusCode:403});
});
test('review requires an explicit bounded parent grant; rejection revokes without a supplied actor',async()=>{
  const f=fixture();
  await f.service.reviewMedia(upload,{decision:'approved',parentUserId:caseId,expiresAt:'2026-10-24T00:00:00Z',reason:'Reviewed original',originalDisclosureConfirmed:true});
  assert.deepEqual(f.calls[0],{name:'review_carer_media',args:{p_upload_id:upload,p_decision:'approved',p_parent_user_id:caseId,
    p_expires_at:'2026-10-24T00:00:00Z',p_reason:'Reviewed original',p_original_confirmed:true}});
  await f.service.reviewMedia(upload,{decision:'rejected',reason:'Withdraw sharing'});
  assert.equal(f.calls[1].args.p_parent_user_id,null);assert.equal(f.calls[1].args.p_expires_at,null);
  for(const invalid of [{decision:'approved',reason:'Missing parent'},
    {decision:'approved',reason:'Too long',parentUserId:caseId,expiresAt:'2027-01-01T00:00:00Z'},
    {decision:'approved',reason:'Forged reviewer',reviewedBy:user},
    {decision:'rejected',reason:' '}]){
    await assert.rejects(f.service.reviewMedia(upload,invalid),{statusCode:400});
  }
});
test('reserve rejects unsupported, oversized, path-bearing and forged source metadata before querying',async()=>{
  const f=fixture();const valid={submissionId:upload,fileName:'photo.png',title:'Care photo',description:'Observed context',mimeType:'image/png',byteSize:12};
  for(const bad of [{...valid,byteSize:MAX_MEDIA_BYTES+1},{...valid,mimeType:'image/svg+xml'},
    {...valid,fileName:'../photo.png'},{...valid,author_user_id:user},{...valid,sha256:'client hash'}]){
    await assert.rejects(f.service.reserveMedia(caseId,bad),{statusCode:400});
  }
  assert.equal(f.calls.length,0);
});
