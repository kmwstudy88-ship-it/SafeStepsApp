'use strict';

const { createClient } = require('@supabase/supabase-js');

function required(name, fallback) {
  const value = process.env[name] || fallback;
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const url = required('SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL);
const serviceRoleKey = required('SUPABASE_SERVICE_ROLE_KEY');

const admin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function authenticateBearer(header) {
  const token = String(header || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

module.exports = { admin, authenticateBearer };
