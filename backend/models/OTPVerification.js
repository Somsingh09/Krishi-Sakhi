const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    otpHash: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        default: 'registration'
    },
    expiresAt: {
        type: Date,
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    verified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// TTL index to automatically delete expired records
otpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTPVerification', otpVerificationSchema);
