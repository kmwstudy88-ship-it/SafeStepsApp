import { supabase } from "./supabaseClient";

function isMissingAuthSession(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === "AuthSessionMissingError" ||
      error.message.toLowerCase().includes("auth session missing"))
  );
}

export async function getOptionalUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    if (isMissingAuthSession(error)) return null;
    throw new Error(error.message);
  }

  return data.user?.id ?? null;
}

export async function getSignedInUserId(action: string) {
  const userId = await getOptionalUserId();

  if (!userId) {
    throw new Error(`Sign in before ${action}.`);
  }

  return userId;
}
