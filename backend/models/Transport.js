const mongoose = require("mongoose");
const transportSchema = new mongoose.Schema({
    farmerName: { type: String, required: true },
    pickup: { type: String, required: true },
    dropoff: { type: String, required: true },
    status: { type: String, default: "Pending" },
    routeOptimized: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Transport", transportSchema);
