const express = require('express');
const router = express.Router();
const farmController = require('../controllers/farmController');
const { protect } = require('../middleware/authMiddleware');

// Farms
router.get('/user/:userId', protect, farmController.getFarms);
router.post('/', protect, farmController.createFarm);

// Crops
router.get('/farm/:farmId/crops', protect, farmController.getCropsByFarm);
router.get('/user/:userId/crops', protect, farmController.getAllCropsByUser);
router.post('/crop', protect, farmController.addCrop);
router.put('/crop/:cropId/status', protect, farmController.updateCropStatus);

// Activities
router.get('/crop/:cropId/activities', protect, farmController.getActivitiesByCrop);
router.post('/activity', protect, farmController.addActivity);

// Expenses
router.get('/user/:userId/expenses', protect, farmController.getExpensesByUser);
router.post('/expense', protect, farmController.addExpense);

// Reminders
router.get('/user/:userId/reminders', protect, farmController.getRemindersByUser);
router.post('/reminder', protect, farmController.addReminder);
router.put('/reminder/:reminderId/toggle', protect, farmController.toggleReminder);
router.delete('/reminder/:reminderId', protect, farmController.deleteReminder);

module.exports = router;
