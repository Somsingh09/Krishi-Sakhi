const User = require('../models/User');
const otpService = require('../services/otpService');
const jwt = require('jsonwebtoken');

// Generate and send OTP
exports.sendOtp = async (req, res) => {
    try {
        const { mobile, fullName, area, district, state, pincode, farmerType } = req.body;

        if (!mobile) {
            return res.status(400).json({ success: false, message: 'Mobile number is required' });
        }

        const purpose = 'registration';
        let demoOtp = null;

        try {
            demoOtp = await otpService.sendOtp(mobile, purpose);
        } catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        // Store user registration details temporarily if they are a new user
        // We'll store them in session or pass them along later, but here we can just update the DB
        // when they verify. Wait, we don't have DB access to temp details yet.
        // Let's create or update the user model right now but leave phoneVerified = false.
        
        const normalizedPhone = otpService.normalizePhone(mobile);
        
        let user = await User.findOne({ mobile: normalizedPhone });
        if (!user) {
            // Also check the old format just in case
            user = await User.findOne({ mobile });
        }

        if (!user) {
            user = new User({
                mobile: normalizedPhone, // save normalized
                fullName: fullName || 'Farmer',
                area: area || 'Unknown',
                district: district || 'Unknown',
                state: state || 'Unknown',
                pincode: pincode || '000000',
                farmerType: farmerType || 'Other',
                phoneVerified: false
            });
            await user.save();
        } else {
            // Update fields if provided
            if (fullName) user.fullName = fullName;
            if (area) user.area = area;
            if (district) user.district = district;
            if (state) user.state = state;
            if (pincode) user.pincode = pincode;
            if (farmerType) user.farmerType = farmerType;
            await user.save();
        }

        const responsePayload = { 
            success: true, 
            message: 'OTP sent successfully'
        };
        
        if (demoOtp) {
            responsePayload.demoOtp = demoOtp; // Only added if OTP_DEMO_MODE=true
        }

        res.status(200).json(responsePayload);
    } catch (error) {
        console.error('Error in loginUser:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Verify OTP and create/login user
exports.verifyOtp = async (req, res) => {
    try {
        const { mobile, otp } = req.body;
        const purpose = 'registration';

        if (!mobile || !otp) {
            return res.status(400).json({ success: false, message: 'Mobile and OTP are required' });
        }

        try {
            await otpService.verifyOtp(mobile, otp, purpose);
        } catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        const normalizedPhone = otpService.normalizePhone(mobile);
        let user = await User.findOne({ mobile: normalizedPhone });
        
        if (!user) {
            // Check old format
            user = await User.findOne({ mobile });
            if (user) {
                user.mobile = normalizedPhone;
            }
        }

        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        user.phoneVerified = true;
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id || user.id, mobile: user.mobile },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '30d' }
        );

        res.status(200).json({
            success: true,
            message: 'Mobile number verified successfully',
            token, // Send the token to the client
            user: {
                id: user._id || user.id,
                name: user.fullName,
                mobile: user.mobile,
                area: user.area,
                district: user.district,
                state: user.state,
                pincode: user.pincode,
                farmerType: user.farmerType
            }
        });

    } catch (error) {
        console.error('Error in verifyOtp:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
