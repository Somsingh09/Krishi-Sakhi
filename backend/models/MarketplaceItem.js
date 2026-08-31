const mongoose = require('mongoose');

const marketplaceItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['RENT', 'SALE', 'SPONSORED'], required: true },
    category: { type: String, enum: ['tools', 'seeds'], required: true },
    priceDesc: { type: String, required: true },
    distance: { type: String },
    location: { type: String },
    isSponsored: { type: Boolean, default: false },
    description: { type: String }
});

module.exports = mongoose.model('MarketplaceItem', marketplaceItemSchema);
