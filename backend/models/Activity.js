const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    cropInstanceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CropInstance',
        required: true
    },
    activityType: {
        type: String, // e.g., 'Sowing', 'Watering', 'Fertilizing', 'Spraying', 'Harvesting'
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

module.exports = mongoose.model('Activity', activitySchema);
