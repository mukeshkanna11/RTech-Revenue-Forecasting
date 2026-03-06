const { registerUser, loginUser } = require("./auth.service");

exports.register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { user, token } = await loginUser(email, password);

    res.status(200).json({
      success: true,
      accessToken: token,
      user
    });
  } catch (err) {
    next(err);
  }
};