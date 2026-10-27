import { filterChildSafety } from "./ChildSafetyFilter";

export type ChildSafetySession = {
  childSafetyMode?: boolean;
};

export function enforceChildSafety<T>(session: ChildSafetySession, actionData: T): T {
  if (!session.childSafetyMode) return actionData;

  const safe = JSON.parse(JSON.stringify(actionData)) as T & { text?: string };

  if (typeof safe.text === "string") {
    safe.text = filterChildSafety(safe.text);
  }

  return safe as T;
}
