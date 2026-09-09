const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
    userId: {
        type: String, // using string to match the user _id which might be a simple string like 'demo123' in mock
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    size: {
        type: Number, // in acres or hectares, depending on what user prefers, assume acres
        required: true
    },
    soilType: {
        type: String,
        default: 'Unknown'
    },
    irrigationType: {
        type: String,
        default: 'Rainfed'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Farm', farmSchema);
