const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const routes = require("./routes");
const { errorHandler } = require("./middlewares/error.middleware");

const app = express();

/* ========================
   Global Middlewares
======================== */

app.use(helmet());
app.use(cors());
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