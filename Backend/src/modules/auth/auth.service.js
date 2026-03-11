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
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/**
 * Register User
 */
exports.registerUser = async (data) => {
  try {
    const email = data.email.toLowerCase();

    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // create user
    const user = await User.create({
      name: data.name,
      email: email,
      password: hashedPassword,
      role: data.role || "user"
    });

    // remove password from response
    const userObj = user.toObject();
    delete userObj.password;

    return {
      message: "User registered successfully",
      user: userObj
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Login User
 */
exports.loginUser = async (email, password) => {
  try {
    const normalizedEmail = email.toLowerCase();

    // find user
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    // generate token
    const token = generateToken(user);

    // remove password
    const userObj = user.toObject();
    delete userObj.password;

    return {
      message: "Login successful",
      token,
      user: userObj
    };

  } catch (error) {
    throw error;
  }
};