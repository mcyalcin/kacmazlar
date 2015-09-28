var connectionString = require('./database');
var express = require('express');
var router = express.Router();
var pg = require('pg');

function getCmrPrices(res) {
  var results = [];
  pg.connect(connectionString, function (err, client, done) {
    // language=SQL
    var query = client.query(
      'SELECT c.id, p.name AS product, c.price, c.start_date, c.end_date\
       FROM cmr_prices c\
       LEFT JOIN products p ON c.product = p.id\
       ORDER BY id ASC'
    );
    query.on('row', function (row) {
      row.DT_RowId = row.id;
      row.start_date = formatDate(row.start_date);
      row.end_date = formatDate(row.end_date);
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
    product: req.body["data[product]"],
    price: parseFloat(req.body["data[price]"].replace(/,/,'.')),
    start_date: parseDate(req.body["data[start_date]"]),
    end_date: parseDate(req.body["data[end_date]"])
  };
  var action = req.body.action;
  if (action == 'create') {
    pg.connect(connectionString, function (err, client, done) {
      // language=SQL
      var query = client.query(
        'INSERT INTO cmr_prices(product, price, start_date, end_date) \
           SELECT p.id, ($1), ($2), ($3) \
           FROM products p \
           WHERE p.name LIKE ($4) \
         RETURNING id',
        [data.price, data.start_date, data.end_date, data.product]);
      var id;
      query.on('row', function (row) {
        id = row.id;
      });
      query.on('end', function () {
        // language=SQL
        var select = client.query(
          'SELECT c.id, p.name AS product, c.price, c.start_date, c.end_date\
           FROM cmr_prices c\
           LEFT JOIN products p ON c.product = p.id\
           WHERE c.id = ($1)', [id]
        );
        var result;
        select.on('row', function (row) {
          row.DT_RowId = row.id;
          row.start_date = formatDate(row.start_date);
          row.end_date = formatDate(row.end_date);
          result = row;
        });
        select.on('end', function () {
          done();
          res.json({row: result});
        });
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
        query = client.query('DELETE FROM cmr_prices WHERE id=($1)', [ids]);
      } else {
        // language=SQL
        query = client.query('DELETE FROM cmr_prices WHERE id=ANY($1::INT[])', [ids]);
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
      var query = client.query(
        'UPDATE cmr_prices AS c SET product = s.id, price=($1), start_date=($2), end_date=($3) \
         FROM (SELECT p.id FROM products AS p WHERE name LIKE ($4)) s\
         WHERE c.id=($5) RETURNING *',
        [data.price, data.start_date, data.end_date, data.product, id]);
      query.on('end', function () {
        // language=SQL
        var select = client.query(
          'SELECT c.id, p.name AS product, c.price, c.start_date, c.end_date\
           FROM cmr_prices c\
           LEFT JOIN products p ON c.product = p.id\
           WHERE c.id = ($1)', [id]
        );
        var result;
        select.on('row', function (row) {
          row.DT_RowId = row.id;
          row.start_date = formatDate(row.start_date);
          row.end_date = formatDate(row.end_date);
          result = row;
        });
        select.on('end', function () {
          done();
          res.json({row: result});
        });
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

router.get('/options', function (req, res) {
  var options = {};
  options.productOptions = [];
  pg.connect(connectionString, function (err, client, done) {
    // language=SQL
    var productsQuery = client.query('SELECT name FROM products');
    productsQuery.on('row', function (row) {
      options.productOptions.push(row.name);
      if (!options.productDef) options.productDef = row.name;
    });
    productsQuery.on('end', function () {
      done();
      return res.json(options);
    });
    if (err) {
      console.log(err);
    }
  });
});

module.exports = router;