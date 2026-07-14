const restrictedTerms = ["violence", "self-harm", "drug", "abuse", "sex"];

export function filterChildSafety(text: string) {
  return restrictedTerms.reduce((safeText, term) => {
    const expression = new RegExp(term, "gi");
    return safeText.replace(expression, "safe topic");
  }, text);
}
