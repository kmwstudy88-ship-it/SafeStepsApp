import express from "express";

import "./env.js";
import { ApiError } from "./lib/apiError.js";
import { requestLogger } from "./lib/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { requireAuthenticatedUser } from "./middleware/requireAuthenticatedUser.js";
import { requestContext } from "./middleware/requestContext.js";

const app = express();
const port = process.env.PORT ?? 3000;
const { default: authRoutes } = await import("./routes/auth/authRoutes.js");
const { default: documentRoutes } = await import("./routes/documents/documentRoutes.js");
const { default: userCurriculumRoutes } = await import("./routes/users/curriculumRoutes.js");
const { default: worksheetRoutes } = await import("./routes/worksheets/worksheetRoutes.js");
const { default: supportGuideRoutes } = await import("./routes/supportGuide/supportGuideRoutes.js");
const { default: personalAiSupportRoutes } = await import("./routes/personalAiSupport/personalAiSupportRoutes.js");

const allowedOrigins = (
  process.env.SAFESTEPS_ALLOWED_ORIGINS ??
  process.env.SAFESTEPS_ALLOWED_ORIGIN ??
  "http://localhost:8081,http://localhost:8099,http://localhost:19006"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(requestContext);
app.use(requestLogger);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !allowedOrigins.includes(origin)) {
    next(new ApiError(403, "ORIGIN_FORBIDDEN", "This origin is not allowed to access SafeSteps."));
    return;
  }

  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
  }

  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Request-Id, X-Device-Id, X-Client-Platform, X-Client-Version",
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "safesteps-api", requestId: req.id });
});

app.get("/ready", (req, res) => {
  const provider = process.env.SAFESTEPS_SUPPORT_MODEL_PROVIDER ?? "openai";
  const supabaseConfigured = Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY) && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY));
  const modelConfigured = provider === "anthropic"
    ? Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_SUPPORT_GUIDE_MODEL)
    : Boolean(process.env.OPENAI_KEY && process.env.OPENAI_SUPPORT_GUIDE_MODEL);
  const ready = supabaseConfigured && modelConfigured && process.env.SAFESTEPS_ALLOW_UNAUTHENTICATED_LOCAL_API !== "true";
  res.status(ready ? 200 : 503).json({ ready, service: "safesteps-api", provider, checks: { supabaseConfigured, modelConfigured, authenticationRequired: process.env.SAFESTEPS_ALLOW_UNAUTHENTICATED_LOCAL_API !== "true" }, requestId: req.id });
});

app.use("/auth", authRoutes);
app.use("/documents", documentRoutes);
app.use("/worksheets", requireAuthenticatedUser, worksheetRoutes);
app.use("/users", requireAuthenticatedUser, userCurriculumRoutes);
app.use("/support-guide", requireAuthenticatedUser, supportGuideRoutes);
app.use("/api", requireAuthenticatedUser, personalAiSupportRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "info",
      service: "safesteps-api",
      event: "server.started",
      port: Number(port),
    }),
  );
});
