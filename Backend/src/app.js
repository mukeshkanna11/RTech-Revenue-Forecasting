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

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.replace(/\/$/, ""))
  : [];

/* ========================
   TRUST PROXY (IMPORTANT FOR RENDER)
======================== */
app.set("trust proxy", 1);

/* ========================
   SECURITY MIDDLEWARES
======================== */

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

/* ========================
   RATE LIMITING (BASIC PROTECTION)
======================== */

const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: {
    success: false,
    message: "Too many requests, please try again later"
  }
});

app.use("/api", limiter);

/* ========================
   CORS CONFIG (ROBUST)
======================== */

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("🌐 Incoming Origin:", origin);

      // allow Postman / server requests
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, "");

      const isAllowed = allowedOrigins.includes(normalizedOrigin);

      if (isAllowed) {
        return callback(null, true);
      }

      console.error("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

/* ✅ Handle Preflight */
app.options("*", cors());

/* ========================
   BODY PARSING
======================== */

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

/* ========================
   LOGGING (DEV ONLY)
======================== */

if (NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* ========================
   REQUEST LOGGER (DEBUG)
======================== */

if (NODE_ENV !== "production") {
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
    timestamp: new Date().toISOString()
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
    timestamp: new Date().toISOString()
  });
});

/* ========================
   GLOBAL ERROR HANDLER
======================== */

app.use(errorHandler);

module.exports = app;