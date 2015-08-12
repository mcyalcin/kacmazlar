var connectionString = require('./database');
var express = require('express');
var router = express.Router();
var pg = require('pg');

function getCmrPrices(res) {
  var results = [];
  pg.connect(connectionString, function (err, client, done) {
    var query = client.query('select * from cmr_prices order by id asc');
    query.on('row', function (row) {
      row.DT_RowId = row.id;
      row.start_date = formatDate(row.start_date);
      row.end_date = formatDate(row.end_date);
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

function formatDate(str) {
  if (!str) return null;
  var date = new Date(str);
  return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
}

function parseDate(str) {
  if (!str) return null;
  var split = str.split('.');
  return new Date(split[2], split[1] - 1, split[0]);
}

router.post('/', function (req, res) {
  var data = {
    price: req.body["data[price]"],
    start_date: parseDate(req.body["data[start_date]"]),
    end_date: parseDate(req.body["data[end_date]"])
  };
  var action = req.body.action;
  if (action == 'create') {
    pg.connect(connectionString, function (err, client, done) {
      var query;
      if (data.start_date)
        if (data.end_date)
          query = client.query('insert into cmr_prices(price, start_date, end_date) values($1, $2, $3) returning *',
            [data.price, data.start_date, data.end_date]);
        else
          query = client.query('insert into cmr_prices(price, start_date) values($1, $2) returning *',
            [data.price, data.start_date]);
      else
        query = client.query('insert into cmr_prices(price) values($1) returning *',
          [data.price]);
      var result = {};
      query.on('row', function (row) {
        row.DT_RowId = row.id;
        row.start_date = formatDate(row.start_date);
        row.end_date = formatDate(row.end_date);
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
        query = client.query('delete from cmr_prices where id=($1)', [ids]);
      } else {
        query = client.query('delete from cmr_prices where id=any($1::int[])', [ids]);
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
      var query = client.query('update cmr_prices set price=($1), start_date=($2), end_date=($3) where id=($4) returning *',
        [data.price, data.start_date, data.end_date, id]);
      var result = {};
      query.on('row', function (row) {
        row.DT_RowId = row.id;
        row.start_date = formatDate(row.start_date);
        row.end_date = formatDate(row.end_date);
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
  getCmrPrices(res);
});

module.exports = router;