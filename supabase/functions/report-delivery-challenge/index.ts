import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

Deno.serve(async (req: Request) => {
 const headers={"Content-Type":"application/json","Cache-Control":"no-store"};
 if(req.method!=="POST") return new Response(JSON.stringify({allowed:false}),{status:405,headers});
 try{
  const body=await req.json();
  const token=String(body.deliveryToken??"");
  const code=String(body.verificationCode??"");
  if(!/^[0-9a-f]{48}$/i.test(token)||!/^[0-9]{6}$/.test(code))
   return new Response(JSON.stringify({allowed:false}),{status:400,headers});
  const url=Deno.env.get("SUPABASE_URL")!;
  const anon=Deno.env.get("SUPABASE_ANON_KEY")!;
  const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const publicClient=createClient(url,anon,{auth:{persistSession:false}});
  const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:decision,error}=await publicClient.rpc("consume_case_report_delivery",{p_token:token,p_code:code});
  if(error||!decision?.allowed) return new Response(JSON.stringify({allowed:false}),{status:403,headers});
  const {data:signed,error:signError}=await admin.storage.from(decision.bucket)
   .createSignedUrl(decision.path,600,{download:true});
  if(signError||!signed?.signedUrl) throw new Error("Delivery unavailable");
  return new Response(JSON.stringify({
   allowed:true,signedUrl:signed.signedUrl,expiresIn:600,
   reportVersion:decision.reportVersion,fileSha256:decision.fileSha256,
   notice:"Access confirms delivery interaction only; it does not indicate agreement with report contents."
  }),{headers});
 }catch{
  return new Response(JSON.stringify({allowed:false}),{status:400,headers});
 }
});
