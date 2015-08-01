var connectionString = require('./database');
var express = require('express');
var router = express.Router();
var pg = require('pg');

function getLocations(res) {
  var results = [];
  pg.connect(connectionString, function (err, client, done) {
    var query = client.query('select * from locations order by id asc');
    query.on('row', function (row) {
      row.DT_RowId = row.id;
      results.push(row);
    });
    query.on('end', function () {
      client.end();
      return res.json({data: results});
    });
    if (err) {
      console.log(err);
    }
  });
}

router.post('/', function (req, res) {
  var data = {
    name: req.body["data[name]"],
    country: req.body["data[country]"]
  };
  var action = req.body.action;
  if (action == 'create') {
    pg.connect(connectionString, function (err, client, done) {
      var query = client.query('insert into locations(name, country) values($1, $2) returning *',
        [data.name, data.country]);
      var result = {};
      query.on('row', function (row) {
        row.DT_RowId = row.id;
        result = row;
      });
      query.on('end', function () {
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
        query = client.query('delete from locations where id=($1)', [id]);
      } else {
        query = client.query('delete from locations where id=any($1::int[])', [ids]);
      }
      query.on('end', function () {
        client.end();
        res.json({});
      });
      if (err) {
        console.log(err);
      }
    });
  } else if (action == 'edit') {
    var id = req.body.id;
    pg.connect(connectionString, function (err, client, done) {
      var query = client.query('update locations set name=($1), country=($2) where id=($3) returning *',
        [data.name, data.country, id]);
      var result = {};
      query.on('row', function (row) {
        row.DT_RowId = row.id;
        result = row;
      });
      query.on('end', function () {
        res.json({row: result});
      });
      if (err) {
        console.log(err);
      }
    });
  }
});

router.get('/', function (req, res) {
  getLocations(res);
});

module.exports = router;