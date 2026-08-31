const MandiRate = require('../models/MandiRate');
const MarketplaceItem = require('../models/MarketplaceItem');
const Scheme = require('../models/Scheme');
const Produce = require('../models/Produce');
const Transport = require('../models/Transport');

// GET Mandi Rates
exports.getMandiRates = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState === 1) {
            const rates = await MandiRate.find({});
            res.status(200).json({ success: true, rates });
        } else {
            res.status(200).json({ success: true, rates: [
                { crop: 'Wheat', hindiName: 'गेहूं', price: 2125 },
                { crop: 'Rice', hindiName: 'चावल', price: 1940 },
                { crop: 'Sugarcane', hindiName: 'गन्ना', price: 350 },
                { crop: 'Potato', hindiName: 'आलू', price: 1200 },
                { crop: 'Onion', hindiName: 'प्याज', price: 1800 },
                { crop: 'Mustard', hindiName: 'सरसों', price: 6000 }
            ] });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET Marketplace Items
exports.getMarketplaceItems = async (req, res) => {
    try {
        const { category } = req.query; // 'tools' or 'seeds'
        const query = category ? { category } : {};
        const items = await MarketplaceItem.find(query);
        res.status(200).json({ success: true, items });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET Schemes
exports.getSchemes = async (req, res) => {
    try {
        const schemes = await Scheme.find({});
        res.status(200).json({ success: true, schemes });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET Produce
exports.getProduce = async (req, res) => {
    try {
        const produce = await Produce.find({});
        res.status(200).json({ success: true, produce });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST Produce
exports.addProduce = async (req, res) => {
    try {
        const newProduce = new Produce(req.body);
        await newProduce.save();
        res.status(201).json({ success: true, produce: newProduce });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST Transport
exports.addTransport = async (req, res) => {
    try {
        const newTransport = new Transport(req.body);
        await newTransport.save();
        res.status(201).json({ success: true, transport: newTransport });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// SEED DATABASE (Run once via API to populate DB)
exports.seedDatabase = async (req, res) => {
    try {
        await MandiRate.deleteMany({});
        await MarketplaceItem.deleteMany({});
        await Scheme.deleteMany({});

        await MandiRate.insertMany([
            { crop: 'Wheat', hindiName: 'गेहूं', price: 2125 },
            { crop: 'Rice', hindiName: 'चावल', price: 1940 },
            { crop: 'Sugarcane', hindiName: 'गन्ना', price: 350 },
            { crop: 'Potato', hindiName: 'आलू', price: 1200 },
            { crop: 'Onion', hindiName: 'प्याज', price: 1800 },
            { crop: 'Mustard', hindiName: 'सरसों', price: 6000 }
        ]);

        await MarketplaceItem.insertMany([
            { title: 'Tractor (Mahindra 275)', type: 'RENT', category: 'tools', priceDesc: '₹500/hour', distance: '2.5 km away' },
            { title: 'Wheat Thresher', type: 'RENT', category: 'tools', priceDesc: '₹800/hour', distance: '4.0 km away' },
            { title: 'Rotavator (7 feet)', type: 'RENT', category: 'tools', priceDesc: '₹400/hour', distance: '5.2 km away' },
            { title: 'Krishi Sakhi Premium Seeds', type: 'SPONSORED', category: 'seeds', priceDesc: '20% Off Today!', description: '30% higher yield with our certified organic seeds.', isSponsored: true },
            { title: 'Kisan Agro Fertilizers', type: 'SPONSORED', category: 'seeds', location: 'Near Main Market', description: 'Top-quality Urea and DAP in bulk. Free delivery.', isSponsored: true }
        ]);

        await Scheme.insertMany([
            { title: 'PM Kisan Samman Nidhi', description: '₹6000 per year income support', link: 'https://pmkisan.gov.in/', icon: '🌱' },
            { title: 'PM Fasal Bima Yojana', description: 'Crop insurance against natural calamities', link: 'https://pmfby.gov.in/', icon: '☂️' },
            { title: 'Kisan Credit Card', description: 'Low-interest loans for farming needs', link: 'https://sbi.co.in/', icon: '💳' },
            { title: 'Soil Health Card', description: 'Know your soil nutrients and get advice', link: 'https://soilhealth.dac.gov.in/', icon: '🧪' }
        ]);

        res.status(200).json({ success: true, message: 'Database seeded successfully with startup data!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Seeding failed' });
    }
};
