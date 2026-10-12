export class ApiError extends Error {
  constructor(statusCode, code, message, options = {}) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = options.details;
    this.expose = options.expose ?? statusCode < 500;
  }
}

export function badRequest(message, details) {
  return new ApiError(400, "VALIDATION_ERROR", message, { details });
}

export function unauthorized(code = "AUTH_REQUIRED", message = "Authentication is required.") {
  return new ApiError(401, code, message);
}

export function forbidden(code = "ACCESS_DENIED", message = "You do not have access to this resource.") {
  return new ApiError(403, code, message);
}

export function notFound(message = "The requested SafeSteps record was not found.") {
  return new ApiError(404, "NOT_FOUND", message);
}

export function serviceUnavailable(message = "This SafeSteps service is temporarily unavailable.") {
  return new ApiError(503, "SERVICE_UNAVAILABLE", message);
}

export function normalizeApiError(error) {
  if (error instanceof ApiError) return error;

  if (error?.name === "MulterError") {
    if (error.code === "LIMIT_FILE_SIZE") {
      return new ApiError(413, "FILE_TOO_LARGE", "The uploaded file is larger than the 10 MB limit.");
    }
    return badRequest("The uploaded file could not be processed.");
  }

  if (Number.isInteger(error?.statusCode)) {
    return new ApiError(
      error.statusCode,
      error.code ?? "REQUEST_FAILED",
      error instanceof Error ? error.message : "The SafeSteps request failed.",
      { cause: error },
    );
  }

  return new ApiError(500, "INTERNAL_ERROR", "The SafeSteps request could not be completed.", {
    cause: error,
    expose: false,
  });
}

export function errorEnvelope(error, requestId) {
  const apiError = normalizeApiError(error);

  return {
    statusCode: apiError.statusCode,
    body: {
      error: {
        code: apiError.code,
        message: apiError.expose ? apiError.message : "The SafeSteps request could not be completed.",
        requestId,
        ...(apiError.expose && apiError.details ? { details: apiError.details } : {}),
      },
    },
  };
}
