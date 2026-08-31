const mongoose = require('mongoose');

const mandiRateSchema = new mongoose.Schema({
    crop: { type: String, required: true },
    hindiName: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true, default: 'Global' }
});

module.exports = mongoose.model('MandiRate', mandiRateSchema);
