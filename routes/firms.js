var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  if (typeof req.user == 'undefined') {
    res.render('login');
  } else {
    res.render('firms', {user: req.user});
  }
});

var firmsDb = require('../models/firms');
router.use('/api', firmsDb);

module.exports = router;