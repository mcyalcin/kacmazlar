var express = require('express');
var router = express.Router();
var connectionString = require('../models/database');
var pg = require('pg');

router.get('/', function (req, res) {
  if (typeof req.user == 'undefined') {
    res.render('login');
  } else {
    if (req.user.role == 'admin') {
      res.render('users', {user: req.user});
    } else {
      res.render('index', {user: req.user});
    }
  }
});

router.get('/api', function (req, res) {
  pg.connect(connectionString, function (err, client, done) {
    // language=SQL
    var query = client.query('SELECT * FROM users');
    var results = [];
    query.on('row', function (row) {
      row.DT_RowId = row.id;
      results.push(row);
    });
    query.on('end', function () {
      done();
      return res.json({data: results});
    });
    if (err) {
      console.log(err);
    }
  });
});

router.post('/api', function (req, res) {
  var data = {
    name: req.body["data[name]"],
    password: req.body["data[password]"],
    role: req.body["data[role]"]
  };
  var action = req.body.action;
  if (action == 'create') {
    pg.connect(connectionString, function (err, client, done) {
      // language=SQL
      var query = client.query('INSERT INTO users(name, role, password) VALUES($1, $2, $3) RETURNING *',
        [data.name, data.role, data.password]);
      var result = {};
      query.on('row', function (row) {
        row.DT_RowId = row.id;
        result = row;
      });
      query.on('end', function () {
        done();
        res.json({row: result});
      });
      if (err) {
        console.log(err);
      }
    });
  } else if (action == 'remove') {
    var ids = req.body['id[]'];
    pg.connect(connectionString, function (err, client, done) {
      var query;
      if (typeof ids == 'string') {
        // language=SQL
        query = client.query('DELETE FROM users WHERE id=($1)', [ids]);
      } else {
        // language=SQL
        query = client.query('DELETE FROM users WHERE id=ANY($1::INT[])', [ids]);
      }
      query.on('end', function () {
        done();
        res.json({});
      });
      if (err) {
        console.log(err);
      }
    });
  } else if (action == 'edit') {
    var id = req.body.id;
    pg.connect(connectionString, function (err, client, done) {
      // language=SQL
      var query = client.query('UPDATE users SET name=($1), role=($2), password=($3) WHERE id=($4) RETURNING *',
        [data.name, data.role, data.password, id]);
      var result = {};
      query.on('row', function (row) {
        row.DT_RowId = row.id;
        result = row;
      });
      query.on('end', function () {
        done();
        res.json({row: result});
      });
      if (err) {
        console.log(err);
      }
    });
  }
});

module.exports = router;
