import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { handleCaseReportGovernance } from "./handler.mjs";

function createUserClient(url: string | undefined, anonKey: string | undefined, authorization: string) {
  return createClient(url!, anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authorization } },
  });
}

Deno.serve((req: Request) => {
  return handleCaseReportGovernance(req, {
    envGet(name: string) {
      return Deno.env.get(name);
    },
    createUserClient,
  });
});
