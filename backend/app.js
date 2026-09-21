const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes');
const dataRoutes = require('./routes/dataRoutes');
const farmRoutes = require('./routes/farmRoutes');
const chatRoutes = require('./routes/chatRoutes'); // AI Chat

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images

// Connect to MongoDB Middleware
app.use(async (req, res, next) => {
    if (!process.env.MONGO_URI) {
        console.warn('MONGO_URI is not set in environment variables. Running in Mock DB mode.');
        req.mockDb = true;
        return next();
    }

    if (mongoose.connection.readyState === 1) {
        return next();
    }

    if (mongoose.connection.readyState === 2) {
        // Already connecting, just let Mongoose queue the request
        return next();
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 2000 // Fail quickly if DB is unreachable
        });
        console.log('MongoDB connected successfully');
        next();
    } catch (error) {
        console.error('MongoDB connection error. Falling back to Mock DB mode.');
        req.mockDb = true;
        next();
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/chat', chatRoutes); // Mount AI Chat API

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel serverless
module.exports = app;
