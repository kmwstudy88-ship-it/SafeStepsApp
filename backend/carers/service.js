'use strict';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const { MAX_MEDIA_BYTES, MEDIA_TYPES, verifyMediaBytes } = require('./media');
const kinds = new Set(['daily_update', 'achievement', 'concern']);
const participantColumns = 'case_id,tenant_id,user_id,participant_role,participant_type,status,participation_status,effective_from,effective_to,participation_start_at,participation_end_at,allowed_actions,denied_actions';
const membershipColumns = 'tenant_id,user_id,membership_status,effective_from,effective_to,revoked_at,suspended_at';
const noteColumns = 'id,case_id,note_type,note_title,note_body,created_at,family_shared';

function fail(statusCode, code, message) {
  throw Object.assign(new Error(message), { statusCode, code });
}
function activePeriod(start, end, now) {
  return Number.isFinite(Date.parse(start)) && Date.parse(start) <= now &&
    (end == null || (Number.isFinite(Date.parse(end)) && Date.parse(end) > now));
}
function activeParticipant(row, userId, now, action) {
  return row.user_id === userId && row.tenant_id &&
    (row.participant_role || row.participant_type) === 'carer' &&
    row.status === 'active' && row.participation_status === 'active' &&
    activePeriod(row.effective_from, row.effective_to, now) &&
    activePeriod(row.participation_start_at, row.participation_end_at, now) &&
    Array.isArray(row.allowed_actions) && row.allowed_actions.includes(action) &&
    !row.denied_actions?.includes(action);
}
function activeMembership(row, userId, now) {
  return row.user_id === userId && row.membership_status === 'active' &&
    !row.revoked_at && !row.suspended_at && activePeriod(row.effective_from, row.effective_to, now);
}
async function checked(query) {
  const { data, error } = await query;
  if (error) {
    if (error.code === 'PGRST202') fail(503, 'CARER_MIGRATION_REQUIRED', 'This Carer Portal action is not enabled in this environment. Keep your draft or original file and contact the care team.');
    if (error.code === '23505') fail(409, 'SUBMISSION_ALREADY_EXISTS', 'This submission reference already exists. Ask your care team to confirm the saved update before starting another submission.');
    if (error.code === '42501' || Number(error.statusCode) === 403) fail(403, 'CARER_PERMISSION_REQUIRED', 'Your account does not have permission for this action. Ask the care team to review your access.');
    fail(503, 'CARER_DATA_UNAVAILABLE', 'The carer record service is unavailable. Please try again.');
  }
  return data;
}
function summary(row) {
  return { id: row.id, title: row.case_title || row.title, status: row.case_status_code || row.status,
    stage: row.current_stage, reviewAt: row.target_review_at };
}
function note(row) {
  return { id: row.id, caseId: row.case_id, kind: row.note_type.replace('carer_', ''),
    title: row.note_title, detail: row.note_body, createdAt: row.created_at,
    familyShared: row.family_shared === true };
}

// db MUST be a client carrying the verified user's bearer token. Never pass admin here.
function createCarerService({ db, userId, mediaVerifier = null, now = () => Date.now() }) {
  if (!UUID.test(userId || '')) fail(401, 'UNAUTHENTICATED', 'Sign in to use the Carer Portal.');
  function communicationBody(body, keys) {
    if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(key => !keys.includes(key))) {
      fail(400, 'INVALID_COMMUNICATION_REQUEST', 'Provide only the required communication fields.');
    }
  }
  function channelId(id) {
    if (!UUID.test(id || '')) fail(400, 'INVALID_COMMUNICATION_REQUEST', 'Choose a valid conversation.');
  }
  function mediaId(id) { if (!UUID.test(id || '')) fail(400, 'INVALID_MEDIA_REQUEST', 'Choose a valid media record.'); }
  function mediaBody(body, keys) {
    if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(key => !keys.includes(key))) {
      fail(400, 'INVALID_MEDIA_REQUEST', 'Provide only the required media fields.');
    }
  }
  async function mediaLocation(id, completion) {
    mediaId(id);
    const data = await checked(db.rpc('get_carer_media_location', { p_upload_id: id, p_for_completion: completion }));
    if (!data || data.id!==id || data.bucket !== 'carer-media' || typeof data.path !== 'string' || data.path.split('/').length!==4 ||
      !data.path.split('/').slice(0,3).every(part=>UUID.test(part)) || data.path.split('/')[2]!==id || data.path.split('/')[3]!=='original' || !MEDIA_TYPES.has(data.mimeType) ||
      !Number.isSafeInteger(data.byteSize) || data.byteSize < 1 || data.byteSize > MAX_MEDIA_BYTES) {
      fail(503, 'CARER_DATA_UNAVAILABLE', 'The media record service is unavailable.');
    }
    if (!['reserved','ready'].includes(data.state) || (!completion && data.state!=='ready')) fail(403,'CARER_PERMISSION_REQUIRED','This media is not ready for preview.');
    return data;
  }

  async function assignments(action) {
    const [participants, memberships] = await Promise.all([
      checked(db.from('case_participants').select(participantColumns).eq('user_id', userId).eq('participation_status', 'active')),
      checked(db.from('tenant_memberships').select(membershipColumns).eq('user_id', userId).eq('membership_status', 'active')),
    ]);
    const time = now();
    const memberTenants = [...new Set((memberships || []).filter(row => activeMembership(row, userId, time)).map(row => row.tenant_id))];
    if (!memberTenants.length) return [];
    const platforms = await checked(db.from('platform_tenants').select('id,tenant_status').in('id', memberTenants).eq('tenant_status','active'));
    const tenants = new Set((platforms || []).map(row=>row.id));
    const current = (participants || []).filter(row => tenants.has(row.tenant_id) &&
      row.user_id === userId && row.status === 'active' && row.participation_status === 'active' &&
      activePeriod(row.effective_from, row.effective_to, time) && activePeriod(row.participation_start_at, row.participation_end_at, time));
    return current.filter(row => activeParticipant(row, userId, time, action) &&
      !current.some(other => other.case_id === row.case_id && other.denied_actions?.includes(action)));
  }
  async function requireCase(caseId, action = 'carer.portal.read') {
    if (!UUID.test(caseId || '')) fail(400, 'INVALID_CASE', 'Choose a valid assigned case.');
    const rows = await assignments(action);
    if (!rows.some(row=>row.case_id===caseId)) fail(403,'CARER_CASE_ACCESS_DENIED','This case is not available through your current carer assignment.');
    const row = await checked(db.rpc('get_carer_assigned_case',{p_case_id:caseId}));
    if (!row || !rows.some(p => p.case_id === row.id && p.tenant_id === row.tenant_id)) {
      fail(403, 'CARER_CASE_ACCESS_DENIED', 'This case is not available through your current carer assignment.');
    }
    return row;
  }
  return {
    async listMedia() { return checked(db.rpc('list_carer_media')); },
    async reserveMedia(caseId, body) {
      mediaBody(body, ['submissionId','fileName','title','description','mimeType','byteSize']);
      if (!UUID.test(body.submissionId || '') || typeof body.fileName !== 'string' || !body.fileName.trim() || body.fileName.length > 160 || /[/\\\u0000-\u001f]/.test(body.fileName) ||
        typeof body.title !== 'string' || !body.title.trim() || body.title.length>160 || typeof body.description !== 'string' || body.description.length>2000 ||
        !MEDIA_TYPES.has(body.mimeType) || !Number.isSafeInteger(body.byteSize) || body.byteSize<1 || body.byteSize>MAX_MEDIA_BYTES) {
        fail(400, 'INVALID_MEDIA_REQUEST', 'Choose a supported photo/video up to 25 MiB, with a title and a valid filename.');
      }
      await requireCase(caseId);
      return checked(db.rpc('reserve_carer_media', { p_case_id: caseId, p_submission_id: body.submissionId, p_filename: body.fileName,
        p_title: body.title.trim(), p_description: body.description.trim(), p_mime: body.mimeType, p_bytes: body.byteSize }));
    },
    async completeMedia(id, body) {
      mediaBody(body, []);
      if (!mediaVerifier) fail(503, 'CARER_NOT_CONFIGURED', 'Media verification is not configured on this server.');
      const location = await mediaLocation(id, true);
      const blob = await checked(db.storage.from('carer-media').download(location.path));
      if (!blob || typeof blob.arrayBuffer !== 'function' || blob.size>MAX_MEDIA_BYTES) {
        fail(400, 'INVALID_MEDIA_REQUEST', 'The stored media exceeds the supported size or cannot be read.');
      }
      const verified = verifyMediaBytes(Buffer.from(await blob.arrayBuffer()), location.mimeType, location.byteSize);
      // The only privileged call: trusted bytes/hash are computed here, and actor identity
      // comes from the verified bearer token supplied by the server, never request JSON.
      return checked(mediaVerifier.rpc('finalize_carer_media', { p_upload_id: id, p_actor_user_id: userId,
        p_sha256: verified.sha256, p_actual_bytes: verified.byteSize, p_verified_mime: verified.mimeType }));
    },
    async getMediaView(id) {
      const location = await mediaLocation(id, false);
      const ttl=location.accessExpiresAt ? Math.min(60,Math.floor((Date.parse(location.accessExpiresAt)-now())/1000)) : 60;
      if (!Number.isFinite(ttl) || ttl<1) fail(403,'CARER_PERMISSION_REQUIRED','The media sharing permission has expired.');
      const signed = await checked(db.storage.from('carer-media').createSignedUrl(location.path, ttl));
      return { url: signed.signedUrl, mimeType: location.mimeType, expiresAt: new Date(now()+ttl*1000).toISOString() };
    },
    async mediaRecipients(id) { mediaId(id); return checked(db.rpc('list_carer_media_recipients', { p_upload_id: id })); },
    async reviewMedia(id, body) {
      mediaId(id); mediaBody(body, ['decision','parentUserId','expiresAt','reason','originalDisclosureConfirmed']);
      if (!['approved','rejected'].includes(body.decision) || typeof body.reason !== 'string' || !body.reason.trim() || body.reason.length>2000 ||
        (body.decision==='approved' && (body.originalDisclosureConfirmed!==true || !UUID.test(body.parentUserId || '') || typeof body.expiresAt !== 'string' ||
          !Number.isFinite(Date.parse(body.expiresAt)) || Date.parse(body.expiresAt)<=now() || Date.parse(body.expiresAt)>now()+30*86400000))) {
        fail(400, 'INVALID_MEDIA_REQUEST', 'Confirm original-file sharing, select the parent, a period of up to 30 days and a review reason.');
      }
      return checked(db.rpc('review_carer_media', { p_upload_id: id, p_decision: body.decision,
        p_parent_user_id: body.decision==='approved' ? body.parentUserId : null,
        p_expires_at: body.decision==='approved' ? body.expiresAt : null, p_reason: body.reason.trim(),
        p_original_confirmed:body.decision==='approved' && body.originalDisclosureConfirmed===true }));
    },
    async listChannels() { return checked(db.rpc('list_carer_message_channels')); },
    async getMessages(id) { channelId(id); return checked(db.rpc('get_carer_channel_messages', { p_channel_id: id })); },
    async setChannelEnabled(id, body) {
      channelId(id); communicationBody(body, ['enabled']);
      if (typeof body.enabled !== 'boolean') fail(400, 'INVALID_COMMUNICATION_REQUEST', 'Choose whether communication is enabled.');
      return checked(db.rpc('set_carer_channel_enabled', { p_channel_id: id, p_enabled: body.enabled }));
    },
    async sendMessage(id, body) {
      channelId(id); communicationBody(body, ['submissionId', 'text']);
      if (!UUID.test(body.submissionId || '') || typeof body.text !== 'string' || !body.text.trim() || body.text.length > 4000) {
        fail(400, 'INVALID_COMMUNICATION_REQUEST', 'Add a message of up to 4,000 characters.');
      }
      return checked(db.rpc('send_carer_channel_message', { p_channel_id: id, p_submission_id: body.submissionId, p_body: body.text.trim() }));
    },
    async reviewMessage(id, body) {
      channelId(id); communicationBody(body, ['messageId', 'decision', 'reason']);
      if (!UUID.test(body.messageId || '') || !['approved','rejected'].includes(body.decision) ||
        typeof body.reason !== 'string' || !body.reason.trim() || body.reason.length > 2000) {
        fail(400, 'INVALID_COMMUNICATION_REQUEST', 'Choose a review decision and add a reason of up to 2,000 characters.');
      }
      return checked(db.rpc('review_carer_channel_message', { p_channel_id: id, p_message_id: body.messageId,
        p_decision: body.decision, p_note: body.reason.trim() }));
    },
    async createChannel(body) {
      communicationBody(body, ['operationalCaseId','carerUserId','parentUserId','expiresAt','label','reason']);
      if (![body.operationalCaseId,body.carerUserId,body.parentUserId].every(id => UUID.test(id || '')) ||
        typeof body.expiresAt !== 'string' || !Number.isFinite(Date.parse(body.expiresAt)) || Date.parse(body.expiresAt) <= now() ||
        typeof body.label!=='string' || !body.label.trim() || body.label.length>160 ||
        typeof body.reason!=='string' || !body.reason.trim() || body.reason.length>2000) {
        fail(400, 'INVALID_COMMUNICATION_REQUEST', 'Current participants, an operational case and a future expiry are required.');
      }
      return checked(db.rpc('create_carer_message_channel', { p_case_id: body.operationalCaseId, p_carer_user_id: body.carerUserId,
        p_parent_user_id: body.parentUserId, p_expires_at: body.expiresAt, p_label:body.label.trim(),p_reason:body.reason.trim() }));
    },
    async revokeChannel(id, body) {
      channelId(id); communicationBody(body, ['reason']);
      if (typeof body.reason !== 'string' || !body.reason.trim() || body.reason.length > 2000) {
        fail(400, 'INVALID_COMMUNICATION_REQUEST', 'Add a revocation reason of up to 2,000 characters.');
      }
      return checked(db.rpc('revoke_carer_message_channel', { p_channel_id: id, p_reason: body.reason.trim() }));
    },
    async listCases() {
      const rows = await assignments('carer.portal.read');
      if (!rows.length) return [];
      const cases = await checked(db.rpc('list_carer_assigned_cases'));
      return (cases || []).filter(c => rows.some(p => p.case_id === c.id && p.tenant_id === c.tenant_id)).map(summary);
    },
    async listJournal(caseId) {
      const c = await requireCase(caseId);
      const rows = await checked(db.from('case_notes').select(noteColumns).eq('case_id', caseId)
        .eq('tenant_id', c.tenant_id)
        .eq('author_user_id', userId).in('note_type', ['carer_daily_update', 'carer_achievement', 'carer_concern'])
        .order('created_at', { ascending: false }).limit(100));
      return (rows || []).map(note);
    },
    async createJournal(caseId, body) {
      if (!body || typeof body !== 'object' || Array.isArray(body) ||
          Object.keys(body).some(key => !['kind', 'title', 'detail', 'submissionId'].includes(key)) || !UUID.test(body.submissionId || '') ||
          !kinds.has(body.kind) || typeof body.detail !== 'string' || !body.detail.trim() ||
          body.detail.length > 10000 || typeof body.title !== 'string' || !body.title.trim() || body.title.length > 160) {
        fail(400, 'INVALID_JOURNAL_ENTRY', 'Choose an update type, a title (up to 160 characters) and details (up to 10,000 characters).');
      }
      await requireCase(caseId);
      const c = await requireCase(caseId, 'carer.journal.create');
      if (c.status !== 'active' || c.case_status_code === 'closed') fail(403, 'CASE_NOT_ACTIVE', 'Journal submissions are unavailable for this case.');
      // Repeat assignment and tenant checks inside the database write operation; preserve user RLS.
      return checked(db.rpc('submit_carer_journal', { p_case_id: c.id, p_submission_id: body.submissionId,
        p_kind: body.kind, p_title: body.title.trim(), p_detail: body.detail.trim() }));
    },
  };
}
module.exports = { createCarerService };
