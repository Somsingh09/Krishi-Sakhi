const express = require('express');
const router = express.Router();
const { getMandiRates, getMarketplaceItems, getSchemes, seedDatabase, getProduce, addProduce, addTransport } = require('../controllers/dataController');

router.get('/mandi', getMandiRates);
router.get('/marketplace', getMarketplaceItems);
router.get('/schemes', getSchemes);
router.get('/produce', getProduce);
router.post('/produce', addProduce);
router.post('/transport', addTransport);
router.post('/seed', seedDatabase);

module.exports = router;
