var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  if (typeof req.user == 'undefined') {
    res.render('login');
  } else {
    res.render('locations', {user: req.user});
  }
});

var locationsDb = require('../models/locations');

router.use('/api', locationsDb);

module.exports = router;