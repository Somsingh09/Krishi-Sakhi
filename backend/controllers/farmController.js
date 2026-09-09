const mongoose = require('mongoose');
const Farm = require('../models/Farm');
const CropInstance = require('../models/CropInstance');
const Activity = require('../models/Activity');
const Expense = require('../models/Expense');
const Reminder = require('../models/Reminder');

// ----------------- FARMS ----------------- //
exports.getFarms = async (req, res) => {
    try {
        const { userId } = req.params;
        const farms = await Farm.find({ userId });
        res.status(200).json({ success: true, farms });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createFarm = async (req, res) => {
    try {
        const { userId, name, size, soilType, irrigationType } = req.body;
        const farm = new Farm({ userId, name, size, soilType, irrigationType });
        await farm.save();
        res.status(201).json({ success: true, farm });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ----------------- CROPS ----------------- //
exports.getCropsByFarm = async (req, res) => {
    try {
        const { farmId } = req.params;
        const crops = await CropInstance.find({ farmId });
        res.status(200).json({ success: true, crops });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getAllCropsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const crops = await CropInstance.find({ userId }).populate('farmId', 'name');
        res.status(200).json({ success: true, crops });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.addCrop = async (req, res) => {
    try {
        const { farmId, userId, cropName, season, areaPlanted, plantingDate, expectedHarvestDate } = req.body;
        const crop = new CropInstance({ farmId, userId, cropName, season, areaPlanted, plantingDate, expectedHarvestDate });
        await crop.save();
        res.status(201).json({ success: true, crop });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateCropStatus = async (req, res) => {
    try {
        const { cropId } = req.params;
        const { status, yieldQuantity, actualHarvestDate } = req.body;
        
        const updateData = { status };
        if (yieldQuantity !== undefined) updateData.yieldQuantity = yieldQuantity;
        if (actualHarvestDate !== undefined) updateData.actualHarvestDate = actualHarvestDate;

        const crop = await CropInstance.findByIdAndUpdate(cropId, updateData, { new: true });
        res.status(200).json({ success: true, crop });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ----------------- ACTIVITIES ----------------- //
exports.getActivitiesByCrop = async (req, res) => {
    try {
        const { cropId } = req.params;
        const activities = await Activity.find({ cropInstanceId: cropId }).sort({ date: -1 });
        res.status(200).json({ success: true, activities });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.addActivity = async (req, res) => {
    try {
        const { cropInstanceId, activityType, date, notes } = req.body;
        const activity = new Activity({ cropInstanceId, activityType, date, notes });
        await activity.save();
        res.status(201).json({ success: true, activity });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ----------------- EXPENSES ----------------- //
exports.getExpensesByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const expenses = await Expense.find({ userId }).populate({ path: 'cropInstanceId', populate: { path: 'farmId' } }).sort({ date: -1 });
        res.status(200).json({ success: true, expenses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.addExpense = async (req, res) => {
    try {
        const { cropInstanceId, userId, category, amount, date, notes } = req.body;
        const expense = new Expense({ cropInstanceId, userId, category, amount, date, notes });
        await expense.save();
        res.status(201).json({ success: true, expense });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ----------------- REMINDERS ----------------- //
exports.getRemindersByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const reminders = await Reminder.find({ userId }).sort({ dueDate: 1 });
        res.status(200).json({ success: true, reminders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.addReminder = async (req, res) => {
    try {
        const { userId, title, description, dueDate } = req.body;
        const reminder = new Reminder({ userId, title, description, dueDate });
        await reminder.save();
        res.status(201).json({ success: true, reminder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.toggleReminder = async (req, res) => {
    try {
        const { reminderId } = req.params;
        const reminder = await Reminder.findById(reminderId);
        if (!reminder) return res.status(404).json({ success: false, message: 'Reminder not found' });
        
        reminder.isCompleted = !reminder.isCompleted;
        await reminder.save();
        res.status(200).json({ success: true, reminder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteReminder = async (req, res) => {
    try {
        const { reminderId } = req.params;
        await Reminder.findByIdAndDelete(reminderId);
        res.status(200).json({ success: true, message: 'Reminder deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
