const express = require('express');
const router = express.Router();
const { getHomeConfig } = require('../controllers/homeConfigController');

router.get('/', getHomeConfig);

module.exports = router;
