import { createClient } from "@supabase/supabase-js";

const LIVE_REF="yzxotxbwgxnxemkzigse";
const url=process.env.SAFESTEPS_STAGING_URL;
const key=process.env.SAFESTEPS_STAGING_PUBLISHABLE_KEY;
const caseId=process.env.SAFESTEPS_STAGING_CASE_ID;
const credentials=JSON.parse(process.env.SAFESTEPS_STAGING_ROLE_CREDENTIALS_JSON??"{}");

function fail(message){ console.error(message); process.exitCode=1; }
if(!url||!key||!caseId) throw new Error("Set SAFESTEPS_STAGING_URL, SAFESTEPS_STAGING_PUBLISHABLE_KEY and SAFESTEPS_STAGING_CASE_ID.");
const host=new URL(url).host;
if(host.includes(LIVE_REF)) throw new Error("Refusing to run journey verification against the connected live SafeSteps project.");

const results=[];
async function runRole(role,checks){
 const login=credentials[role];
 if(!login?.email||!login?.password) throw new Error(`Missing controlled staging credentials for ${role}.`);
 const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {error:loginError}=await client.auth.signInWithPassword(login);
 if(loginError) throw loginError;
 for(const check of checks){
  const {data,error}=await client.from(check.table).select(check.select??"id").eq(check.caseColumn??"case_id",check.caseId??caseId).limit(1);
  const allowed=!error;
  const passed=check.allow?allowed:!allowed||data?.length===0;
  results.push({role,check:check.name,expected:check.allow?"allow":"deny",passed,error:error?.message??null});
 }
 await client.auth.signOut();
}

await runRole("parent",[
 {name:"own case",table:"reunification_cases",caseColumn:"id",allow:true},
 {name:"worker evidence decisions",table:"case_document_review_events",allow:false},
]);
await runRole("child",[
 {name:"child private records",table:"child_private_records",allow:true},
 {name:"report administration",table:"report_approvals",allow:false},
]);
await runRole("caseworker",[
 {name:"assigned evidence queue",table:"case_documents",allow:true},
 {name:"independent approval events",table:"case_report_release_events",allow:false},
]);
await runRole("supervisor",[
 {name:"report release history",table:"case_report_release_events",allow:true},
]);
await runRole("court_viewer",[
 {name:"released report history",table:"case_report_release_events",allow:true},
 {name:"draft evidence",table:"case_documents",allow:false},
]);
await runRole("unrelated",[
 {name:"unrelated case",table:"reunification_cases",caseColumn:"id",allow:false},
 {name:"unrelated report",table:"case_report_release_events",allow:false},
]);

const anonymous=createClient(url,key,{auth:{persistSession:false}});
const {data:anonReport,error:anonError}=await anonymous.from("case_report_release_events").select("id").limit(1);
results.push({role:"anonymous",check:"report tables",expected:"deny",passed:Boolean(anonError)||anonReport?.length===0,error:anonError?.message??null});

for(const result of results) console.log(JSON.stringify(result));
const failures=results.filter((result)=>!result.passed);
if(failures.length) fail(`Staging boundary verification failed: ${failures.length} check(s).`);
else console.log(`SafeSteps staging boundary verification passed: ${results.length} checks.`);
