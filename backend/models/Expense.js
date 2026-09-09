const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    cropInstanceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CropInstance',
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    category: {
        type: String, // 'Seeds', 'Fertilizer', 'Pesticide', 'Labor', 'Machinery', 'Other'
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Expense', expenseSchema);
