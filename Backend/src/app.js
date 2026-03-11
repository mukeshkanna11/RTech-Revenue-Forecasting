const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const routes = require("./routes");
const { errorHandler } = require("./middlewares/error.middleware");

const app = express();

/* ========================
   Allowed Origins
======================== */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://rts-revenue-forecasting.netlify.app"
];

/* ========================
   Global Middlewares
======================== */

app.use(helmet());

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps / Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* ========================
   API Routes
======================== */

app.use(routes);

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