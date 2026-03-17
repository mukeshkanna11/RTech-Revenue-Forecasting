const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const routes = require("./routes");
const { errorHandler } = require("./middlewares/error.middleware");

const app = express();

/* ========================
   Allowed Origins (ENV BASED)
======================== */

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];

/* ========================
   Global Middlewares
======================== */

app.use(helmet());

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("🌐 Incoming Origin:", origin);

      // allow non-browser clients (Postman, mobile apps)
      if (!origin) return callback(null, true);

      // normalize origin (remove trailing slash)
      const normalizedOrigin = origin.replace(/\/$/, "");

      const isAllowed = allowedOrigins.some(
        (o) => o.replace(/\/$/, "") === normalizedOrigin
      );

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

/* ✅ Handle Preflight Requests */
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* ========================
   API Routes
======================== */

app.use("/api/v1", routes);

/* ========================
   Health Check (IMPORTANT)
======================== */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running 🚀"
  });
});

/* ========================
   404 Handler
======================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

/* ========================
   Global Error Handler
======================== */

app.use(errorHandler);

module.exports = app;