const express = require("express");
const router = express.Router();

const { register, login } = require("./auth.controller");

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 */
router.post("/register", register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 */
router.post("/login", login);

module.exports = router;