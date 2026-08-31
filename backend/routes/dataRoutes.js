const express = require('express');
const router = express.Router();
const { getMandiRates, getMarketplaceItems, getSchemes, seedDatabase } = require('../controllers/dataController');

router.get('/mandi', getMandiRates);
router.get('/marketplace', getMarketplaceItems);
router.get('/schemes', getSchemes);
router.post('/seed', seedDatabase);

module.exports = router;
