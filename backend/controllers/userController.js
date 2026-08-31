const User = require('../models/User');

// Fetch user data
exports.getUserProfile = async (req, res) => {
    try {
        const { mobile } = req.params;
        const user = await User.findOne({ mobile });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update crops list
exports.updateCrops = async (req, res) => {
    try {
        const { mobile } = req.params;
        const { crops } = req.body; // Expecting an array of strings

        const user = await User.findOneAndUpdate(
            { mobile },
            { $set: { crops } },
            { new: true }
        );

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, crops: user.crops });
    } catch (error) {
        console.error('Error updating crops:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Increment report count
exports.incrementReportsCount = async (req, res) => {
    try {
        const { mobile } = req.params;
        
        const user = await User.findOneAndUpdate(
            { mobile },
            { $inc: { reportsCount: 1 } },
            { new: true }
        );

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, reportsCount: user.reportsCount });
    } catch (error) {
        console.error('Error incrementing report count:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update profile image
exports.updateProfileImage = async (req, res) => {
    try {
        const { mobile } = req.params;
        const { profileImage } = req.body; // Expecting base64 string

        const user = await User.findOneAndUpdate(
            { mobile },
            { $set: { profileImage } },
            { new: true }
        );

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, profileImage: user.profileImage });
    } catch (error) {
        console.error('Error updating profile image:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
