import { createClient } from '@supabase/supabase-js';

let authClient;

function getAuthClient() {
  if (authClient) return authClient;

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const error = new Error('SafeSteps API authentication is not configured.');
    error.statusCode = 503;
    throw error;
  }

  authClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return authClient;
}

function bearerToken(authorizationHeader) {
  if (typeof authorizationHeader !== 'string') return null;
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function requireAuthenticatedUser(req, _res, next) {
  try {
    if (process.env.SAFESTEPS_ALLOW_UNAUTHENTICATED_LOCAL_API === 'true') {
      req.safeStepsUser = null;
      next();
      return;
    }

    const token = bearerToken(req.headers.authorization);
    if (!token) {
      const error = new Error('Authentication required. Send a valid SafeSteps bearer token.');
      error.statusCode = 401;
      throw error;
    }

    const client = getAuthClient();
    const { data, error } = await client.auth.getUser(token);

    if (error || !data.user) {
      const authError = new Error('The SafeSteps bearer token is invalid or expired.');
      authError.statusCode = 401;
      throw authError;
    }

    req.safeStepsUser = data.user;
    next();
  } catch (error) {
    next(error);
  }
}
