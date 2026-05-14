const express = require('express');
const router = express.Router();
const { getHomeConfig, updateHomeConfig } = require('../controllers/homeConfigController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getHomeConfig);
router.put('/', protect, adminOnly, updateHomeConfig);

module.exports = router;
