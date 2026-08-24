const templates = {
  CHILD_ABUSE_DISCLOSURE: { key: "child_abuse_disclosure", heading: "Immediate child safety", acknowledgement: "Thank you for telling me. I believe you. It is not your fault.", followUp: "Are you safe right now?", steps: ["Do not ask the child to repeat details in this chat.", "Involve a safe adult or child-protection service now.", "Call 000 if anyone is in immediate danger."] },
  SELF_HARM: { key: "self_harm_warning", heading: "Get support with you now", acknowledgement: "I’m really glad you told me. I want to check your safety right now.", followUp: "Are you thinking about hurting yourself right now?", steps: ["Stay with a trusted adult and move away from anything you could use to hurt yourself.", "Call Lifeline on 13 11 14, or 000 if there is immediate danger.", "Do not stay alone while the risk is immediate."] },
  CHILD_HARM: { key: "parent_may_hurt_child", heading: "Create distance now", acknowledgement: "I’m really glad you said this. Treat this as urgent.", followUp: "Can you move away from the child right now?", steps: ["Put the child with another safe, sober adult immediately.", "Move away from weapons and do not drive.", "Call 000 if you think you may act or cannot keep the child safe."] },
  IMPAIRED_CARE: { key: "intoxicated_with_child_present", heading: "Arrange sober care now", acknowledgement: "You cannot safely care for a child while intoxicated. The only goal right now is a safe handoff.", followUp: "Is there a sober adult who can take over now?", steps: ["Do not drive.", "Ask a safe, sober adult to take over immediately.", "Call 000 if safe care cannot be arranged and the child is in danger."] },
  FAMILY_VIOLENCE: { key: "active_dv_danger", heading: "Your safety comes first", acknowledgement: "If you are in immediate danger, call 000 now.", followUp: "Is it safe to keep chatting here right now?", steps: ["Do not confront the abusive person or announce plans to leave.", "Use a safer device or private space if your device may be monitored.", "Contact 1800RESPECT on 1800 737 732 when it is safe."] },
  DV_MONITORED_DEVICE: { key: "dv_monitored_device_risk", heading: "Keep this brief", acknowledgement: "Someone may be monitoring your device, so I will keep this short.", followUp: "Can you switch to a safer device or private space?", steps: ["Avoid writing escape plans or identifying details here.", "Close this screen if continuing could increase danger.", "Use 000 for immediate danger when it is safe to do so."] },
  CRITICAL_UNCLEAR: { key: "critical_critical_unclear", heading: "Focus on immediate safety", acknowledgement: "I’m glad you told me. I want to focus on immediate safety first.", followUp: "Is anyone in immediate danger right now?", steps: ["Move away from weapons, driving, substances, or confrontation if safe.", "Get a trusted safe adult involved now.", "Call 000 if anyone is in immediate danger."] },
};

export function getCriticalResponseTemplate(ruleIds = [], message = "") {
  if (ruleIds.includes("FAMILY_VIOLENCE") && /monitor|track|checks? my (phone|device)/i.test(message)) return templates.DV_MONITORED_DEVICE;
  return templates[ruleIds[0]] ?? templates.CRITICAL_UNCLEAR;
}

export function buildCriticalResponse(ruleIds, message) {
  const template = getCriticalResponseTemplate(ruleIds, message);
  return { templateKey: template.key, reply: { heading: template.heading, acknowledgement: template.acknowledgement, steps: [...template.steps], followUp: template.followUp } };
}

export const CRITICAL_RESPONSE_TEMPLATES = Object.freeze(Object.values(templates));
