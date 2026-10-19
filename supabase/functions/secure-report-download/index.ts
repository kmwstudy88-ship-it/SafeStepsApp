import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

import { handleSecureReportDownload } from "./handler.mjs";

Deno.serve((req: Request) => handleSecureReportDownload(req, {
  createClient,
  envGet: Deno.env.get.bind(Deno.env),
}));
