// Only an explicit database privilege rejection is evidence of a denied read.
// Missing relations, invalid columns, transport errors and malformed responses fail.
export function evaluateBoundaryRead({ data, error }, allow) {
  if (error) return !allow && error.code === "42501";
  if (!Array.isArray(data)) return false;
  return allow ? data.length > 0 : data.length === 0;
}
