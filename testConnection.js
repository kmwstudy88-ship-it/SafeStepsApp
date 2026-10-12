import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase connection variables. Set SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY).",
  );
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function testConnection() {
  const { error } = await supabase.from("profiles").select("id").limit(1);

  if (!error) {
    console.log("Supabase connection successful.");
    return;
  }

  if (error.code === "42P01") {
    console.log("Supabase connection successful, but table 'profiles' does not exist yet.");
    return;
  }

  throw error;
}

testConnection().catch((error) => {
  console.error("Supabase connection failed:", error.message);
  process.exitCode = 1;
});
