// backend/services/smsService.js
require('dotenv').config();

/**
 * Send SMS using configured provider
 * @param {string} phone - Normalized phone number
 * @param {string} message - Message to send (fallback)
 * @param {string} otp - The raw OTP code
 * @returns {Promise<boolean>} - True if sent successfully
 */
exports.sendSMS = async (phone, message, otp) => {
    try {
        // User requested to disable real SMS and just show on screen
        console.log(`[BYPASS SMS] OTP ${otp} would have been sent to ${phone}`);
        return true; 
    } catch (error) {
        console.error('Error sending SMS:', error);
        return false;
    }
};
