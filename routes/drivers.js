var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/', function(req, res, next) {
  //res.sendFile(path.join(__dirname, '../views', 'drivers.html'));
  res.render('drivers', {});
});

module.exports = router;
