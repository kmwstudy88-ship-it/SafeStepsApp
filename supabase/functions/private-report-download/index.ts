import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { handlePrivateReportDownload } from "./handler.mjs";

Deno.serve((req: Request) => handlePrivateReportDownload(req, {
  envGet: (name: string) => Deno.env.get(name),
  createClient,
}));
