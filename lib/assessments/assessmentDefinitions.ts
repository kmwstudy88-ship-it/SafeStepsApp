export type ScaleItem = {
  id: string;
  itemNumber: number;
  prompt: string;
  reverseScored?: boolean;
};

export type StandardAssessment = {
  id: "CAPES" | "KEPS" | "PAFAS" | "FPS";
  name: string;
  fullTitle: string;
  description: string;
  clinicalPurpose: string;
  scaleType: "likert_0_3" | "likert_1_5";
  subscales: string[];
  items: ScaleItem[];
};

export const CAPES_ASSESSMENT: StandardAssessment = {
  id: "CAPES",
  name: "CAPES",
  fullTitle: "Child Adjustment and Parent Efficacy Scale",
  description: "Standardized measure of emotional/behavioral child problems and parental self-efficacy.",
  clinicalPurpose: "Evaluates child behavioral intensity and parental confidence in managing difficulties.",
  scaleType: "likert_0_3",
  subscales: ["Behavior Problems", "Emotional Problems", "Parenting Confidence"],
  items: [
    { id: "capes_01", itemNumber: 1, prompt: "Yells, shouts, or screams when upset." },
    { id: "capes_02", itemNumber: 2, prompt: "Does not follow instructions or family rules." },
    { id: "capes_03", itemNumber: 3, prompt: "Becomes easily distressed, worried, or fearful." },
    { id: "capes_04", itemNumber: 4, prompt: "Has temper tantrums when asked to stop activities." },
    { id: "capes_05", itemNumber: 5, prompt: "Hits, pushes, or scratches others." },
    { id: "capes_06", itemNumber: 6, prompt: "Appears withdrawn, unhappy, or tearful." },
    { id: "capes_07", itemNumber: 7, prompt: "Argues back persistently with adults." },
    { id: "capes_08", itemNumber: 8, prompt: "Clings to parent or expresses separation worry." },
    { id: "capes_09", itemNumber: 9, prompt: "Destroys or damages toys or household property." },
    { id: "capes_10", itemNumber: 10, prompt: "Struggles to calm down once agitated." },
  ],
};

export const KEPS_ASSESSMENT: StandardAssessment = {
  id: "KEPS",
  name: "KEPS",
  fullTitle: "Kessler Psychological Distress & Efficacy Scale",
  description: "10-item screen measuring non-specific psychological distress and parenting strain.",
  clinicalPurpose: "Monitors parental emotional distress and identifies support needs during reunification.",
  scaleType: "likert_0_3",
  subscales: ["Fatigue / Depressed Mood", "Nervousness / Anxiety"],
  items: [
    { id: "keps_01", itemNumber: 1, prompt: "Felt tired out for no good reason in the past 4 weeks." },
    { id: "keps_02", itemNumber: 2, prompt: "Felt nervous or on edge." },
    { id: "keps_03", itemNumber: 3, prompt: "Felt so nervous that nothing could calm you down." },
    { id: "keps_04", itemNumber: 4, prompt: "Felt hopeless about your current situation." },
    { id: "keps_05", itemNumber: 5, prompt: "Felt restless or fidgety." },
    { id: "keps_06", itemNumber: 6, prompt: "Felt that everything was an effort." },
    { id: "keps_07", itemNumber: 7, prompt: "Felt so sad that nothing could cheer you up." },
    { id: "keps_08", itemNumber: 8, prompt: "Felt that you could not cope with daily parenting demands." },
    { id: "keps_09", itemNumber: 9, prompt: "Felt overwhelmed by caseworker appointments or requirements." },
    { id: "keps_10", itemNumber: 10, prompt: "Felt confident you have strategies to handle stress." },
  ],
};

export const PAFAS_ASSESSMENT: StandardAssessment = {
  id: "PAFAS",
  name: "PAFAS",
  fullTitle: "Parenting and Family Adjustment Scales",
  description: "Validated measure of parenting practices, emotional adjustment, and family relationships.",
  clinicalPurpose: "Measures consistency, positive encouragement, parent-child relationship, and family discord.",
  scaleType: "likert_0_3",
  subscales: ["Parenting Practices", "Family Discord", "Parental Emotional Adjustment", "Partner Teamwork"],
  items: [
    { id: "pafas_01", itemNumber: 1, prompt: "If my child doesn’t do what they’re told to do, I give in and do it myself." },
    { id: "pafas_02", itemNumber: 2, prompt: "I give my child a treat, reward or fun activity for behaving well." },
    { id: "pafas_03", itemNumber: 3, prompt: "I follow through with a consequence (e.g. take away a toy) when my child misbehaves." },
    { id: "pafas_04", itemNumber: 4, prompt: "I threaten something when my child misbehaves but I don’t follow through." },
    { id: "pafas_05", itemNumber: 5, prompt: "I shout or get angry with my child when they misbehave." },
    { id: "pafas_06", itemNumber: 6, prompt: "I praise my child when they behave well." },
    { id: "pafas_07", itemNumber: 7, prompt: "I try to make my child feel bad (e.g. guilt or shame) for misbehaving." },
    { id: "pafas_08", itemNumber: 8, prompt: "I give my child attention (e.g. a hug, wink, smile) when they behave well." },
    { id: "pafas_09", itemNumber: 9, prompt: "I spank (smack) my child when they misbehave." },
    { id: "pafas_10", itemNumber: 10, prompt: "I argue with my child about their behaviour / attitude." },
    { id: "pafas_11", itemNumber: 11, prompt: "I deal with my child’s misbehaviour the same way all the time." },
    { id: "pafas_12", itemNumber: 12, prompt: "I chat / talk warmly with my child." },
    { id: "pafas_13", itemNumber: 13, prompt: "I enjoy giving my child hugs, kisses and cuddles." },
    { id: "pafas_14", itemNumber: 14, prompt: "I feel stressed or worried about parenting." },
    { id: "pafas_15", itemNumber: 15, prompt: "Our family members help or support each other." },
  ],
};

export const FPS_ASSESSMENT: StandardAssessment = {
  id: "FPS",
  name: "FPS",
  fullTitle: "Facilitative Parenting Scale",
  description: "Validated scale evaluating parenting behaviors supporting child autonomy, friendships, and boundaries.",
  clinicalPurpose: "Identifies facilitative warmth versus over-protective or overly directive parenting patterns.",
  scaleType: "likert_1_5",
  subscales: ["Warmth", "Friendship Support", "Non-Over-Protective", "Non-Conflicting", "Enables Independence"],
  items: [
    { id: "fps_01", itemNumber: 1, prompt: "My child and I enjoy spending time together.", reverseScored: false },
    { id: "fps_02", itemNumber: 2, prompt: "I arrange for my child to see friends out of school.", reverseScored: false },
    { id: "fps_03", itemNumber: 3, prompt: "I tend to baby my child.", reverseScored: true },
    { id: "fps_04", itemNumber: 4, prompt: "My child and I argue a lot.", reverseScored: true },
    { id: "fps_05", itemNumber: 5, prompt: "My child comes to see me if s/he has a problem.", reverseScored: false },
    { id: "fps_06", itemNumber: 6, prompt: "I help my child practise standing up for him/herself.", reverseScored: false },
    { id: "fps_07", itemNumber: 7, prompt: "I can calmly discuss concerns with my child’s teacher.", reverseScored: false },
    { id: "fps_08", itemNumber: 8, prompt: "If another child acts meanly, I might tell them off angrily.", reverseScored: true },
    { id: "fps_09", itemNumber: 9, prompt: "I encourage my child to make decisions about their space.", reverseScored: false },
    { id: "fps_10", itemNumber: 10, prompt: "When my child has a problem, I immediately tell them what to do.", reverseScored: true },
  ],
};

export const ALL_ASSESSMENTS = [CAPES_ASSESSMENT, KEPS_ASSESSMENT, PAFAS_ASSESSMENT, FPS_ASSESSMENT];

export type AssessmentResult = {
  assessmentId: string;
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  meanScore?: number;
  clinicalBand: "Low Concern / High Efficacy" | "Moderate / Support Indicated" | "Elevated Concern";
  subscaleBreakdown: Record<string, number>;
  completedAt: string;
};

export function scoreAssessment(
  assessment: StandardAssessment,
  responses: Record<string, number>
): AssessmentResult {
  let total = 0;
  let answeredCount = 0;
  const subscaleBreakdown: Record<string, number> = {};

  if (assessment.scaleType === "likert_1_5") {
    // 1-5 scale with potential reverse scoring (6 - val)
    for (const item of assessment.items) {
      let rawVal = responses[item.id] ?? 3;
      if (item.reverseScored) {
        rawVal = 6 - rawVal;
      }
      total += rawVal;
      answeredCount++;
    }

    const meanScore = Number((total / Math.max(1, assessment.items.length)).toFixed(2));
    const maxPossibleScore = assessment.items.length * 5;
    const percentage = Math.round((total / maxPossibleScore) * 100);

    // Facilitative Parenting Scale Clinical Cut-offs: Normal: >= 3.48, Borderline: 3.30-3.48, Low: < 3.30
    let clinicalBand: AssessmentResult["clinicalBand"] = "Low Concern / High Efficacy";
    if (meanScore < 3.30) {
      clinicalBand = "Elevated Concern";
    } else if (meanScore <= 3.48) {
      clinicalBand = "Moderate / Support Indicated";
    }

    return {
      assessmentId: assessment.id,
      totalScore: total,
      maxPossibleScore,
      meanScore,
      percentage,
      clinicalBand,
      subscaleBreakdown,
      completedAt: new Date().toISOString(),
    };
  }

  // Standard 0-3 scale
  for (const item of assessment.items) {
    const val = responses[item.id] ?? 0;
    total += val;
    answeredCount++;
  }

  const maxPossibleScore = Math.max(1, assessment.items.length * 3);
  const percentage = Math.round((total / maxPossibleScore) * 100);

  let clinicalBand: AssessmentResult["clinicalBand"] = "Low Concern / High Efficacy";
  if (percentage > 65) {
    clinicalBand = "Elevated Concern";
  } else if (percentage > 35) {
    clinicalBand = "Moderate / Support Indicated";
  }

  return {
    assessmentId: assessment.id,
    totalScore: total,
    maxPossibleScore,
    percentage,
    clinicalBand,
    subscaleBreakdown,
    completedAt: new Date().toISOString(),
  };
}
