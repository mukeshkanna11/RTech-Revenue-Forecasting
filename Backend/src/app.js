const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const routes = require("./routes");
const { errorHandler } = require("./middlewares/error.middleware");

const app = express();

const NODE_ENV = process.env.NODE_ENV || "development";

/* ========================
   TRUST PROXY
======================== */
app.set("trust proxy", 1);

/* ========================
   SECURITY
======================== */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: {
      policy: "same-origin-allow-popups",
    },
    crossOriginEmbedderPolicy: false,
  })
);

/* ========================
   CORS (SIMPLIFIED & STABLE)
======================== */
app.use(
  cors({
    origin: true, // reflect request origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: [
      "Content-Length",
      "Content-Disposition",
    ],
  })
);

// Explicit preflight support
app.options("*", cors());

/* ========================
   RATE LIMIT
======================== */
const limiter = rateLimit({
  windowMs:
    Number(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
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
   BODY PARSER
======================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ========================
   LOGGING
======================== */
if (NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} | ${req.method} ${req.originalUrl}`
  );
  next();
});

/* ========================
   CUSTOM HEADERS
======================== */
app.use((req, res, next) => {
  res.setHeader(
    "X-App-Name",
    process.env.APP_NAME || "Revenue Forecasting API"
  );

  res.setHeader("X-Environment", NODE_ENV);

  next();
});

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

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "UP",
    timestamp: new Date().toISOString(),
  });
});

/* ========================
   ROUTES
======================== */
app.use("/api/v1", routes);

/* ========================
   404
======================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

/* ========================
   ERROR HANDLER
======================== */
app.use(errorHandler);

module.exports = app;