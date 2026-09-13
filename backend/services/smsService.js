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

        // If using Fast2SMS
        if (provider.toLowerCase() === 'fast2sms') {
            const apiKey = process.env.SMS_API_KEY;
            if (!apiKey) {
                console.error('Fast2SMS API Key is missing');
                return false;
            }

            // Fast2SMS expects the 10-digit number without the +91 prefix
            const number = phone.replace('+91', '');

            console.log(`[PROD SMS to ${number}] via Fast2SMS OTP Route`);
            
            // Native Node 18+ fetch using the dedicated OTP route 
            // This prevents DND (Do Not Disturb) blocking in India
            const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
                method: "POST",
                headers: {
                    "authorization": apiKey,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    route: "otp",
                    variables_values: otp || message.replace(/\D/g, '').slice(0, 6),
                    numbers: number
                })
            });

            const data = await response.json();
            
            if (data.return === true) {
                console.log('SMS sent successfully via Fast2SMS');
                return true;
            } else {
                console.error('Fast2SMS Error:', data);
                return false;
            }
        }
        
        console.log(`[PROD SMS to ${phone}]: ${message} via ${provider}`);
        return true;
    } catch (error) {
        console.error('Error sending SMS:', error);
        return false;
    }
};
