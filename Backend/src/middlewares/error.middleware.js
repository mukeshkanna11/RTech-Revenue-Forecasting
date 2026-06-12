const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err);

  if (res.headersSent) {
    return next(err);
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate field value",
    });
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

module.exports = { errorHandler };