const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./auth.model");

/**
 * Generate JWT Token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

/**
 * REGISTER USER
 */
exports.registerUser = async (data) => {
  const email = data.email.toLowerCase();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return {
      success: false,
      statusCode: 400,
      message: "User already exists with this email",
    };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await User.create({
    name: data.name,
    email,
    password: hashedPassword,
    role: data.role || "user",
  });

  const userObj = user.toObject();
  delete userObj.password;

  return {
    success: true,
    statusCode: 201,
    user: userObj,
  };
};

/**
 * LOGIN USER
 */
exports.loginUser = async (email, password) => {
  const normalizedEmail = email.toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });

  // ❌ user not found
  if (!user) {
    return {
      success: false,
      statusCode: 401,
      message: "Invalid email or password",
    };
  }

  const isMatch = await bcrypt.compare(password, user.password);

  // ❌ wrong password
  if (!isMatch) {
    return {
      success: false,
      statusCode: 401,
      message: "Invalid email or password",
    };
  }

  const token = generateToken(user);

  const userObj = user.toObject();
  delete userObj.password;

  return {
    success: true,
    statusCode: 200,
    token,
    user: userObj,
  };
};