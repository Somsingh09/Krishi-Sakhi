const express = require('express');
const router = express.Router();
const { loginUser, verifyOtp } = require('../controllers/authController');

// Route to initiate login/signup (send OTP)
router.post('/login', loginUser);

// Route to verify OTP and complete login/signup
router.post('/verify', verifyOtp);

module.exports = router;
