const mongoose = require("mongoose");
const produceSchema = new mongoose.Schema({
    farmerName: { type: String, required: true },
    cropName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Produce", produceSchema);
