require("dotenv").config();

const app = require("./src/app");
const { connectDB } = require("./src/config/db");

const PORT = process.env.PORT || 5000;

/* ========================
   START SERVER SAFELY
======================== */

const startServer = async () => {
  try {
    // ✅ Connect DB FIRST
    await connectDB();
    console.log("✅ Database connected successfully");

    // ✅ Start server
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });

    /* ========================
       GRACEFUL SHUTDOWN
    ======================== */

    const shutdown = (signal) => {
      console.log(`⚠️ ${signal} received. Shutting down...`);
      server.close(() => {
        console.log("💤 Server closed");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

/* ========================
   GLOBAL ERROR HANDLING
======================== */

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err.message);
  process.exit(1);
});

/* ========================
   INIT
======================== */

startServer();