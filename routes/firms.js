var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  console.log(req.user);
  if (typeof req.user == 'undefined') {
    res.render('login');
  } else if (req.user.role == 'admin'){
    res.render('firms', {user: req.user});
  } else if (req.user.role == 'ops' || req.user.role == 'observer') {
    res.render('firms-obs', {user: req.user});
  }
});

var firmsDb = require('../models/firms');
router.use('/api', firmsDb);

module.exports = router;