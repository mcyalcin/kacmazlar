var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kacmaz';

router.get('/', function(req, res) {
  res.render('login');
});

router.post('/', function(req, res) {
  res.json([]);
});

module.exports = router;