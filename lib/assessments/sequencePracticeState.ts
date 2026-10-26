export function getShuffledSequenceSteps(item: { id: string; correctSequence: string[] }): string[] {
  const steps = [...item.correctSequence];
  let seed = [...item.id].reduce((value, character) => (value * 31 + character.charCodeAt(0)) >>> 0, 7);

  for (let index = steps.length - 1; index > 0; index -= 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const swapIndex = seed % (index + 1);
    [steps[index], steps[swapIndex]] = [steps[swapIndex], steps[index]];
  }

  return steps;
}

export function moveSelectedSequenceStep(steps: string[], index: number, direction: -1 | 1): string[] {
  if (index < 0 || index >= steps.length) return steps;
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= steps.length) return steps;

  const updated = [...steps];
  [updated[index], updated[nextIndex]] = [updated[nextIndex], updated[index]];
  return updated;
}

export function isSequenceComplete(selectedSteps: string[], expectedSteps: string[]): boolean {
  return selectedSteps.length === expectedSteps.length
    && new Set(selectedSteps).size === expectedSteps.length
    && expectedSteps.every((step) => selectedSteps.includes(step));
}
