const mongoose = require('mongoose');

const cropInstanceSchema = new mongoose.Schema({
    farmId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm',
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    cropName: {
        type: String,
        required: true,
        trim: true
    },
    season: {
        type: String,
        required: true
    },
    areaPlanted: {
        type: Number, // area within the farm
        required: true
    },
    plantingDate: {
        type: Date,
        required: true
    },
    expectedHarvestDate: {
        type: Date
    },
    actualHarvestDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Active', 'Harvested', 'Failed'],
        default: 'Active'
    },
    yieldQuantity: {
        type: Number, // e.g. in Quintals
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CropInstance', cropInstanceSchema);
