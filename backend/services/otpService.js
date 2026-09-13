// backend/services/otpService.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const OTPVerification = require('../models/OTPVerification');
const smsService = require('./smsService');

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS) || 5;
const OTP_RESEND_COOLDOWN_SECONDS = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 30;

/**
 * Normalizes phone number to standard format
 */
exports.normalizePhone = (phone) => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        cleaned = '91' + cleaned;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
        // already has 91
    } else if (cleaned.length > 10 && cleaned.startsWith('0')) {
        cleaned = '91' + cleaned.slice(1);
    }
    return '+' + cleaned;
};

/**
 * Generate, hash, and store a new OTP, then send SMS
 */
exports.sendOtp = async (phone, purpose = 'registration') => {
    const normalizedPhone = this.normalizePhone(phone);
    
    // Check resend cooldown
    const recentOtp = await OTPVerification.findOne({ phone: normalizedPhone, purpose })
        .sort({ createdAt: -1 });

    if (recentOtp) {
        const timeDiff = (Date.now() - recentOtp.createdAt.getTime()) / 1000;
        if (timeDiff < OTP_RESEND_COOLDOWN_SECONDS) {
            throw new Error(`Please wait ${OTP_RESEND_COOLDOWN_SECONDS} seconds before requesting a new OTP.`);
        }
    }

    // Invalidate previous OTPs for this purpose
    await OTPVerification.deleteMany({ phone: normalizedPhone, purpose });

    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Hash OTP
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    // Save to DB
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    const otpRecord = new OTPVerification({
        phone: normalizedPhone,
        otpHash,
        purpose,
        expiresAt
    });
    await otpRecord.save();

    // Send SMS
    const message = `Your Krishi Sakhi verification code is ${otp}. It will expire in ${OTP_EXPIRY_MINUTES} minutes. Do not share this code with anyone.`;
    const smsSent = await smsService.sendSMS(normalizedPhone, message, otp);

    if (!smsSent) {
        throw new Error('Failed to send SMS. Please try again later.');
    }

    // Return the unhashed OTP only if in demo mode
    return process.env.OTP_DEMO_MODE === 'true' ? otp : null;
};

/**
 * Verify OTP entered by user
 */
exports.verifyOtp = async (phone, enteredOtp, purpose = 'registration') => {
    const normalizedPhone = this.normalizePhone(phone);

    const otpRecord = await OTPVerification.findOne({ phone: normalizedPhone, purpose })
        .sort({ createdAt: -1 });

    if (!otpRecord) {
        throw new Error('No OTP found or OTP expired. Please request a new one.');
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
