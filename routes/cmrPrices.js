var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  if (typeof req.user == 'undefined') {
    res.render('login');
  } else {
    res.render('cmrPrices', {user: req.user});
  }
});

var cmrPricesDb = require('../models/cmrPrices');
router.use('/api', cmrPricesDb);

module.exports = router;