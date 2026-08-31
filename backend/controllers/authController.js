const User = require('../models/User');

// Temporary in-memory store for OTPs (in production, use Redis or DB with TTL)
const otpStore = new Map();

// Generate and send OTP
exports.loginUser = async (req, res) => {
    try {
        const { mobile, fullName, area, district, state, pincode, farmerType } = req.body;

        if (!mobile) {
            return res.status(400).json({ success: false, message: 'Mobile number is required' });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store the OTP with the user's data (expires in 5 minutes)
        otpStore.set(mobile, { 
            otp, 
            userData: { mobile, fullName, area, district, state, pincode, farmerType },
            expiresAt: Date.now() + 5 * 60 * 1000 
        });

        // In a real application, you would send the OTP via an SMS gateway here.
        // For now, we will return the OTP in the response for demo purposes.
        console.log(`Generated OTP for ${mobile}: ${otp}`);

        res.status(200).json({ 
            success: true, 
            message: 'OTP sent successfully',
            demoOtp: otp // Note: Remove this in production
        });
    } catch (error) {
        console.error('Error in loginUser:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Verify OTP and create/login user
exports.verifyOtp = async (req, res) => {
    try {
        const { mobile, otp } = req.body;

        if (!mobile || !otp) {
            return res.status(400).json({ success: false, message: 'Mobile and OTP are required' });
        }

        const storedData = otpStore.get(mobile);

        if (!storedData) {
            return res.status(400).json({ success: false, message: 'OTP expired or not requested' });
        }

        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(mobile);
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }

        if (storedData.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        // OTP is valid. Clear it from store.
        otpStore.delete(mobile);

        // Check if user exists in DB
        let user = await User.findOne({ mobile });

        if (!user) {
            // Create a new user with the details provided during step 1
            const { fullName, area, district, state, pincode, farmerType } = storedData.userData;
            
            // If they are logging in rather than signing up, they might not have provided all details.
            // But based on the current flow, step 1 requires all details.
            user = new User({
                mobile,
                fullName: fullName || 'Farmer',
                area: area || 'Unknown',
                district: district || 'Unknown',
                state: state || 'Unknown',
                pincode: pincode || '000000',
                farmerType: farmerType || 'Other'
            });

            await user.save();
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
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
