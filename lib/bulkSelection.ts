import type { EvidenceBulkTemplate, EvidenceItem, SafeStepsTask, TaskBulkTemplate } from "./platformData";

export function tasksMatchingTemplates(tasks: SafeStepsTask[], templates: TaskBulkTemplate[]) {
  const templateTitles = new Set(templates.map((template) => template.title));
  return tasks.filter((task) => templateTitles.has(task.title));
}

export function draftEvidenceMatchingTemplates(items: EvidenceItem[], templates: EvidenceBulkTemplate[]) {
  const templateTitles = new Set(templates.map((template) => template.title));
  return items.filter((item) => item.status === "draft" && templateTitles.has(item.title));
}
