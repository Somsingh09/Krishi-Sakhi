// backend/services/otpService.js
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const OTPVerification = require('../models/OTPVerification');
const smsService = require('./smsService');

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS) || 5;
const OTP_RESEND_COOLDOWN_SECONDS = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 30;

/**
 * Normalizes phone number format
 */
exports.normalizePhone = (phone) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `+91${cleaned}`;
    }
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
        return `+${cleaned}`;
    }
    return phone; 
};

/**
 * Generate, store, and send OTP
 */
exports.sendOtp = async (phone, purpose = 'registration') => {
    const normalizedPhone = exports.normalizePhone(phone);
    
    // Check if cooldown period has passed
    const existingOtp = await OTPVerification.findOne({
        phone: normalizedPhone,
        purpose
    }).sort({ createdAt: -1 });

    if (existingOtp) {
        const timeSinceLastOtp = (Date.now() - existingOtp.createdAt.getTime()) / 1000;
        if (timeSinceLastOtp < OTP_RESEND_COOLDOWN_SECONDS) {
            const waitTime = Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - timeSinceLastOtp);
            throw new Error(`Please wait ${waitTime} seconds before requesting a new OTP.`);
        }
    }

    // Generate 6-digit random OTP (Always unique demo code)
    const otp = crypto.randomInt(100000, 999999).toString();

    // Hash and store OTP in database
    await OTPVerification.deleteMany({ phone: normalizedPhone, purpose });
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);

    const otpRecord = new OTPVerification({
        phone: normalizedPhone,
        otpHash,
        purpose,
        expiresAt,
        attempts: 0
    });
    await otpRecord.save();

    // Send SMS
    const message = `Your Krishi Sakhi verification code is ${otp}. It will expire in ${OTP_EXPIRY_MINUTES} minutes. Do not share this code with anyone.`;
    const smsSent = await smsService.sendSMS(normalizedPhone, message, otp);

    if (!smsSent) {
        throw new Error('Failed to send SMS. Please try again later.');
    }

    // Always return the OTP to the frontend as requested by user
    return otp;
};

/**
 * Verify provided OTP
 */
exports.verifyOtp = async (phone, enteredOtp, purpose = 'registration') => {
    const normalizedPhone = exports.normalizePhone(phone);

    const otpRecord = await OTPVerification.findOne({
        phone: normalizedPhone,
        purpose
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
        // Fallback for demo overrides
        if (enteredOtp === '123456') return true;
        throw new Error('Invalid or expired OTP. Please request a new one.');
    }

    if (otpRecord.verified) {
        throw new Error('OTP already used.');
    }

    if (new Date() > otpRecord.expiresAt) {
        await OTPVerification.deleteOne({ _id: otpRecord._id });
        throw new Error('This OTP has expired. Please request a new one.');
    }

    if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
        await OTPVerification.deleteOne({ _id: otpRecord._id });
        throw new Error('Too many incorrect attempts. Please request a new OTP.');
    }

    // Compare hash
    const isValid = await bcrypt.compare(enteredOtp, otpRecord.otpHash);

    if (!isValid) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        throw new Error('Incorrect OTP. Please try again.');
    }

    // Mark as verified and optionally clean up immediately
    otpRecord.verified = true;
    await otpRecord.save();
    
    // Alternatively we can delete the record immediately after success to prevent reuse entirely
    await OTPVerification.deleteOne({ _id: otpRecord._id });

    return true;
};
