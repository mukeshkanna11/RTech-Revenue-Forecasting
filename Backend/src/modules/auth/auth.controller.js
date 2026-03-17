const { registerUser, loginUser } = require("./auth.service");

/**
 * @desc Register User
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    const result = await registerUser({ name, email, password, role });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.user
    });

  } catch (error) {
    console.error("Register Error:", error.message);
    next(error);
  }
};


/**
 * @desc Login User
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const result = await loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken: result.token,
      user: result.user
    });

  } catch (error) {
    console.error("Login Error:", error.message);
    next(error);
  }
};