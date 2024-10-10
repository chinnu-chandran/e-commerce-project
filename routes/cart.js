const path = require('path');

const express = require('express');

const rootDir = require('../util/path');

const router = express.Router();
const adminData = require('./admin');

router.get('/', (req, res, next) => {
  console.log('cart.js',adminData.products);
  res.sendFile(path.join(rootDir, 'views', 'cart.html'));
});

module.exports = router;
