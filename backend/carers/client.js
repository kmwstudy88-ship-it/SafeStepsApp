'use strict';
const { createClient } = require('@supabase/supabase-js');
const { createCarerService } = require('./service');
const { admin } = require('../document-intelligence/supabase');

function carerServiceForRequest(req, user) {
  const url = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_KEY;
  if (!url || !key) throw Object.assign(new Error('Carer Portal access is not configured on this server.'), { statusCode: 503, code: 'CARER_NOT_CONFIGURED' });
  const db = createClient(url, key, { global: { headers: { Authorization: req.headers.authorization } },
    auth: { persistSession: false, autoRefreshToken: false } });
  return createCarerService({ db, userId: user.id, mediaVerifier: admin });
}
module.exports = { carerServiceForRequest };
