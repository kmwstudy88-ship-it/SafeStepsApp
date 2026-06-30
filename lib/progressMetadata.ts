export function listMetadataStrings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function metadataTaskTitles(metadata: Record<string, unknown> | null | undefined) {
  return [
    ...listMetadataStrings(metadata?.task_titles),
    ...listMetadataStrings(metadata?.taskTitles),
  ];
}

export function metadataEvidenceTitles(metadata: Record<string, unknown> | null | undefined) {
  return [
    ...listMetadataStrings(metadata?.evidence_titles),
    ...listMetadataStrings(metadata?.evidenceTitles),
  ];
}
