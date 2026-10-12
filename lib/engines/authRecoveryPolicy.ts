export type AuthRecoveryTokens = {
  access_token: string;
  refresh_token: string;
};

export function parseAuthRecoveryUrl(url: string): AuthRecoveryTokens | null {
  const queryStart = url.indexOf("?");
  const fragmentStart = url.indexOf("#");
  const query =
    queryStart >= 0
      ? url.slice(queryStart + 1, fragmentStart >= 0 ? fragmentStart : undefined)
      : "";
  const fragment = fragmentStart >= 0 ? url.slice(fragmentStart + 1) : "";
  const params = new URLSearchParams([query, fragment].filter(Boolean).join("&"));
  const errorDescription = params.get("error_description");

  if (errorDescription) {
    throw new Error(errorDescription);
  }

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { access_token: accessToken, refresh_token: refreshToken };
}

export function getPasswordResetValidationError(password: string, confirmation: string) {
  if (password.length < 8) {
    return "Use at least 8 characters for your new password.";
  }

  if (password !== confirmation) {
    return "The passwords do not match.";
  }

  return null;
}
