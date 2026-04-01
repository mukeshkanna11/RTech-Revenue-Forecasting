// src/middlewares/auth.js

module.exports = (req, res, next) => {
  try {

    // TEMP: mock user (replace with JWT later)
    req.user = {
      id: "demoUserId",
      tenantId: "demoTenantId"
    };

    next();

  } catch (err) {
    res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }
};