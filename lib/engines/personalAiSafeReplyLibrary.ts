import type { PersonalAiFlowState, PersonalAiRiskLevel } from "./personalAiSupportTypes";

export type SafeReplyFlowId =
  | "supervised_visit_preparation" | "child_refuses_contact" | "child_says_i_hate_you"
  | "parent_yelled" | "parent_missed_visit" | "parent_relapsed" | "parent_may_hurt_child"
  | "parent_intoxicated_with_child_present" | "parent_experiencing_dv" | "parent_accused_unsafe"
  | "parent_wants_to_blame_other_caregiver" | "child_discloses_abuse" | "child_self_harm_warning"
  | "caseworker_meeting_prep" | "court_case_plan_goal_planning";

export interface SafeReplyTemplate {
  id: string;
  flowId: SafeReplyFlowId;
  riskLevel: PersonalAiRiskLevel;
  states: PersonalAiFlowState[];
  reply: string;
  followUpQuestion?: string;
  safetyInstruction?: string;
  closingLine: string;
}

export const SAFE_REPLY_RULES = {
  maxSentences: 4,
  maxQuestions: 1,
  never: ["diagnose", "predict legal outcomes", "promise secrecy", "investigate abuse", "coach concealment", "imply automatic emergency dispatch"],
} as const;

export const PERSONAL_AI_SAFE_REPLIES: SafeReplyTemplate[] = [
  { id: "visit-prep", flowId: "supervised_visit_preparation", riskLevel: "low", states: ["start", "reflect", "support"], reply: "Let’s make this visit calm and child-centred. The goal is connection, not perfection.", followUpQuestion: "What usually makes visits harder for you?", closingLine: "One small plan is enough." },
  { id: "contact-boundary", flowId: "child_refuses_contact", riskLevel: "low", states: ["start", "support"], reply: "You do not have to force a hug, touch, or conversation. Let the child set the pace.", followUpQuestion: "Would sitting nearby, waving, or drawing feel lower-pressure?", closingLine: "Respecting ‘no’ builds safety." },
  { id: "child-angry", flowId: "child_says_i_hate_you", riskLevel: "low", states: ["start", "support"], reply: "Hearing that is painful. Don’t argue with the feeling.", followUpQuestion: "Would you like one calm sentence to say back?", closingLine: "Stay calm and keep the door open." },
  { id: "yelling-repair", flowId: "parent_yelled", riskLevel: "medium", states: ["start", "reflect", "support"], reply: "The next step is repair, not defence. Try: ‘I raised my voice. That wasn’t okay. I’m sorry, and I’m calming down now.’", followUpQuestion: "Is the child physically safe right now?", closingLine: "Keep the repair brief." },
  { id: "missed-visit", flowId: "parent_missed_visit", riskLevel: "medium", states: ["start", "support"], reply: "The safest response is honest accountability without excuses.", followUpQuestion: "What is one practical change that could prevent the next miss?", closingLine: "Focus on what changes next." },
  { id: "relapse", flowId: "parent_relapsed", riskLevel: "high", states: ["start", "safety_check", "support"], reply: "Thank you for being honest. Right now the priority is safe care, not shame.", followUpQuestion: "Is a child relying on you for care right now?", safetyInstruction: "Do not drive or supervise alone while impaired; involve sober support.", closingLine: "Get real-world support now." },
  { id: "child-harm", flowId: "parent_may_hurt_child", riskLevel: "critical", states: ["start", "safety_check", "escalate"], reply: "I’m glad you said this. This is urgent.", followUpQuestion: "Can you move away from the child right now?", safetyInstruction: "Get a safe adult involved immediately and call Triple Zero if safety cannot be maintained.", closingLine: "This is a safety moment, not a coaching moment." },
  { id: "impaired-care", flowId: "parent_intoxicated_with_child_present", riskLevel: "critical", states: ["start", "safety_check", "escalate"], reply: "You cannot safely supervise a child while intoxicated.", followUpQuestion: "Can a sober adult take over now?", safetyInstruction: "Do not drive; call Triple Zero if safe care cannot be arranged.", closingLine: "Sober care is the only goal now." },
  { id: "dv", flowId: "parent_experiencing_dv", riskLevel: "high", states: ["start", "safety_check", "support", "escalate"], reply: "I’m sorry this is happening. Your safety and privacy come first.", followUpQuestion: "Is it safe to keep using this device?", safetyInstruction: "Do not confront the abusive person; call Triple Zero for immediate danger.", closingLine: "Use a safer device if possible." },
  { id: "unsafe-allegation", flowId: "parent_accused_unsafe", riskLevel: "medium", states: ["start", "clarify", "support"], reply: "Let’s stay factual and focused on the child’s safety.", followUpQuestion: "What specific incident or behaviour was raised?", closingLine: "Focus on observable facts and next actions." },
  { id: "blame-redirect", flowId: "parent_wants_to_blame_other_caregiver", riskLevel: "medium", states: ["start", "support"], reply: "Let’s focus on what you can control and what keeps the child safe.", followUpQuestion: "What is one action you can take today?", closingLine: "Keep the next step child-centred." },
  { id: "abuse-disclosure", flowId: "child_discloses_abuse", riskLevel: "critical", states: ["start", "safety_check", "escalate"], reply: "Thank you for telling me. I believe you. It is not your fault.", followUpQuestion: "Are you safe right now?", safetyInstruction: "Involve a safe adult or safeguarding service; do not investigate or ask for repeated details.", closingLine: "You do not need to repeat everything here." },
  { id: "self-harm", flowId: "child_self_harm_warning", riskLevel: "critical", states: ["start", "safety_check", "escalate"], reply: "I’m glad you told me. I want to check safety right now.", followUpQuestion: "Are you thinking about hurting yourself right now?", safetyInstruction: "Stay with a trusted adult and call Triple Zero or crisis support for immediate risk.", closingLine: "A safe adult needs to be with you." },
  { id: "meeting-prep", flowId: "caseworker_meeting_prep", riskLevel: "low", states: ["start", "support"], reply: "Let’s prepare one short list of updates, documents, and questions.", followUpQuestion: "What do you most want clarified at the meeting?", closingLine: "One page of notes is enough." },
  { id: "goal-plan", flowId: "court_case_plan_goal_planning", riskLevel: "low", states: ["start", "support"], reply: "Let’s make the goal specific, realistic, child-centred, and measurable.", followUpQuestion: "What is the first goal you need to work on?", closingLine: "Define what, how often, by when, and how it is verified." },
];

export function getPersonalAiSafeReply(flowId: SafeReplyFlowId, state: PersonalAiFlowState, riskLevel: PersonalAiRiskLevel) {
  return PERSONAL_AI_SAFE_REPLIES.find((item) => item.flowId === flowId && item.riskLevel === riskLevel && item.states.includes(state));
}

export function getPersonalAiFallbackReply(riskLevel: PersonalAiRiskLevel) {
  if (riskLevel === "critical") return "I’m glad you told me. Focus on immediate safety. Call Triple Zero or involve a trusted safe adult now if anyone is in danger.";
  if (riskLevel === "high") return "Thank you for telling me. Let’s focus on the safest next step and real-world support.";
  return "Let’s take this one safe step at a time.";
}
