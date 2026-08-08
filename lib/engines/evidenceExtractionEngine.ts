export type ExtractionCaseContext = {
  case_type?: "reunification" | "custody" | "protection" | "intervention_order" | null;
  family_composition?: "single_parent" | "two_parent" | "multi_generational" | "other" | null;
  child_ages?: number[] | null;
};

export type ExtractedFact = {
  type: string;
  claim: string;
  confidence: number;
  source_quote: string;
  document_source: string;
};

export type ExtractedDate = {
  event: string;
  date: string;
  confidence: number;
};

export type ExtractedEvent = {
  type: string;
  date: string;
  participant: string;
  description: string;
  confidence: number;
};

export type ExtractedPerson = {
  name: string;
  role: string;
  mentions: number;
  confidence: number;
};

export type ExtractedConcern = {
  concern: string;
  severity: "low" | "medium" | "high";
  evidence: string;
};

export type ExtractedService = {
  service: string;
  status: string;
  date: string;
};

export type EvidenceRegistryItem = {
  referenced_item: string;
  status: "not_found_in_file" | "present" | "partial";
  action: string;
};

export type UnstructuredGap = {
  section: string;
  description: string;
};

export type EvidenceExtractionResult = {
  extracted_facts: ExtractedFact[];
  extracted_dates: ExtractedDate[];
  extracted_events: ExtractedEvent[];
  extracted_people: ExtractedPerson[];
  extracted_locations: string[];
  extracted_concerns: ExtractedConcern[];
  extracted_services: ExtractedService[];
  evidence_registry: EvidenceRegistryItem[];
  confidence_scores: Record<string, number>;
  unstructured_gaps: UnstructuredGap[];
  limitations: string;
  timestamp: string;
};

const LIMITATIONS =
  "This tool supports human review. Final determinations remain with decision-makers.";

const DATE_PATTERNS: RegExp[] = [
  /\b(20\d{2}-\d{2}-\d{2})\b/g,
  /\b(\d{1,2}\/\d{1,2}\/20\d{2})\b/g,
  /\b(\d{1,2} (?:January|February|March|April|May|June|July|August|September|October|November|December) 20\d{2})\b/gi,
];

const EVENT_KEYWORDS: Array<[RegExp, string]> = [
  [/\b(?:disclosure|disclosed|told (?:the )?(?:counsellor|worker|police|teacher))\b/gi, "disclosure"],
  [/\b(?:home visit|visited the home|visited the family)\b/gi, "home_visit"],
  [/\b(?:referral|referred to|case (?:opened|closed|allocated))\b/gi, "case_management"],
  [/\b(?:assessment|assessed|evaluation|evaluated)\b/gi, "assessment"],
  [/\b(?:incident|altercation|fight|argument)\b/gi, "incident"],
  [/\b(?:court|hearing|order|judgment|magistrate)\b/gi, "court_event"],
  [/\b(?:hospital|emergency|A&E|admitted)\b/gi, "medical_event"],
  [/\b(?:school|teacher|principal|counsellor at school)\b/gi, "school_event"],
];

const ROLE_PATTERNS: Array<[RegExp, string]> = [
  [/\b(?:mother|mum|mom|maternal)\b/gi, "Mother"],
  [/\b(?:father|dad|paternal)\b/gi, "Father"],
  [/\b(?:child|children|minor)\b/gi, "Child"],
  [/\b(?:caseworker|social worker|child protection worker|CPO)\b/gi, "Caseworker"],
  [/\b(?:counsellor|therapist|psychologist|psychiatrist)\b/gi, "Clinician"],
  [/\b(?:police|officer|constable|detective)\b/gi, "Police"],
  [/\b(?:teacher|principal|educator)\b/gi, "Educator"],
  [/\b(?:GP|doctor|physician|nurse|paediatrician)\b/gi, "Medical Professional"],
];

const CONCERN_PATTERNS: Array<[RegExp, string, "low" | "medium" | "high"]> = [
  [/\b(?:domestic violence|family violence|physical assault|violence in the home)\b/gi, "Domestic/family violence", "high"],
  [/\b(?:neglect|neglected|inadequate supervision|unsupervised)\b/gi, "Child neglect", "high"],
  [/\b(?:drug|substance|alcohol|intoxicated)\b/gi, "Substance use concern", "high"],
  [/\b(?:mental health|depression|anxiety|psychosis|hospitalised for mental)\b/gi, "Mental health concern", "medium"],
  [/\b(?:housing instability|homelessness|evicted|unstable accommodation)\b/gi, "Housing instability", "medium"],
  [/\b(?:financial stress|debt|unable to pay|poverty)\b/gi, "Financial stress", "low"],
  [/\b(?:school refusal|not attending school|truancy)\b/gi, "School attendance concern", "medium"],
];

const SERVICE_PATTERNS: Array<[RegExp, string]> = [
  [/\b(?:family support service|family services)\b/gi, "Family support"],
  [/\b(?:counselling|therapy|psychological support)\b/gi, "Counselling"],
  [/\b(?:drug and alcohol|substance abuse program)\b/gi, "Drug & alcohol program"],
  [/\b(?:parenting program|parenting class|parenting course)\b/gi, "Parenting program"],
  [/\b(?:domestic violence service|DV support|refuge|shelter)\b/gi, "DV support service"],
  [/\b(?:housing support|emergency accommodation)\b/gi, "Housing support"],
];

const EVIDENCE_REFERENCE_PATTERNS: Array<[RegExp, string, string]> = [
  [/\bpolice (?:report|record|statement)\b/gi, "Police report", "retrieve_from_police"],
  [/\bmedical record|GP notes|hospital record\b/gi, "Medical record", "retrieve_from_health_provider"],
  [/\bschool record|attendance record|teacher report\b/gi, "School record", "retrieve_from_school"],
  [/\bpsychological assessment|psychiatry report\b/gi, "Psychological assessment", "retrieve_from_clinician"],
  [/\bfinancial record|bank statement|Centrelink\b/gi, "Financial record", "request_from_client"],
];

export function normalizeExtractionText(text: string): string {
  if (typeof text !== "string") throw new Error("Evidence extraction requires text.");
  const normalized = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  if (!normalized) throw new Error("Evidence extraction requires non-empty text.");
  return normalized;
}

export function extractEvidence(
  text: string,
  _caseContext?: ExtractionCaseContext | null,
): EvidenceExtractionResult {
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
  const confidence_scores = buildConfidenceScores({
    extracted_dates,
    extracted_events,
    extracted_people,
    extracted_concerns,
    extracted_services,
  });

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

function extractDates(text: string): ExtractedDate[] {
  const dates: ExtractedDate[] = [];
  const seen = new Set<string>();

  for (const pattern of DATE_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    let match = re.exec(text);
    while (match) {
      const dateStr = match[1] ?? match[0];
      if (!seen.has(dateStr)) {
        seen.add(dateStr);
        const contextStart = Math.max(0, match.index - 60);
        const contextEnd = Math.min(text.length, match.index + 60);
        const context = text.slice(contextStart, contextEnd);
        dates.push({
          event: inferEventFromContext(context),
          date: dateStr,
          confidence: 0.85,
        });
      }
      match = re.exec(text);
    }
  }

  return dates;
}

function inferEventFromContext(context: string): string {
  for (const [pattern, label] of EVENT_KEYWORDS) {
    if (pattern.test(context)) {
      pattern.lastIndex = 0;
      return label.replace(/_/g, " ");
    }
    pattern.lastIndex = 0;
  }
  return "document event";
}

function extractEvents(text: string): ExtractedEvent[] {
  const events: ExtractedEvent[] = [];

  for (const [pattern, eventType] of EVENT_KEYWORDS) {
    const re = new RegExp(pattern.source, pattern.flags);
    let match = re.exec(text);
    while (match) {
      const contextStart = Math.max(0, match.index - 60);
      const contextEnd = Math.min(text.length, match.index + match[0].length + 80);
      const context = text.slice(contextStart, contextEnd).trim();
      const dateFound = findNearestDate(text, match.index);
      events.push({
        type: eventType,
        date: dateFound ?? "date not specified",
        participant: inferParticipant(context),
        description: context.slice(0, 150),
        confidence: 0.75,
      });
      match = re.exec(text);
    }
    pattern.lastIndex = 0;
  }

  return events.slice(0, 20);
}

function findNearestDate(text: string, index: number): string | null {
  const window = text.slice(Math.max(0, index - 100), Math.min(text.length, index + 100));
  for (const pattern of DATE_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    const match = re.exec(window);
    if (match) return match[1] ?? match[0];
  }
  return null;
}

function inferParticipant(context: string): string {
  for (const [pattern, role] of ROLE_PATTERNS) {
    if (pattern.test(context)) {
      pattern.lastIndex = 0;
      return role;
    }
    pattern.lastIndex = 0;
  }
  return "Unknown participant";
}

function extractPeople(text: string): ExtractedPerson[] {
  const people: ExtractedPerson[] = [];

  for (const [pattern, role] of ROLE_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    const matches: string[] = [];
    let match = re.exec(text);
    while (match) {
      matches.push(match[0]);
      match = re.exec(text);
    }
    if (matches.length > 0) {
      people.push({
        name: role,
        role,
        mentions: matches.length,
        confidence: Math.min(0.95, 0.5 + matches.length * 0.1),
      });
    }
  }

  return people;
}

function extractConcerns(text: string): ExtractedConcern[] {
  const concerns: ExtractedConcern[] = [];

  for (const [pattern, concern, severity] of CONCERN_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    let match = re.exec(text);
    if (match) {
      const contextStart = Math.max(0, match.index - 40);
      const contextEnd = Math.min(text.length, match.index + match[0].length + 80);
      const evidence = text.slice(contextStart, contextEnd).trim();
      concerns.push({ concern, severity, evidence: evidence.slice(0, 200) });
    }
    pattern.lastIndex = 0;
  }

  return concerns;
}

function extractServices(text: string): ExtractedService[] {
  const services: ExtractedService[] = [];

  for (const [pattern, service] of SERVICE_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    if (re.test(text)) {
      re.lastIndex = 0;
      const status = /\b(?:completed|finished|attended|engaged with)\b/i.test(text) ? "completed" : "mentioned";
      const dateFound = findNearestDate(text, text.search(re)) ?? "date not specified";
      services.push({ service, status, date: dateFound });
    }
  }

  return services;
}

function extractLocations(text: string): string[] {
  const locations: string[] = [];
  const locationPatterns: RegExp[] = [
    /\b(?:at|in|to|from) (the (?:home|house|school|hospital|clinic|office|court|shelter|refuge))\b/gi,
    /\b\d+ \w+ (?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Place|Pl|Court|Ct)\b/gi,
  ];
  const seen = new Set<string>();

  for (const pattern of locationPatterns) {
    let match = pattern.exec(text);
    while (match) {
      const loc = (match[1] ?? match[0]).trim();
      if (!seen.has(loc.toLowerCase())) {
        seen.add(loc.toLowerCase());
        locations.push(loc);
      }
      match = pattern.exec(text);
    }
  }

  return locations.slice(0, 10);
}

function extractEvidenceRegistry(text: string): EvidenceRegistryItem[] {
  const registry: EvidenceRegistryItem[] = [];

  for (const [pattern, item, action] of EVIDENCE_REFERENCE_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    if (re.test(text)) {
      registry.push({
        referenced_item: item,
        status: "not_found_in_file",
        action,
      });
    }
  }

  return registry;
}

function buildExtractedFacts(
  text: string,
  events: ExtractedEvent[],
  concerns: ExtractedConcern[],
): ExtractedFact[] {
  const facts: ExtractedFact[] = [];

  for (const event of events.slice(0, 5)) {
    facts.push({
      type: event.type,
      claim: event.description.slice(0, 100),
      confidence: event.confidence,
      source_quote: event.description.slice(0, 150),
      document_source: "Provided document",
    });
  }

  for (const concern of concerns.slice(0, 5)) {
    facts.push({
      type: "concern",
      claim: concern.concern,
      confidence: 0.7,
      source_quote: concern.evidence.slice(0, 150),
      document_source: "Provided document",
    });
  }

  if (facts.length === 0 && text.length > 100) {
    facts.push({
      type: "narrative",
      claim: text.slice(0, 100).trim(),
      confidence: 0.5,
      source_quote: text.slice(0, 150).trim(),
      document_source: "Provided document",
    });
  }

  return facts;
}

function findUnstructuredGaps(text: string): UnstructuredGap[] {
  const gaps: UnstructuredGap[] = [];

  if (text.length > 500 && !/\b(?:assessment|risk|safety plan)\b/gi.test(text)) {
    gaps.push({
      section: "risk assessment",
      description: "No risk or safety assessment language detected in narrative.",
    });
  }

  if (!/\b(?:plan|recommendation|next step|action)\b/gi.test(text)) {
    gaps.push({
      section: "action plan",
      description: "No action plan or recommendations section detected.",
    });
  }

  return gaps;
}

function buildConfidenceScores(input: {
  extracted_dates: ExtractedDate[];
  extracted_events: ExtractedEvent[];
  extracted_people: ExtractedPerson[];
  extracted_concerns: ExtractedConcern[];
  extracted_services: ExtractedService[];
}): Record<string, number> {
  return {
    dates: input.extracted_dates.length > 0 ? 0.85 : 0.0,
    events: input.extracted_events.length > 0 ? 0.75 : 0.0,
    people: input.extracted_people.length > 0 ? 0.80 : 0.0,
    concerns: input.extracted_concerns.length > 0 ? 0.78 : 0.0,
    services: input.extracted_services.length > 0 ? 0.70 : 0.0,
  };
}
