export type FlowRiskLevel = "LEVEL_1" | "LEVEL_2" | "LEVEL_3" | "LEVEL_4";
export type FlowMode = "reunification" | "boundaries" | "repair" | "accountability" | "emergency" | "aod_safety" | "dv_safety" | "refusal";

export type FamilyBridgeFlow = {
  id: `FB-FLOW-${string}`;
  version: "1.0";
  title: string;
  riskLevel: FlowRiskLevel;
  mode: FlowMode;
  triggerPatterns: RegExp[];
  escalationPatterns: RegExp[];
  intakeQuestions: string[];
  principle: string;
  immediateSteps: string[];
  scripts: Array<{ situation: string; words: string }>;
  avoid: string[];
  referral: string;
  memoryFields: string[];
  followUp: string;
};

export const familyBridgeFlowLibrary: FamilyBridgeFlow[] = [
  {
    id: "FB-FLOW-001", version: "1.0", title: "Supervised visit preparation", riskLevel: "LEVEL_2", mode: "reunification",
    triggerPatterns: [/supervised (visit|contact)/i, /prepare for (my )?visit/i, /seeing my child at contact/i],
    escalationPatterns: [/intoxicat|relaps|threat|confront|lose control|domestic violence/i],
    intakeQuestions: ["How old is your child?", "How long and what type of contact is planned?", "What rules must be followed?", "What are you most worried about?"],
    principle: "The goal is one more experience of the parent being calm, safe, predictable, child-centred, and respectful of boundaries.",
    immediateSteps: ["Review contact rules.", "Choose one simple child-centred activity.", "Prepare for mixed feelings.", "Focus on staying calm and respecting the child’s pace."],
    scripts: [
      { situation: "opening", words: "I’m really glad to see you. You don’t have to feel any certain way. I’m happy to spend time with you." },
      { situation: "child is distant", words: "That’s okay. We can take it slow. I’m here." },
      { situation: "goodbye", words: "I’m glad I got to see you today. I’ll keep showing up. You don’t have to take care of my feelings." },
    ],
    avoid: ["Do you miss me?", "Tell them you want to live with me.", "Your other parent is lying.", "I promise you’ll be home soon.", "Don’t tell anyone I said this."],
    referral: "Check uncertain visit rules with the caseworker, lawyer, visit supervisor, or support worker before contact.",
    memoryFields: ["visit_type", "child_age_band", "child_contact_response", "parent_visit_goal", "visit_rules", "preferred_opening_script"],
    followUp: "Would you like a one-page plan for your next contact?",
  },
  {
    id: "FB-FLOW-002", version: "1.0", title: "Child says ‘I hate you’", riskLevel: "LEVEL_2", mode: "reunification",
    triggerPatterns: [/child.{0,30}(hates? me|never wants? to see me|ruined (his|her|their) life)/i, /kid won'?t talk/i],
    escalationPatterns: [/retaliat|punish|lose control|self[- ]harm|suicid/i],
    intakeQuestions: ["How old is your child?", "Did this happen during contact?", "How did you respond?", "Are you worried you may lose control?"],
    principle: "Child anger must be held safely rather than argued away or made responsible for the parent’s feelings.",
    immediateSteps: ["Pause before responding.", "Name the anger without guessing its cause.", "Do not defend yourself or seek reassurance."],
    scripts: [{ situation: "rejection", words: "I hear how angry you are. You’re allowed to feel that. I won’t argue or make you take care of my feelings. I’m going to stay calm." }],
    avoid: ["No you don’t.", "After everything I’ve done?", "Someone told you to say that.", "Fine, then I won’t come anymore."],
    referral: "Discuss repeated rejection during contact with the caseworker, therapist, or visit supervisor without pressuring the child.",
    memoryFields: ["child_rejection_trigger", "recommended_response", "parent_goal", "follow_up_needed"],
    followUp: "Would you like to practise a non-defensive response?",
  },
  {
    id: "FB-FLOW-003", version: "1.0", title: "Child refuses affection", riskLevel: "LEVEL_1", mode: "boundaries",
    triggerPatterns: [/won'?t hug|refuses? affection|pulled away|won'?t come near|how do i get.{0,20}hug/i], escalationPatterns: [/force|make (him|her|them) hug|punish/i],
    intakeQuestions: ["Is this at home or during contact?", "What forms of connection does the child currently accept?"],
    principle: "Respecting a child’s body boundary builds safety; forced affection undermines trust.",
    immediateSteps: ["Accept the no without guilt.", "Offer connection choices that do not require touch.", "Let closeness develop at the child’s pace."],
    scripts: [{ situation: "no hug", words: "That’s okay. You get to choose. We can wave, high-five, sit nearby, or play if you want." }],
    avoid: ["Give me a hug.", "Don’t be rude.", "If you loved me, you would.", "Just one hug."],
    referral: "Ask the therapist, caseworker, or visit supervisor how to support connection without physical pressure if this continues.",
    memoryFields: ["child_affection_preference", "safe_affection_options", "parent_goal"], followUp: "Would you like touch-free connection ideas?",
  },
  {
    id: "FB-FLOW-004", version: "1.0", title: "Child refuses contact", riskLevel: "LEVEL_2", mode: "reunification",
    triggerPatterns: [/refuses? (to see me|contact|visits?)|won'?t (come to visits?|answer my calls?)|doesn'?t want contact/i], escalationPatterns: [/force contact|threat|harass|brainwash|self[- ]harm|suicid/i],
    intakeQuestions: ["What type of contact is being refused?", "What guidance has the contact team provided?"],
    principle: "Stay consistent without pressure; refusal may reflect many needs and must not be diagnosed or blamed on another person.",
    immediateSteps: ["Do not pressure the child.", "Keep communication warm and brief.", "Ask the contact team what would increase emotional safety."],
    scripts: [{ situation: "refusal", words: "I’m sad not to see you, but I respect that you’re not ready. I’ll keep working on being safe and steady. You don’t have to take care of my feelings." }],
    avoid: ["You have to see me.", "You’re being brainwashed.", "You’re breaking my heart.", "Tell the caseworker you want me."],
    referral: "Work with the caseworker, therapist, or contact supervisor to understand what the child needs without pressuring contact.",
    memoryFields: ["child_contact_status", "parent_goal", "recommended_script"], followUp: "Would you like a warm, non-pressuring message draft?",
  },
  {
    id: "FB-FLOW-005", version: "1.0", title: "Parent wants to explain their side", riskLevel: "LEVEL_2", mode: "accountability",
    triggerPatterns: [/explain my side|doesn'?t know the truth|other parent lied|caseworker.{0,20}(bad|against me)|tell my child what happened/i], escalationPatterns: [/coach.{0,20}court|keep (it )?secret|don'?t tell|violate.{0,20}(order|rules?)/i],
    intakeQuestions: ["Is this topic permitted during contact?", "What does the child need emotionally in this moment?"],
    principle: "Adult disputes stay with adults; contact is not the place for a defence or recruitment to one side.",
    immediateSteps: ["Pause the explanation.", "Answer only at a child-safe level.", "Take adult concerns to the appropriate professional."],
    scripts: [{ situation: "adult issue", words: "There are adult things being worked through with adults. My job with you is to be calm, honest, and safe." }],
    avoid: ["Your mum or dad lied.", "The caseworker is against me.", "They took you from me.", "Don’t tell anyone."],
    referral: "Ask the caseworker, lawyer, or visit supervisor what can be discussed before raising adult issues with the child.",
    memoryFields: ["parent_trigger", "safe_reframe", "recommended_script"], followUp: "Would you like to prepare the adult concern for a professional conversation instead?",
  },
  {
    id: "FB-FLOW-006", version: "1.0", title: "Parent blames another caregiver", riskLevel: "LEVEL_2", mode: "accountability",
    triggerPatterns: [/turning (him|her|them) against me|carer.{0,20}(lying|poisoning)|caseworker ruined|keeping my child from me/i], escalationPatterns: [/harass|stalk|threat|follow|track (him|her|them)|make them pay/i],
    intakeQuestions: ["Is there an immediate safety concern?", "Which professional channel is appropriate for the concern?"],
    principle: "Do not put the child in a loyalty conflict or use them to carry adult anger.",
    immediateSteps: ["Do not discuss blame with the child.", "Record the concern factually for the appropriate professional.", "Give the child permission to care about safe people."],
    scripts: [{ situation: "loyalty conflict", words: "The adults are working on adult issues. You do not have to choose sides." }],
    avoid: ["They’re lying to you.", "They’re not your real family.", "Don’t trust them.", "They don’t love you like I do."],
    referral: "Raise serious concerns with the lawyer, caseworker, supervisor, or appropriate authority—not through the child.",
    memoryFields: ["parent_trigger", "child_risk", "safe_script"], followUp: "Would you like a factual, child-free note for the appropriate professional?",
  },
  {
    id: "FB-FLOW-007", version: "1.0", title: "Parent missed a visit", riskLevel: "LEVEL_2", mode: "repair",
    triggerPatterns: [/missed (my |a )?(visit|contact|call)|didn'?t show up|forgot contact|let my child down/i], escalationPatterns: [/relaps|intoxicat|violence|unsafe|suicid|self[- ]harm/i],
    intakeQuestions: ["Is everyone safe now?", "What practical factor needs a prevention plan before the next contact?"],
    principle: "Repair requires responsibility without excuses, promises outside the parent’s control, or asking the child for comfort.",
    immediateSteps: ["Acknowledge the missed contact.", "Allow the child’s feelings.", "Name one observable prevention action."],
    scripts: [{ situation: "repair", words: "I’m sorry I missed our visit. You deserved me to show up. I understand if you are angry or disappointed. I’ll show you through what I do next." }],
    avoid: ["I was busy.", "Don’t be mad.", "I already feel bad.", "The caseworker made it hard."],
    referral: "If relapse, mental health, transport, or safety contributed, make an honest prevention plan with the relevant support provider.",
    memoryFields: ["missed_visit", "repair_needed", "reason_category", "next_visit_goal"], followUp: "Would you like a practical plan for making the next visit?",
  },
  {
    id: "FB-FLOW-008", version: "1.0", title: "Parent yelled at child", riskLevel: "LEVEL_2", mode: "repair",
    triggerPatterns: [/yelled at my child|screamed at my|lost it.{0,20}(child|kid)|scared my (child|kid)|apologi[sz]e after yelling/i], escalationPatterns: [/threat|hit|shook|physical force|might.{0,20}(hurt|hit)|terrified/i],
    intakeQuestions: ["Is the child physically safe now?", "Are you worried you may lose control again?"],
    principle: "Repair names the harm and adult responsibility without making the child responsible for the apology.",
    immediateSteps: ["Regulate before approaching.", "Apologise without a ‘but’.", "Name the pause plan for next time."],
    scripts: [{ situation: "repair", words: "I’m sorry I yelled. That was not okay. It is my job to stay safe and calm. I’m practising taking a break before I yell." }],
    avoid: ["But you made me yell.", "If you listened, I wouldn’t yell.", "I said sorry, get over it.", "You’re too sensitive."],
    referral: "Frequent or escalating yelling warrants support from a parenting worker, therapist, doctor, or trusted support person.",
    memoryFields: ["parent_trigger", "repair_script_used", "pause_plan", "support_recommended"], followUp: "Would you like to build a personal ‘before I yell’ plan?",
  },
  {
    id: "FB-FLOW-009", version: "1.0", title: "Parent fears they may harm child", riskLevel: "LEVEL_4", mode: "emergency",
    triggerPatterns: [/afraid.{0,25}(hurt|hit|shake).{0,20}(child|kid|baby)|might (hit|hurt|shake)|can'?t control myself|want to shake my baby|before i hurt/i], escalationPatterns: [], intakeQuestions: ["Are you with another safe adult now, or do you need help deciding who to contact?"],
    principle: "Stop ordinary coaching and focus only on immediate child and caregiver safety.",
    immediateSteps: ["Put the child in the safest available place or with another safe adult.", "Step away if safe.", "Call a trusted adult immediately.", "Call 000 if safety cannot be maintained.", "Do not drive with the child while escalated."],
    scripts: [{ situation: "ask another adult", words: "I’m not safe to be alone with my child right now. I need you to come over or stay on the phone while I get help." }],
    avoid: ["Just calm down.", "You would never do that.", "Try gentle parenting.", "This is normal."],
    referral: "Contact 000, crisis support, a trusted adult, doctor, therapist, caseworker, or local urgent support now.",
    memoryFields: ["safety_event", "risk_level", "category", "escalation_recommended", "timestamp"], followUp: "Are you with another safe adult now?",
  },
  {
    id: "FB-FLOW-010", version: "1.0", title: "Parent craving with child present", riskLevel: "LEVEL_3", mode: "aod_safety",
    triggerPatterns: [/craving.{0,30}(kid|child).{0,20}(here|present)|want to use|about to drink|relapse.{0,30}(watching|responsible|child)/i], escalationPatterns: [/already (drunk|high|intoxicated)|overdose|withdrawal|going to drive|sole caregiver/i],
    intakeQuestions: ["Is the child safely supervised now?", "Is there a sober adult or recovery support person you can contact?"],
    principle: "Respond without shame while prioritising sober child supervision and immediate recovery support.",
    immediateSteps: ["Do not use while responsible for the child.", "Do not drive.", "Move away from substances if safe.", "Contact sober support.", "Use emergency help if safe supervision cannot be maintained."],
    scripts: [{ situation: "ask for support", words: "I’m having a craving and I’m responsible for my child. I need help staying safe right now. Can you come over or stay on the phone?" }],
    avoid: ["Just distract yourself.", "Use after the child sleeps.", "Hide it from your caseworker.", "You can still drive.", "Detox at home."],
    referral: "Contact a sponsor, recovery worker, treatment provider, doctor, AOD hotline, or urgent medical help for withdrawal or overdose risk.",
    memoryFields: ["aod_risk_event", "child_present", "support_person_needed", "recommended_next_step", "risk_level"], followUp: "Is there a sober adult or recovery support person you can contact right now?",
  },
  {
    id: "FB-FLOW-011", version: "1.0", title: "Parent intoxicated with child present", riskLevel: "LEVEL_4", mode: "emergency",
    triggerPatterns: [/i('?m| am) (drunk|high|intoxicated).{0,50}(child|kid|baby)/i, /used.{0,30}(kid|child).{0,20}(with me|here)/i, /(drank|high).{0,30}(drive|pick up).{0,20}(child|kid)/i], escalationPatterns: [],
    intakeQuestions: ["Is the child safely supervised?", "Can a sober adult come immediately?", "Is anyone driving or medically unwell?"],
    principle: "Stop unsafe caregiving and driving; arrange sober supervision without shame or delay.",
    immediateSteps: ["Do not drive.", "Do not remain the only caregiver while impaired.", "Call a sober adult immediately.", "Use 000 if safe supervision or urgent medical care cannot be arranged."],
    scripts: [{ situation: "ask for sober help", words: "I’m impaired and I cannot safely be the only adult caring for my child. I need you to come now or help me contact emergency support." }],
    avoid: ["Sleep it off.", "Drive carefully.", "Wait until you feel better.", "Hide it.", "Keep parenting as normal."],
    referral: "After immediate safety is established, contact the treatment provider, sponsor, AOD worker, doctor, or caseworker involved.",
    memoryFields: ["aod_current_intoxication", "child_present", "emergency_supervision_needed"], followUp: "Can you call a sober adult right now?",
  },
  {
    id: "FB-FLOW-012", version: "1.0", title: "Partner scares parent", riskLevel: "LEVEL_3", mode: "emergency",
    triggerPatterns: [/partner scares me|ex threatened me|tracks my phone|scared to leave|partner hit me|child saw.{0,20}violence/i], escalationPatterns: [/weapon|gun|knife|strangl|chok|threat.{0,15}kill|trapped|assaulting|forced sex/i],
    intakeQuestions: ["Are you or a child in immediate danger?", "Are you safe to use this device?", "Is the device or location monitored?"],
    principle: "Treat coercion and fear as safety concerns, not communication problems; do not increase danger through confrontation or joint planning.",
    immediateSteps: ["Use 000 for immediate danger.", "Use a safer device if monitoring is possible.", "Do not confront the person if that may increase danger.", "Contact a specialist family violence service for an individual safety plan."],
    scripts: [{ situation: "ask a safe person", words: "I do not feel safe. Please contact me only in a way that will not alert the person monitoring me." }],
    avoid: ["Just leave.", "Confront them.", "Try couples counselling.", "Stay for the children.", "Tell them you’re making a plan."],
    referral: "Contact 1800RESPECT or a local domestic and family violence advocate; call 000 for immediate danger.",
    memoryFields: ["dv_safety_concern", "device_safety_warning_given", "notifications_should_be_discreet"], followUp: "Are you safe to keep using this device right now?",
  },
  {
    id: "FB-FLOW-013", version: "1.0", title: "Child discloses abuse", riskLevel: "LEVEL_4", mode: "emergency",
    triggerPatterns: [/child.{0,35}(said|told me).{0,35}(touched|hurt|hit|abuse)/i, /child disclosed abuse/i, /child.{0,30}scared of (someone|him|her|them)/i], escalationPatterns: [],
    intakeQuestions: ["Is the child safe right now?", "Can the person of concern access the child?", "Is urgent medical care needed?"],
    principle: "Protect the child, respond calmly, avoid interrogation or promises of secrecy, and involve appropriate real-world safeguarding support.",
    immediateSteps: ["Stay calm and listen.", "Do not ask repeated or leading questions.", "Do not promise secrecy.", "Prevent access by the person of concern where lawfully and safely possible.", "Contact appropriate child protection, police, medical, or safeguarding support."],
    scripts: [{ situation: "respond to child", words: "Thank you for telling me. I’m glad you told me. This is not your fault. I need to get help from safe adults." }],
    avoid: ["Are you sure?", "Why didn’t you tell me?", "Don’t tell anyone.", "I’ll handle this myself.", "What exactly happened?"],
    referral: "Contact the appropriate child-protection or emergency service and relevant safeguarding professional; use 000 for immediate danger.",
    memoryFields: ["abuse_disclosure_safety_response_given", "professional_reporting_recommended"], followUp: "Is the child safe from that person right now?",
  },
  {
    id: "FB-FLOW-014", version: "1.0", title: "Child talks about wanting to die", riskLevel: "LEVEL_4", mode: "emergency",
    triggerPatterns: [/child.{0,35}(wants? to die|kill (himself|herself|themself)|self[- ]harm)/i, /teenager.{0,35}(suicid|life isn'?t worth)/i, /my (son|daughter).{0,35}wants? to disappear/i], escalationPatterns: [],
    intakeQuestions: ["Is the child with you now?", "Are they in immediate danger?", "Have they mentioned a plan or access to means?"],
    principle: "Stop parenting coaching and connect the child to immediate real-world crisis assessment and supervision.",
    immediateSteps: ["Stay with the child if safe.", "Speak calmly and directly.", "Reduce access to obvious means if safe.", "Contact 000 or urgent crisis support.", "Do not leave the child alone while active risk is present."],
    scripts: [{ situation: "respond to child", words: "I’m really glad you told me. I’m not angry and you’re not in trouble. I’m staying with you and getting help now." }],
    avoid: ["You don’t mean that.", "You’re being dramatic.", "Think about how this makes me feel.", "Promise me you won’t.", "Sleep it off."],
    referral: "Contact 000 for immediate danger, Lifeline, urgent mental health support, or the child’s doctor or therapist immediately.",
    memoryFields: ["child_self_harm_risk_response_given", "urgent_support_recommended"], followUp: "Is your child with you right now and in immediate danger?",
  },
  {
    id: "FB-FLOW-015", version: "1.0", title: "Parent scared child", riskLevel: "LEVEL_3", mode: "repair",
    triggerPatterns: [/i scared my (child|kid)|child is afraid of me|terrified my (child|kid)|threatened my (child|kid)/i], escalationPatterns: [/physical|hit|hurt|weapon|might do it again|not safe/i],
    intakeQuestions: ["Is the child physically safe now?", "Are you calm and able to prevent another escalation?"],
    principle: "Safety and accountability come before reassurance; repair must not minimise fear or demand forgiveness.",
    immediateSteps: ["Stop the frightening behaviour.", "Create safe space.", "Bring in another safe adult if escalation may recur.", "Repair only when calm and get support for prevention."],
    scripts: [{ situation: "accountable repair", words: "I scared you. That was not okay. You deserved to feel safe. I’m getting help so I respond differently. You do not have to make me feel better." }],
    avoid: ["I was only joking.", "You’re too sensitive.", "You made me angry.", "You know I would never hurt you."],
    referral: "Repeated or escalating frightening behaviour needs a concrete safety plan with a therapist, parenting worker, doctor, caseworker, or family service.",
    memoryFields: ["repair_needed", "repair_type", "immediate_safety_confirmed", "prevention_support_recommended"], followUp: "Is another safe adult available while you make a prevention plan?",
  },
  {
    id: "FB-FLOW-016", version: "1.0", title: "Parent used physical punishment", riskLevel: "LEVEL_3", mode: "accountability",
    triggerPatterns: [/i (hit|smacked|spanked|slapped) my (child|kid|son|daughter)|physical punishment|used the belt/i], escalationPatterns: [/injur|bruise|bleed|head|weapon|again tonight|can'?t stop/i],
    intakeQuestions: ["Is the child safe and uninjured now?", "Is urgent medical care needed?", "Can another safe adult help prevent further harm?"],
    principle: "Do not endorse physical punishment; establish safety, accountability, medical attention when needed, and nonviolent support.",
    immediateSteps: ["Stop physical punishment.", "Check the child’s immediate safety and medical needs.", "Use another safe adult if there is risk of repetition.", "Contact qualified support to create a nonviolent safety and parenting plan."],
    scripts: [{ situation: "repair after safety", words: "I hit you. That was wrong and it was not your fault. You deserved to be safe. I am getting help so it does not happen again." }],
    avoid: ["It was for your own good.", "This hurts me more than you.", "You deserved it.", "Don’t tell anyone."],
    referral: "Seek urgent medical or emergency help for injury or immediate danger and qualified parenting or clinical support to prevent recurrence.",
    memoryFields: ["physical_punishment_safety_response_given", "medical_review_considered", "prevention_support_recommended"], followUp: "Is the child physically safe and free from injury right now?",
  },
  {
    id: "FB-FLOW-017", version: "1.0", title: "Parent relapsed", riskLevel: "LEVEL_3", mode: "aod_safety",
    triggerPatterns: [/i relapsed|used again|started drinking again|broke my sobriety/i], escalationPatterns: [/child.{0,30}(with me|present)|drive|overdose|withdrawal|still (drunk|high)|sole caregiver/i],
    intakeQuestions: ["Is a child relying on you right now?", "Are you impaired or medically unwell?", "Which sober or treatment support can you contact?"],
    principle: "Relapse requires immediate safety, honest support activation, and non-shaming accountability—not concealment.",
    immediateSteps: ["Arrange sober supervision if a child is present.", "Do not drive.", "Contact treatment or sober support.", "Seek urgent medical help for overdose or dangerous withdrawal signs."],
    scripts: [{ situation: "tell support team", words: "I relapsed and I need help making sure my child and I are safe. I want to be honest and make a plan for the next step." }],
    avoid: ["Keep it to yourself.", "It doesn’t count.", "Use once more before stopping.", "Detox at home."],
    referral: "Contact the treatment provider, AOD worker, sponsor, doctor, or National Alcohol and Other Drug Hotline; use emergency care when indicated.",
    memoryFields: ["relapse_support_response_given", "sober_supervision_needed", "honest_support_contact_recommended"], followUp: "Who is the safest sober or treatment support to contact now?",
  },
  {
    id: "FB-FLOW-018", version: "1.0", title: "Parent wants to hide relapse", riskLevel: "LEVEL_3", mode: "refusal",
    triggerPatterns: [/hide (my |the )?relapse|don'?t tell.{0,25}(caseworker|aod|worker|court)|beat (a |the )?drug test|fake (a |the )?drug test|cover up.{0,20}(use|relapse)/i], escalationPatterns: [/child.{0,25}(present|with me)|drive|intoxicated|overdose|withdrawal/i],
    intakeQuestions: ["Is anyone unsafe right now?", "Which appropriate support person can help you make an honest safety plan?"],
    principle: "Refuse concealment, test evasion, or misleading professionals while offering an accountable, safety-oriented alternative.",
    immediateSteps: ["Do not drive or provide impaired care.", "Contact a sober or treatment support.", "Prepare a factual disclosure and prevention plan."],
    scripts: [{ situation: "accountable disclosure", words: "I relapsed. I want to be honest about the safety impact and the support I am putting in place now." }],
    avoid: ["Hide it from your caseworker.", "Here is how to beat the test.", "Delete the evidence.", "Say it was medication."],
    referral: "Use a lawyer for legal advice and an AOD provider, doctor, or support worker for treatment and safety planning; SafeSteps cannot help mislead either.",
    memoryFields: ["accountability_redirect_given", "honest_disclosure_support_offered"], followUp: "Would you like an honest, factual conversation outline for your support provider?",
  },
  {
    id: "FB-FLOW-019", version: "1.0", title: "Partner monitors phone or location", riskLevel: "LEVEL_3", mode: "dv_safety",
    triggerPatterns: [/monitors? my (phone|location|email|messages)|tracks? my (phone|location)|spyware|can see my messages|checks my phone/i], escalationPatterns: [/threat|weapon|strangl|kill|outside right now|coming for me/i],
    intakeQuestions: ["Are you safe to keep using this device?", "Is there a safer device or specialist service you can use?"],
    principle: "Technology monitoring can be coercive control; prioritize discreet access to specialist safety support without confrontation.",
    immediateSteps: ["Do not change settings if discovery could increase danger.", "Use a safer device when possible.", "Contact a specialist family violence service.", "Use 000 for immediate danger."],
    scripts: [{ situation: "ask for discreet contact", words: "My device may be monitored. Please help me choose a contact method that will not increase danger." }],
    avoid: ["Disable tracking now.", "Confront them with proof.", "Install a secret app.", "Tell them you know."],
    referral: "A specialist domestic and family violence advocate can help assess technology safety in the context of the whole situation.",
    memoryFields: ["device_safety_warning_given", "discreet_mode_recommended"], followUp: "Are you safe to keep using this device right now?",
  },
  {
    id: "FB-FLOW-020", version: "1.0", title: "Ex harasses through parenting app", riskLevel: "LEVEL_2", mode: "dv_safety",
    triggerPatterns: [/harass.{0,25}(parenting|co[- ]?parenting) app|abuse.{0,25}(parenting|messages)|ex.{0,30}(constant|threatening) messages/i], escalationPatterns: [/threat.{0,15}(kill|hurt)|stalk|outside|weapon|child.{0,15}threat/i],
    intakeQuestions: ["Is there an immediate threat?", "Are communication rules or professional supports already in place?"],
    principle: "Keep child-related communication brief and factual without treating harassment as an ordinary co-parenting disagreement.",
    immediateSteps: ["Use 000 for immediate threats.", "Follow existing legal and professional communication directions.", "Respond only when necessary for child logistics and safety.", "Seek DV-aware professional advice before changing communication patterns."],
    scripts: [{ situation: "bounded response", words: "I will respond to messages about the child’s schedule, health, and school. I’m not discussing personal accusations here." }],
    avoid: ["Match their tone.", "Threaten them back.", "Delete everything.", "Meet privately to sort it out."],
    referral: "A DV advocate and lawyer can advise on safe communication and documentation for the user’s circumstances; SafeSteps does not give legal strategy.",
    memoryFields: ["post_separation_abuse_support_given", "professional_communication_review_recommended"], followUp: "Would you like a brief child-focused response that avoids personal accusations?",
  },
];

const riskRank: Record<FlowRiskLevel, number> = { LEVEL_1: 1, LEVEL_2: 2, LEVEL_3: 3, LEVEL_4: 4 };

export function matchFamilyBridgeFlow(message: string) {
  const normalized = message.normalize("NFKC").replace(/\s+/g, " ").trim();
  const matches = familyBridgeFlowLibrary.filter((flow) => flow.triggerPatterns.some((pattern) => pattern.test(normalized)));
  return matches.sort((left, right) => riskRank[right.riskLevel] - riskRank[left.riskLevel])[0] ?? null;
}

export function evaluateFamilyBridgeFlow(message: string) {
  const flow = matchFamilyBridgeFlow(message);
  if (!flow) return { matchedFlow: null, riskLevel: "LEVEL_1" as const, escalated: false };
  const escalated = flow.escalationPatterns.some((pattern) => pattern.test(message));
  const riskLevel: FlowRiskLevel = escalated
    ? flow.riskLevel === "LEVEL_4" ? "LEVEL_4" : flow.riskLevel === "LEVEL_3" ? "LEVEL_4" : "LEVEL_3"
    : flow.riskLevel;
  return { matchedFlow: flow, riskLevel, escalated };
}
