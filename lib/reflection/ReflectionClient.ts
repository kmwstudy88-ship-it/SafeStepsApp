export async function sendReflection<T extends Record<string, unknown>>(
  reflection: T,
): Promise<{ ok: true; reflection: T }> {
  return {
    ok: true,
    reflection,
  };
}
