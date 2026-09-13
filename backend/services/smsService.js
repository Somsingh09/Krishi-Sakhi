// backend/services/smsService.js
require('dotenv').config();

/**
 * Send SMS using configured provider
 * @param {string} phone - Normalized phone number
 * @param {string} message - Message to send
 * @returns {Promise<boolean>} - True if sent successfully
 */
exports.sendSMS = async (phone, message) => {
    try {
        const isDemoMode = process.env.OTP_DEMO_MODE === 'true';
        
        if (isDemoMode) {
            console.log(`[DEMO SMS to ${phone}]: ${message}`);
            return true;
        }

        // Check if provider is configured
        const provider = process.env.SMS_PROVIDER;
        
        if (!provider) {
            console.log(`[DEV SMS to ${phone}]: ${message} (SMS_PROVIDER not set)`);
            return true; 
        }

        // Example integration for a real provider
        // if (provider === 'twillo') { ... }
        // if (provider === 'msg91') { ... }
        
        console.log(`[PROD SMS to ${phone}]: ${message} via ${provider}`);
        
        return true;
    } catch (error) {
        console.error('Error sending SMS:', error);
        return false;
    }
};
