const { registerUser, loginUser } = require("./auth.service");

/**
 * REGISTER USER
 */
exports.register = async (req, res) => {
  try {
    // 🔥 safeguard: prevent undefined body crash
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
      });
    }

    const { name, email, password, role } = req.body;

    // 🔥 basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const result = await registerUser({
      name,
      email,
      password,
      role,
    });

    return res.status(result.statusCode || 201).json({
      success: result.success,
      message: result.message,
      user: result.user || null,
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * LOGIN USER
 */
exports.login = async (req, res) => {
  try {
    // 🔥 safeguard
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
      });
    }

    const email = req.body.email?.trim();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await loginUser(email, password);

    return res.status(result.statusCode || 200).json({
      success: result.success,
      message: result.message,
      token: result.token || null,
      user: result.user || null,
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};