const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const routes = require("./routes");
const { errorHandler } = require("./middlewares/error.middleware");

const app = express();

/* ========================
   ENV CONFIG
======================== */

const NODE_ENV = process.env.NODE_ENV || "development";

/* ========================
   TRUST PROXY (RENDER / NGINX)
======================== */
app.set("trust proxy", 1);

/* ========================
   UTILS
======================== */

const normalizeOrigin = (origin) => {
  if (!origin) return origin;
  return origin.replace(/\/$/, "").toLowerCase();
};

const parseOrigins = (origins) => {
  return origins
    ? origins.split(",").map((o) => normalizeOrigin(o))
    : [];
};

const allowedOrigins = parseOrigins(process.env.ALLOWED_ORIGINS);

/* ========================
   SECURITY (HELMET)
======================== */

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false,
  })
);

/* ========================
   RATE LIMITING
======================== */

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

app.use("/api", limiter);

/* ========================
   CORS (SaaS LEVEL)
======================== */

app.use(
  cors({
    origin: (origin, callback) => {
      const normalizedOrigin = normalizeOrigin(origin);

      console.log("🌐 Incoming Origin:", normalizedOrigin);

      // Allow server-to-server / Postman
      if (!origin) {
        console.log("✅ No origin (server request)");
        return callback(null, true);
      }

      // Allow if in whitelist
      if (allowedOrigins.includes(normalizedOrigin)) {
        console.log("✅ Allowed Origin:", normalizedOrigin);
        return callback(null, true);
      }

      // Allow Netlify previews (optional SaaS feature)
      if (normalizedOrigin?.includes(".netlify.app")) {
        console.warn("⚠️ Allowing Netlify preview:", normalizedOrigin);
        return callback(null, true);
      }

      console.error("❌ Blocked by CORS:", normalizedOrigin);

      return callback(new Error(`CORS blocked: ${normalizedOrigin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
    ],
    exposedHeaders: ["Content-Length"],
    optionsSuccessStatus: 204,
  })
);

/* ✅ Handle Preflight */
app.options("*", cors());

/* ========================
   EXTRA SECURITY HEADERS
======================== */

app.use((req, res, next) => {
  res.setHeader("X-App-Name", process.env.APP_NAME || "SaaS API");
  res.setHeader("X-Environment", NODE_ENV);
  next();
});

/* ========================
   BODY PARSING
======================== */

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

/* ========================
   LOGGING
======================== */

if (NODE_ENV !== "production") {
  app.use(morgan("dev"));

  app.use((req, res, next) => {
    console.log(`➡️ ${req.method} ${req.originalUrl}`);
    next();
  });
}

/* ========================
   API ROUTES
======================== */

app.use("/api/v1", routes);

/* ========================
   HEALTH CHECK
======================== */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running 🚀",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/* ========================
   404 HANDLER
======================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route Not Found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
});

/* ========================
   GLOBAL ERROR HANDLER
======================== */

app.use(errorHandler);

module.exports = app;