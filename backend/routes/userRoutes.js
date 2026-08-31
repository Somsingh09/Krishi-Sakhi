const express = require('express');
const router = express.Router();
const { 
    getUserProfile, 
    updateCrops, 
    incrementReportsCount, 
    updateProfileImage 
} = require('../controllers/userController');

// GET user profile
router.get('/:mobile', getUserProfile);

// PUT crops
router.put('/:mobile/crops', updateCrops);

// PUT increment reports
router.put('/:mobile/reports', incrementReportsCount);

// PUT profile image
router.put('/:mobile/image', updateProfileImage);

module.exports = router;
