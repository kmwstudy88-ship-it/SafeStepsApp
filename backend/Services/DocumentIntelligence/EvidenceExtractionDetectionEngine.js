const LIMITATIONS =
  "This tool supports human review. Final determinations remain with decision-makers.";

const DATE_PATTERNS = [
  /\b(20\d{2}-\d{2}-\d{2})\b/g,
  /\b(\d{1,2}\/\d{1,2}\/20\d{2})\b/g,
  /\b(\d{1,2} (?:January|February|March|April|May|June|July|August|September|October|November|December) 20\d{2})\b/gi,
];

const EVENT_KEYWORDS = [
  [/\b(?:disclosure|disclosed|told (?:the )?(?:counsellor|worker|police|teacher))\b/gi, "disclosure"],
  [/\b(?:home visit|visited the home|visited the family)\b/gi, "home_visit"],
  [/\b(?:referral|referred to|case (?:opened|closed|allocated))\b/gi, "case_management"],
  [/\b(?:assessment|assessed|evaluation|evaluated)\b/gi, "assessment"],
  [/\b(?:incident|altercation|fight|argument)\b/gi, "incident"],
  [/\b(?:court|hearing|order|judgment|magistrate)\b/gi, "court_event"],
  [/\b(?:hospital|emergency|A&E|admitted)\b/gi, "medical_event"],
  [/\b(?:school|teacher|principal|counsellor at school)\b/gi, "school_event"],
];

const ROLE_PATTERNS = [
  [/\b(?:mother|mum|mom|maternal)\b/gi, "Mother"],
  [/\b(?:father|dad|paternal)\b/gi, "Father"],
  [/\b(?:child|children|minor)\b/gi, "Child"],
  [/\b(?:caseworker|social worker|child protection worker|CPO)\b/gi, "Caseworker"],
  [/\b(?:counsellor|therapist|psychologist|psychiatrist)\b/gi, "Clinician"],
  [/\b(?:police|officer|constable|detective)\b/gi, "Police"],
  [/\b(?:teacher|principal|educator)\b/gi, "Educator"],
  [/\b(?:GP|doctor|physician|nurse|paediatrician)\b/gi, "Medical Professional"],
];

const CONCERN_PATTERNS = [
  [/\b(?:domestic violence|family violence|physical assault|violence in the home)\b/gi, "Domestic/family violence", "high"],
  [/\b(?:neglect|neglected|inadequate supervision|unsupervised)\b/gi, "Child neglect", "high"],
  [/\b(?:drug|substance|alcohol|intoxicated)\b/gi, "Substance use concern", "high"],
  [/\b(?:mental health|depression|anxiety|psychosis|hospitalised for mental)\b/gi, "Mental health concern", "medium"],
  [/\b(?:housing instability|homelessness|evicted|unstable accommodation)\b/gi, "Housing instability", "medium"],
  [/\b(?:financial stress|debt|unable to pay|poverty)\b/gi, "Financial stress", "low"],
  [/\b(?:school refusal|not attending school|truancy)\b/gi, "School attendance concern", "medium"],
];

const SERVICE_PATTERNS = [
  [/\b(?:family support service|family services)\b/gi, "Family support"],
  [/\b(?:counselling|therapy|psychological support)\b/gi, "Counselling"],
  [/\b(?:drug and alcohol|substance abuse program)\b/gi, "Drug & alcohol program"],
  [/\b(?:parenting program|parenting class|parenting course)\b/gi, "Parenting program"],
  [/\b(?:domestic violence service|DV support|refuge|shelter)\b/gi, "DV support service"],
  [/\b(?:housing support|emergency accommodation)\b/gi, "Housing support"],
];

const EVIDENCE_REFERENCE_PATTERNS = [
  [/\bpolice (?:report|record|statement)\b/gi, "Police report", "retrieve_from_police"],
  [/\b(?:medical record|GP notes|hospital record)\b/gi, "Medical record", "retrieve_from_health_provider"],
  [/\b(?:school record|attendance record|teacher report)\b/gi, "School record", "retrieve_from_school"],
  [/\b(?:psychological assessment|psychiatry report)\b/gi, "Psychological assessment", "retrieve_from_clinician"],
  [/\b(?:financial record|bank statement|Centrelink)\b/gi, "Financial record", "request_from_client"],
];

export function normalizeExtractionText(text) {
  if (typeof text !== "string") throw new Error("Evidence extraction requires text.");
  const normalized = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  if (!normalized) throw new Error("Evidence extraction requires non-empty text.");
  return normalized;
}

export function extractEvidence(text, _caseContext = null) {
  const source = normalizeExtractionText(text);

  const extracted_dates = extractDates(source);
  const extracted_events = extractEvents(source);
  const extracted_people = extractPeople(source);
  const extracted_concerns = extractConcerns(source);
  const extracted_services = extractServices(source);
  const extracted_locations = extractLocations(source);
  const evidence_registry = extractEvidenceRegistry(source);
  const extracted_facts = buildExtractedFacts(source, extracted_events, extracted_concerns);
  const unstructured_gaps = findUnstructuredGaps(source);
  const confidence_scores = buildConfidenceScores({ extracted_dates, extracted_events, extracted_people, extracted_concerns, extracted_services });

  return {
    extracted_facts,
    extracted_dates,
    extracted_events,
    extracted_people,
    extracted_locations,
    extracted_concerns,
    extracted_services,
    evidence_registry,
    confidence_scores,
    unstructured_gaps,
    limitations: LIMITATIONS,
    timestamp: new Date().toISOString(),
  };
}

function extractDates(text) {
  const dates = [];
  const seen = new Set();
  for (const pattern of DATE_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    let match = re.exec(text);
    while (match) {
      const dateStr = match[1] ?? match[0];
      if (!seen.has(dateStr)) {
        seen.add(dateStr);
        const context = text.slice(Math.max(0, match.index - 60), Math.min(text.length, match.index + 60));
        dates.push({ event: inferEventFromContext(context), date: dateStr, confidence: 0.85 });
      }
      match = re.exec(text);
    }
  }
  return dates;
}

function inferEventFromContext(context) {
  for (const [pattern, label] of EVENT_KEYWORDS) {
    const re = new RegExp(pattern.source, pattern.flags);
    if (re.test(context)) return label.replace(/_/g, " ");
  }
  return "document event";
}

function extractEvents(text) {
  const events = [];
  for (const [pattern, eventType] of EVENT_KEYWORDS) {
    const re = new RegExp(pattern.source, pattern.flags);
    let match = re.exec(text);
    while (match) {
      const context = text.slice(Math.max(0, match.index - 60), Math.min(text.length, match.index + match[0].length + 80)).trim();
      const dateFound = findNearestDate(text, match.index) ?? "date not specified";
      events.push({ type: eventType, date: dateFound, participant: inferParticipant(context), description: context.slice(0, 150), confidence: 0.75 });
      match = re.exec(text);
    }
    pattern.lastIndex = 0;
  }
  return events.slice(0, 20);
}

function findNearestDate(text, index) {
  const window = text.slice(Math.max(0, index - 100), Math.min(text.length, index + 100));
  for (const pattern of DATE_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    const match = re.exec(window);
    if (match) return match[1] ?? match[0];
  }
  return null;
}

function inferParticipant(context) {
  for (const [pattern, role] of ROLE_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    if (re.test(context)) return role;
  }
  return "Unknown participant";
}

function extractPeople(text) {
  const people = [];
  for (const [pattern, role] of ROLE_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    const matches = [];
    let match = re.exec(text);
    while (match) { matches.push(match[0]); match = re.exec(text); }
    if (matches.length > 0) {
      people.push({ name: role, role, mentions: matches.length, confidence: Math.min(0.95, 0.5 + matches.length * 0.1) });
    }
  }
  return people;
}

function extractConcerns(text) {
  const concerns = [];
  for (const [pattern, concern, severity] of CONCERN_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    let match = re.exec(text);
    if (match) {
      const evidence = text.slice(Math.max(0, match.index - 40), Math.min(text.length, match.index + match[0].length + 80)).trim();
      concerns.push({ concern, severity, evidence: evidence.slice(0, 200) });
    }
    pattern.lastIndex = 0;
  }
  return concerns;
}

function extractServices(text) {
  const services = [];
  for (const [pattern, service] of SERVICE_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    if (re.test(text)) {
      re.lastIndex = 0;
      const status = /\b(?:completed|finished|attended|engaged with)\b/i.test(text) ? "completed" : "mentioned";
      const dateFound = findNearestDate(text, 0) ?? "date not specified";
      services.push({ service, status, date: dateFound });
    }
  }
  return services;
}

function extractLocations(text) {
  const locations = [];
  const seen = new Set();
  const patterns = [
    /\b(?:at|in|to|from) (the (?:home|house|school|hospital|clinic|office|court|shelter|refuge))\b/gi,
    /\b\d+ \w+ (?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Place|Pl|Court|Ct)\b/gi,
  ];
  for (const pattern of patterns) {
    let match = pattern.exec(text);
    while (match) {
      const loc = (match[1] ?? match[0]).trim();
      if (!seen.has(loc.toLowerCase())) { seen.add(loc.toLowerCase()); locations.push(loc); }
      match = pattern.exec(text);
    }
  }
  return locations.slice(0, 10);
}

function extractEvidenceRegistry(text) {
  const registry = [];
  for (const [pattern, item, action] of EVIDENCE_REFERENCE_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    if (re.test(text)) registry.push({ referenced_item: item, status: "not_found_in_file", action });
  }
  return registry;
}

function buildExtractedFacts(text, events, concerns) {
  const facts = [];
  for (const event of events.slice(0, 5)) {
    facts.push({ type: event.type, claim: event.description.slice(0, 100), confidence: event.confidence, source_quote: event.description.slice(0, 150), document_source: "Provided document" });
  }
  for (const concern of concerns.slice(0, 5)) {
    facts.push({ type: "concern", claim: concern.concern, confidence: 0.7, source_quote: concern.evidence.slice(0, 150), document_source: "Provided document" });
  }
  if (facts.length === 0 && text.length > 100) {
    facts.push({ type: "narrative", claim: text.slice(0, 100).trim(), confidence: 0.5, source_quote: text.slice(0, 150).trim(), document_source: "Provided document" });
  }
  return facts;
}

function findUnstructuredGaps(text) {
  const gaps = [];
  if (text.length > 500 && !/\b(?:assessment|risk|safety plan)\b/gi.test(text)) {
    gaps.push({ section: "risk assessment", description: "No risk or safety assessment language detected in narrative." });
  }
  if (!/\b(?:plan|recommendation|next step|action)\b/gi.test(text)) {
    gaps.push({ section: "action plan", description: "No action plan or recommendations section detected." });
  }
  return gaps;
}

function buildConfidenceScores({ extracted_dates, extracted_events, extracted_people, extracted_concerns, extracted_services }) {
  return {
    dates: extracted_dates.length > 0 ? 0.85 : 0.0,
    events: extracted_events.length > 0 ? 0.75 : 0.0,
    people: extracted_people.length > 0 ? 0.80 : 0.0,
    concerns: extracted_concerns.length > 0 ? 0.78 : 0.0,
    services: extracted_services.length > 0 ? 0.70 : 0.0,
  };
}
