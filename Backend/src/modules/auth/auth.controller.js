const { registerUser, loginUser } = require("./auth.service");

/**
 * Register Controller
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    const result = await registerUser({
      name,
      email,
      password,
      role
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.user
    });

  } catch (error) {
    next(error);
  }
};


/**
 * Login Controller
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // validation
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
    next(error);
  }
};