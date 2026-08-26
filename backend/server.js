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
const { default: agentSkillsRoutes } = await import("./routes/agent-skills/agentSkillsRoutes.js");
const { default: userCurriculumRoutes } = await import("./routes/users/curriculumRoutes.js");
const { default: worksheetRoutes } = await import("./routes/worksheets/worksheetRoutes.js");

const allowedOrigins = (
  process.env.SAFESTEPS_ALLOWED_ORIGINS ??
  process.env.SAFESTEPS_ALLOWED_ORIGIN ??
  "http://localhost:8081,http://localhost:8099,http://localhost:19006"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOriginSet = new Set(allowedOrigins);

app.disable("x-powered-by");
app.use(requestContext);
app.use(requestLogger);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !allowedOriginSet.has(origin)) {
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
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

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

app.use("/auth", authRoutes);
app.use("/documents", documentRoutes);
app.use("/agent-skills", requireAuthenticatedUser, agentSkillsRoutes);
app.use("/worksheets", requireAuthenticatedUser, worksheetRoutes);
app.use("/users", requireAuthenticatedUser, userCurriculumRoutes);

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
