const express = require('express');
const router = express.Router();
const { 
    getUserProfile, 
    updateCrops, 
    incrementReportsCount, 
    updateProfileImage 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// GET user profile
router.get('/:mobile', protect, getUserProfile);

// PUT crops
router.put('/:mobile/crops', protect, updateCrops);

// PUT increment reports
router.put('/:mobile/reports', protect, incrementReportsCount);

// PUT profile image
router.put('/:mobile/image', protect, updateProfileImage);

module.exports = router;
