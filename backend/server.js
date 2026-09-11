const http = require('node:http');
const crypto = require('node:crypto');

let createClient = null;
try {
  ({ createClient } = require('@supabase/supabase-js'));
} catch {
  createClient = null;
}

const PORT = process.env.PORT || 3000;

const DOCUMENT_SECTIONS = [
  'Case Identification & Reference',
  'Family Composition & Demographics',
  'Child Safety History & Intakes',
  'Substantiated Harm Details',
  'Allegation & Harm Matrix',
  'Parental Capacity Assessment',
  'Protective Factors & Strengths',
  'Safety Network & Kinship Support',
  'Substance & AOD Screening',
  'Mental Health Context & History',
  'Domestic & Family Violence Screening',
  'Safety Plan Versions & Commitments',
  'Housing & Stability Verification',
  'Financial Self-Sufficiency',
  'Child Voice & Developmental Wishes',
  'Education & School Attendance',
  'Pediatric & Healthcare Records',
  'Contact Visit Attendance Log',
  'Contact Visit Observation Summaries',
  'Caseworker Field Notes',
  'Service Provider Progress Letters',
  'Case Conference Minutes',
  'Court Orders & Interim Directions',
  'Reunification Milestone Progress',
  'Behavioral Regulation Observations',
  'Positive Discipline Practices',
  'Co-Parenting & Communication',
  'Parenting Program Attendance',
  'Routine & Schedule Verification',
  'Emotional Availability Evaluation',
  'Child Adjustment to Visits',
  'Risk Mitigation Measures',
  'Cultural Safety & Community Connection',
  'Trauma-Informed Care Application',
  'Urinalysis & Toxicology Logs',
  'Police & Background Verifications',
  'Evidence Chain of Custody Registry',
  'Fairness & Bias Analysis Layer',
  'Coercion & Framing Checkpoints',
  'Remediation & Reframe Directives',
  'CSO Supervisory Endorsements',
  'Case Closure & Reunification Orders',
  'Interagency Collaboration Notes',
  'Parent-Child Attachment Indicators',
  'Incident Escalation Trail',
  'Compliance Obligations Tracking',
  'Service Referral Timelines',
  'Outcome Measurement Benchmarks'
];

const memory = {
  documents: new Map(),
  analyses: new Map(),
  risks: new Map(),
};

const supabase =
  createClient && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

function sendJson(res, statusCode, data) {
  const json = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(json),
  });
  res.end(json);
}

function parseBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks);
      const text = raw.toString('utf8');
      let json = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        json = {};
      }
      resolve({
        json,
        text,
        contentType: (req.headers['content-type'] || '').toLowerCase(),
      });
    });
  });
}

function requestId(prefix = 'req') {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
}

function hasOpenAiKey() {
  return Boolean(process.env.OPENAI_API_KEY || process.env.OPENAI_KEY);
}

function hasClaudeKey() {
  return Boolean(process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY);
}

function decodeUploadText(body) {
  if (typeof body.text === 'string' && body.text.trim()) return body.text;
  if (typeof body.contentBase64 === 'string' && body.contentBase64.trim()) {
    try {
      return Buffer.from(body.contentBase64, 'base64').toString('utf8');
    } catch {
      return '';
    }
  }
  return '';
}

async function trySupabaseInsert(table, payload) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

async function trySupabaseUpdate(table, values, match) {
  if (!supabase) return null;
  const query = supabase.from(table).update(values);
  Object.entries(match).forEach(([key, value]) => query.eq(key, value));
  const { data, error } = await query.select('*').maybeSingle();
  if (error) throw error;
  return data || null;
}

async function trySupabaseSelectSingle(table, match) {
  if (!supabase) return null;
  let query = supabase.from(table).select('*');
  Object.entries(match).forEach(([key, value]) => {
    query = query.eq(key, value);
  });
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data || null;
}

async function storeDocument(payload) {
  const record = {
    id: payload.id || crypto.randomUUID(),
    case_id: payload.case_id || null,
    uploaded_by: payload.uploaded_by || null,
    file_name: payload.file_name || null,
    mime_type: payload.mime_type || 'text/plain',
    storage_path: payload.storage_path || null,
    parsed_text: payload.parsed_text || '',
    processing_status: payload.processing_status || 'uploaded',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!supabase) {
    memory.documents.set(record.id, record);
    return record;
  }

  try {
    const row = await trySupabaseInsert('documents', record);
    return row || record;
  } catch {
    memory.documents.set(record.id, record);
    return record;
  }
}

async function getDocument(documentId) {
  try {
    const row = await trySupabaseSelectSingle('documents', { id: documentId });
    if (row) return row;
  } catch {
    // Fall back to in-memory storage
  }
  return memory.documents.get(documentId) || null;
}

async function updateDocument(documentId, patch) {
  try {
    const row = await trySupabaseUpdate(
      'documents',
      { ...patch, updated_at: new Date().toISOString() },
      { id: documentId },
    );
    if (row) return row;
  } catch {
    // Fall back to in-memory storage
  }

  const current = memory.documents.get(documentId);
  if (!current) return null;
  const updated = { ...current, ...patch, updated_at: new Date().toISOString() };
  memory.documents.set(documentId, updated);
  return updated;
}

function normalizeCaseId(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function extractKeywords(text) {
  return Array.from(new Set((text.toLowerCase().match(/[a-z]{4,}/g) || []).slice(0, 120)));
}

function heuristicFairness(text) {
  const lower = text.toLowerCase();
  const biasIndicators = [];
  const framingConcerns = [];
  const recommendations = [];

  if (lower.includes('failed to cooperate') || lower.includes('refused')) {
    biasIndicators.push({
      category: 'subjective_labeling',
      severity: 'medium',
      evidence: 'failed to cooperate/refused',
      explanation: 'Subjective framing without specific observable behaviors.',
    });
    recommendations.push({
      concern: 'Labeling non-cooperation',
      reframe: 'Describe exact request, response, and surrounding context.',
    });
  }

  if (lower.includes('hostile') || lower.includes('aggressive')) {
    framingConcerns.push({
      category: 'hostile_attribution',
      severity: 'high',
      evidence: 'hostile/aggressive',
      explanation: 'Character attribution should be replaced with observable facts.',
    });
    recommendations.push({
      concern: 'Character attribution',
      reframe: 'Capture factual language, tone, and sequence of events.',
    });
  }

  if (lower.includes('always') || lower.includes('never')) {
    framingConcerns.push({
      category: 'absolute_language',
      severity: 'medium',
      evidence: 'always/never',
      explanation: 'Absolute language may overstate behavior patterns.',
    });
    recommendations.push({
      concern: 'Overgeneralization',
      reframe: 'Specify dates, observed frequency, and exceptions.',
    });
  }

  const fairnessScore = Math.max(20, 100 - (biasIndicators.length + framingConcerns.length) * 20);

  return {
    fairnessScore,
    biasIndicators,
    framingConcerns,
    recommendations,
  };
}

function heuristicRisk(text) {
  const lower = text.toLowerCase();
  const markers = [
    { bucket: 'critical', words: ['weapon', 'strangled', 'threatened to kill', 'suicidal', 'abduction'] },
    { bucket: 'high', words: ['assault', 'domestic violence', 'intoxicated', 'neglect', 'unsafe home'] },
    { bucket: 'moderate', words: ['missed visit', 'argument', 'non-compliance', 'unstable housing'] },
  ];

  const factors = [];
  let score = 25;

  markers.forEach(({ bucket, words }) => {
    words.forEach((word) => {
      if (lower.includes(word)) {
        factors.push({ category: bucket, indicator: word });
        if (bucket === 'critical') score += 28;
        if (bucket === 'high') score += 18;
        if (bucket === 'moderate') score += 8;
      }
    });
  });

  score = Math.min(100, score);
  const riskLevel = score >= 85 ? 'critical' : score >= 65 ? 'high' : score >= 40 ? 'moderate' : 'low';

  return {
    riskScore: score,
    riskLevel,
    escalationRequired: riskLevel === 'high' || riskLevel === 'critical',
    factors,
  };
}

function buildSectionResults(text, aiResponse) {
  const lower = text.toLowerCase();
  const insights = aiResponse?.sectionInsights || {};

  return DOCUMENT_SECTIONS.map((section) => {
    const firstToken = section.toLowerCase().split(/\s+/)[0];
    const matched = lower.includes(firstToken);
    const aiInsight = insights[section];

    return {
      section,
      status: matched || aiInsight ? 'detected' : 'not_detected',
      confidence: aiInsight ? 0.82 : matched ? 0.55 : 0.2,
      insight:
        aiInsight ||
        (matched
          ? `Text references content related to ${section}.`
          : `No direct indicator for ${section} found in current document text.`),
    };
  });
}

function parseModelJson(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  try {
    return JSON.parse(rawText);
  } catch {
    const block = rawText.match(/\{[\s\S]*\}/);
    if (!block) return null;
    try {
      return JSON.parse(block[0]);
    } catch {
      return null;
    }
  }
}

async function callOpenAiAnalysis(text) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
  if (!apiKey) return null;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: ['Bearer', apiKey].join(' '),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a child safety document analyst. Return strict JSON with keys: summary, sectionInsights (map of section to insight), fairnessFindings (array), riskFindings (array).',
        },
        {
          role: 'user',
          content: `Document sections: ${DOCUMENT_SECTIONS.join('; ')}\n\nDocument:\n${text}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed (${response.status})`);
  }

  const body = await response.json();
  const content = body?.choices?.[0]?.message?.content || '';
  return parseModelJson(content);
}

async function callClaudeAnalysis(text) {
  const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.CLAUDE_MODEL || 'claude-3-5-haiku-latest',
      max_tokens: 1000,
      temperature: 0.1,
      system:
        'Return strict JSON with keys summary, sectionInsights object, fairnessFindings array, riskFindings array. No markdown fences.',
      messages: [
        {
          role: 'user',
          content: `Document sections: ${DOCUMENT_SECTIONS.join('; ')}\n\nDocument:\n${text}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude request failed (${response.status})`);
  }

  const body = await response.json();
  const textBlock = Array.isArray(body?.content)
    ? body.content.find((entry) => entry?.type === 'text')?.text || ''
    : '';
  return parseModelJson(textBlock);
}

async function runModelAnalysis(text) {
  if (hasOpenAiKey()) {
    try {
      const payload = await callOpenAiAnalysis(text);
      if (payload) {
        return {
          provider: 'openai',
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          payload,
        };
      }
    } catch {
      // fall through to Claude/heuristic
    }
  }

  if (hasClaudeKey()) {
    try {
      const payload = await callClaudeAnalysis(text);
      if (payload) {
        return {
          provider: 'claude',
          model: process.env.CLAUDE_MODEL || 'claude-3-5-haiku-latest',
          payload,
        };
      }
    } catch {
      // fall through to heuristic
    }
  }

  return {
    provider: 'heuristic',
    model: 'heuristic-v1',
    payload: null,
  };
}

async function storeAnalysis(payload) {
  const record = {
    id: payload.id || crypto.randomUUID(),
    case_id: normalizeCaseId(payload.case_id),
    document_id: payload.document_id || null,
    created_by: payload.created_by || null,
    provider: payload.provider,
    model: payload.model,
    section_results: payload.section_results,
    fairness_result: payload.fairness_result,
    risk_result: payload.risk_result,
    summary: payload.summary || null,
    status: payload.status || 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!supabase) {
    memory.analyses.set(record.id, record);
    return record;
  }

  try {
    const row = await trySupabaseInsert('analyses', record);
    return row || record;
  } catch {
    memory.analyses.set(record.id, record);
    return record;
  }
}

async function getAnalysis(analysisId) {
  try {
    const row = await trySupabaseSelectSingle('analyses', { id: analysisId });
    if (row) return row;
  } catch {
    // ignore and use in-memory fallback
  }
  return memory.analyses.get(analysisId) || null;
}

async function storeRiskAssessment(payload) {
  const record = {
    id: payload.id || crypto.randomUUID(),
    case_id: normalizeCaseId(payload.case_id),
    analysis_id: payload.analysis_id || null,
    assessed_by: payload.assessed_by || null,
    risk_score: payload.risk_score,
    risk_level: payload.risk_level,
    escalation_required: Boolean(payload.escalation_required),
    factors: payload.factors || [],
    computed_at: new Date().toISOString(),
  };

  if (!supabase) {
    memory.risks.set(record.id, record);
    return record;
  }

  try {
    const row = await trySupabaseInsert('risk_assessments', record);
    return row || record;
  } catch {
    memory.risks.set(record.id, record);
    return record;
  }
}

async function logEvent(payload) {
  const record = {
    id: payload.id || crypto.randomUUID(),
    case_id: normalizeCaseId(payload.case_id),
    document_id: payload.document_id || null,
    analysis_id: payload.analysis_id || null,
    actor_user_id: payload.actor_user_id || null,
    event_type: payload.event_type,
    event_payload: payload.event_payload || {},
    created_at: new Date().toISOString(),
  };

  try {
    await trySupabaseInsert('events', record);
  } catch {
    // No-op when local fallback is used.
  }

  try {
    await trySupabaseInsert('audit_logs', {
      case_id: record.case_id,
      actor_user_id: payload.actor_user_id || null,
      action: record.event_type,
      resource_type: payload.resource_type || 'document_pipeline',
      resource_id: payload.resource_id || record.document_id || record.analysis_id || null,
      details: record.event_payload || {},
    });
  } catch {
    // No-op when local fallback is used.
  }
}

async function buildAnalysisPayload(text) {
  const model = await runModelAnalysis(text);
  const fairness = heuristicFairness(text);
  const risk = heuristicRisk(text);

  return {
    provider: model.provider,
    model: model.model,
    summary:
      model.payload?.summary ||
      `Automated analysis generated for ${text.length} characters using ${model.provider} processing.`,
    section_results: buildSectionResults(text, model.payload),
    fairness_result: {
      score: fairness.fairnessScore,
      bias_indicators: fairness.biasIndicators,
      framing_concerns: fairness.framingConcerns,
      recommendations: fairness.recommendations,
    },
    risk_result: {
      risk_score: risk.riskScore,
      risk_level: risk.riskLevel,
      escalation_required: risk.escalationRequired,
      factors: risk.factors,
    },
  };
}

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    return sendJson(res, 200, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      providers: {
        openai: hasOpenAiKey(),
        claude: hasClaudeKey(),
      },
      storage: supabase ? 'supabase' : 'memory',
    });
  }

  if (req.method === 'GET' && url.pathname === '/documents/intelligence/schema') {
    return sendJson(res, 200, {
      schemaVersion: '2026-09-11',
      sections: DOCUMENT_SECTIONS,
      totalSections: DOCUMENT_SECTIONS.length,
      pipeline: ['upload', 'parse', 'analyze', 'store', 'escalate'],
      timestamp: new Date().toISOString(),
    });
  }

  if (req.method === 'POST' && url.pathname === '/documents/upload') {
    const request = await parseBody(req);
    const body = request.json;

    if (!body.caseId) {
      return sendJson(res, 400, { error: { code: 'BAD_REQUEST', message: 'caseId is required' } });
    }

    const parsedText = decodeUploadText(body);
    const document = await storeDocument({
      case_id: body.caseId,
      uploaded_by: body.uploadedBy,
      file_name: body.fileName || `upload-${Date.now()}.txt`,
      mime_type: body.mimeType || 'text/plain',
      storage_path: body.storagePath || null,
      parsed_text: parsedText,
      processing_status: 'uploaded',
    });

    await logEvent({
      case_id: document.case_id,
      document_id: document.id,
      actor_user_id: body.uploadedBy || null,
      event_type: 'document_uploaded',
      event_payload: {
        file_name: document.file_name,
        mime_type: document.mime_type,
        text_length: parsedText.length,
      },
      resource_type: 'document',
      resource_id: document.id,
    });

    return sendJson(res, 201, {
      documentId: document.id,
      caseId: document.case_id,
      fileName: document.file_name,
      textLength: parsedText.length,
      status: document.processing_status,
      uploadedAt: document.created_at,
    });
  }

  if (req.method === 'POST' && url.pathname === '/documents/process') {
    const request = await parseBody(req);
    const body = request.json;

    const documentId = body.documentId || null;
    let sourceDocument = null;
    let text = typeof body.text === 'string' ? body.text : '';
    let caseId = normalizeCaseId(body.caseId);

    if (documentId) {
      sourceDocument = await getDocument(documentId);
      if (sourceDocument) {
        text = text || sourceDocument.parsed_text || '';
        caseId = caseId || sourceDocument.case_id;
        await updateDocument(documentId, { processing_status: 'processing' });
      } else if (!text.trim()) {
        text = 'Document uploaded without extracted text. Add source text for richer analysis.';
      }
    }

    if (!text.trim()) {
      return sendJson(res, 400, { error: { code: 'BAD_REQUEST', message: 'No document text available for analysis' } });
    }

    const analysis = await buildAnalysisPayload(text);
    const storedAnalysis = await storeAnalysis({
      case_id: caseId,
      document_id: sourceDocument?.id || documentId,
      created_by: body.requestedBy || null,
      provider: analysis.provider,
      model: analysis.model,
      section_results: analysis.section_results,
      fairness_result: analysis.fairness_result,
      risk_result: analysis.risk_result,
      summary: analysis.summary,
      status: 'completed',
    });

    if (documentId) {
      await updateDocument(documentId, {
        processing_status: 'completed',
      });
    }

    const riskRecord = await storeRiskAssessment({
      case_id: caseId,
      analysis_id: storedAnalysis.id,
      assessed_by: body.requestedBy || null,
      risk_score: analysis.risk_result.risk_score,
      risk_level: analysis.risk_result.risk_level,
      escalation_required: analysis.risk_result.escalation_required,
      factors: analysis.risk_result.factors,
    });

    await logEvent({
      case_id: caseId,
      document_id: sourceDocument?.id || documentId,
      analysis_id: storedAnalysis.id,
      actor_user_id: body.requestedBy || null,
      event_type: 'document_processed',
      event_payload: {
        provider: analysis.provider,
        model: analysis.model,
        risk_level: analysis.risk_result.risk_level,
      },
      resource_type: 'analysis',
      resource_id: storedAnalysis.id,
    });

    let escalationTriggered = false;
    if (analysis.risk_result.escalation_required && caseId) {
      escalationTriggered = true;
      await logEvent({
        case_id: caseId,
        analysis_id: storedAnalysis.id,
        actor_user_id: body.requestedBy || null,
        event_type: 'risk_escalation_triggered',
        event_payload: {
          risk_level: analysis.risk_result.risk_level,
          risk_score: analysis.risk_result.risk_score,
          factors: analysis.risk_result.factors,
        },
        resource_type: 'risk_assessment',
        resource_id: riskRecord.id,
      });
    }

    return sendJson(res, 200, {
      analysisId: storedAnalysis.id,
      riskAssessmentId: riskRecord.id,
      caseId,
      documentId: sourceDocument?.id || documentId || null,
      provider: analysis.provider,
      model: analysis.model,
      summary: analysis.summary,
      sectionResults: analysis.section_results,
      fairness: analysis.fairness_result,
      risk: analysis.risk_result,
      escalationTriggered,
      processedAt: storedAnalysis.created_at,
    });
  }

  if (req.method === 'GET' && /^\/analyses\/[^/]+$/.test(url.pathname)) {
    const analysisId = decodeURIComponent(url.pathname.split('/')[2]);
    const analysis = await getAnalysis(analysisId);

    if (!analysis) {
      return sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'Analysis not found' } });
    }

    return sendJson(res, 200, {
      id: analysis.id,
      caseId: analysis.case_id,
      documentId: analysis.document_id,
      provider: analysis.provider,
      model: analysis.model,
      summary: analysis.summary,
      sectionResults: analysis.section_results,
      fairness: analysis.fairness_result,
      risk: analysis.risk_result,
      status: analysis.status,
      createdAt: analysis.created_at,
      updatedAt: analysis.updated_at,
    });
  }

  if (req.method === 'POST' && url.pathname === '/analyses/compare') {
    const request = await parseBody(req);
    const body = request.json;

    const analysisIds = Array.isArray(body.analysisIds) ? body.analysisIds.filter(Boolean) : [];
    const textInputs = Array.isArray(body.texts) ? body.texts.filter((v) => typeof v === 'string' && v.trim()) : [];

    const analyses = [];

    for (const id of analysisIds) {
      const result = await getAnalysis(id);
      if (result) analyses.push(result);
    }

    for (const text of textInputs) {
      const payload = await buildAnalysisPayload(text);
      analyses.push({
        id: requestId('tmp'),
        summary: payload.summary,
        section_results: payload.section_results,
        fairness_result: payload.fairness_result,
        risk_result: payload.risk_result,
      });
    }

    if (analyses.length < 2) {
      return sendJson(res, 400, {
        error: {
          code: 'BAD_REQUEST',
          message: 'Provide at least two analyses or text entries to compare',
        },
      });
    }

    const keywordSets = analyses.map((entry) =>
      new Set(extractKeywords(`${entry.summary || ''} ${JSON.stringify(entry.section_results || [])}`)),
    );

    const sharedKeywords = Array.from(keywordSets[0]).filter((keyword) =>
      keywordSets.every((set) => set.has(keyword)),
    );

    const fairnessScores = analyses.map((entry) => entry.fairness_result?.score ?? 100);
    const riskScores = analyses.map((entry) => entry.risk_result?.risk_score ?? 0);

    return sendJson(res, 200, {
      comparedCount: analyses.length,
      sharedKeywords,
      fairness: {
        minScore: Math.min(...fairnessScores),
        maxScore: Math.max(...fairnessScores),
        delta: Math.max(...fairnessScores) - Math.min(...fairnessScores),
      },
      risk: {
        minScore: Math.min(...riskScores),
        maxScore: Math.max(...riskScores),
        delta: Math.max(...riskScores) - Math.min(...riskScores),
      },
      analysisIds: analyses.map((entry) => entry.id),
      timestamp: new Date().toISOString(),
    });
  }

  if (req.method === 'POST' && url.pathname === '/risk-assessment/compute') {
    const request = await parseBody(req);
    const body = request.json;

    let text = typeof body.text === 'string' ? body.text : '';
    let analysis = null;

    if (body.analysisId) {
      analysis = await getAnalysis(body.analysisId);
      if (!analysis) {
        return sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'Analysis not found' } });
      }
      text = text || `${analysis.summary || ''} ${JSON.stringify(analysis.section_results || [])}`;
    }

    if (!text.trim()) {
      return sendJson(res, 400, { error: { code: 'BAD_REQUEST', message: 'text or analysisId is required' } });
    }

    const risk = heuristicRisk(text);
    const stored = await storeRiskAssessment({
      case_id: body.caseId || analysis?.case_id || null,
      analysis_id: analysis?.id || body.analysisId || null,
      assessed_by: body.assessedBy || null,
      risk_score: risk.riskScore,
      risk_level: risk.riskLevel,
      escalation_required: risk.escalationRequired,
      factors: risk.factors,
    });

    if (risk.escalationRequired && (body.caseId || analysis?.case_id)) {
      await logEvent({
        case_id: body.caseId || analysis?.case_id,
        analysis_id: analysis?.id || body.analysisId || null,
        actor_user_id: body.assessedBy || null,
        event_type: 'risk_escalation_triggered',
        event_payload: {
          risk_level: risk.riskLevel,
          risk_score: risk.riskScore,
          factors: risk.factors,
        },
        resource_type: 'risk_assessment',
        resource_id: stored.id,
      });
    }

    return sendJson(res, 200, {
      riskAssessmentId: stored.id,
      caseId: stored.case_id,
      analysisId: stored.analysis_id,
      riskScore: stored.risk_score,
      riskLevel: stored.risk_level,
      escalationRequired: stored.escalation_required,
      factors: stored.factors,
      computedAt: stored.computed_at,
    });
  }

  if (req.method === 'POST' && url.pathname === '/documents/analyze') {
    const id = requestId('req');
    const request = await parseBody(req);
    const body = request.json;

    if (!hasOpenAiKey()) {
      return sendJson(res, 503, {
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'OpenAI API key not configured on server.',
          requestId: id,
        },
      });
    }

    const text = typeof body.text === 'string' ? body.text : '';
    const model = await runModelAnalysis(text);
    const fairness = heuristicFairness(text);

    return sendJson(res, 200, {
      analysis_id: id,
      provider: model.provider,
      model: model.model,
      textLength: text.length,
      sections_detected: buildSectionResults(text, model.payload)
        .filter((entry) => entry.status === 'detected')
        .slice(0, 8)
        .map((entry) => entry.section),
      fairness_score: fairness.fairnessScore,
      timestamp: new Date().toISOString(),
    });
  }

  if (req.method === 'POST' && url.pathname === '/documents/analyze/fairness') {
    const request = await parseBody(req);
    const body = request.json;
    const id = requestId('fair');
    const fairness = heuristicFairness(typeof body.text === 'string' ? body.text : '');

    return sendJson(res, 200, {
      analysis_id: id,
      fairness_score: fairness.fairnessScore,
      bias_indicators: fairness.biasIndicators,
      coercion_flags: [],
      discrimination_risks: [],
      framing_concerns: fairness.framingConcerns,
      unrealistic_expectations: [],
      remediation_recommendations: fairness.recommendations,
      limitations: 'Algorithmic heuristic check. Human supervisory review required.',
      timestamp: new Date().toISOString(),
    });
  }

  return notFound(res);
});

server.listen(PORT, () => {
  console.log(`SafeSteps native backend listening on port ${PORT}`);
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
