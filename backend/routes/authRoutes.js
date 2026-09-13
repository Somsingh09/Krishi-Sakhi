const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp } = require('../controllers/authController');

// Route to initiate login/signup (send OTP)
router.post('/send-otp', sendOtp);

// Route to verify OTP and complete login/signup
router.post('/verify-otp', verifyOtp);

// Fallback for existing clients (if any)
router.post('/login', sendOtp);
router.post('/verify', verifyOtp);

module.exports = router;
