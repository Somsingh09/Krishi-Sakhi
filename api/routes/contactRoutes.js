const express = require('express');
const router = express.Router();
const { submitContactForm } = require('../controllers/contactController');

// POST a new contact message
router.post('/', submitContactForm);

module.exports = router;
