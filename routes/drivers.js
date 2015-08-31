var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  if (typeof req.user == 'undefined') {
    res.render('login');
  } else {
    res.render('drivers', {user: req.user});
  }
});

var driversDb = require('../models/drivers');
router.use('/api', driversDb);

module.exports = router;
