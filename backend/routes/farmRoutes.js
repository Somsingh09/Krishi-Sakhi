const express = require('express');
const router = express.Router();
const farmController = require('../controllers/farmController');

// Farms
router.get('/user/:userId', farmController.getFarms);
router.post('/', farmController.createFarm);

// Crops
router.get('/farm/:farmId/crops', farmController.getCropsByFarm);
router.get('/user/:userId/crops', farmController.getAllCropsByUser);
router.post('/crop', farmController.addCrop);
router.put('/crop/:cropId/status', farmController.updateCropStatus);

// Activities
router.get('/crop/:cropId/activities', farmController.getActivitiesByCrop);
router.post('/activity', farmController.addActivity);

// Expenses
router.get('/user/:userId/expenses', farmController.getExpensesByUser);
router.post('/expense', farmController.addExpense);

// Reminders
router.get('/user/:userId/reminders', farmController.getRemindersByUser);
router.post('/reminder', farmController.addReminder);
router.put('/reminder/:reminderId/toggle', farmController.toggleReminder);
router.delete('/reminder/:reminderId', farmController.deleteReminder);

module.exports = router;
