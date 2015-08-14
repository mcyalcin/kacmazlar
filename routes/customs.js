var express = require('express');
var router = express.Router();
var pg = require('pg');
//noinspection JSUnresolvedVariable
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kacmaz';

router.get('/', function (req, res) {
  res.render('customs');
});

router.get('/api/options', function (req, res) {
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

router.get('/api', function (req, res) {
  pg.connect(connectionString, function (err, client, done) {
    var results = [];
    // language=SQL
    var query = client.query('SELECT p.name AS product, c.id, c.allowed, c.start_date, c.end_date, c.unit_cost FROM customs_wastage_costs c LEFT JOIN products p ON c.product = p.id');
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
});

//noinspection JSUnresolvedFunction
router.post('/api', function (req, res) {
  var data = {
    product: req.body["data[product]"],
    allowed: req.body["data[allowed]"],
    unit_cost: req.body["data[unit_cost]"],
    start_date: parseDate(req.body["data[start_date]"]),
    end_date: parseDate(req.body["data[end_date]"])
  };
  var action = req.body.action;
  if (action == 'create') {
    pg.connect(connectionString, function (err, client, done) {
      // language=SQL
      var query = client.query(
        'INSERT INTO customs_wastage_costs(product, allowed, unit_cost, start_date, end_date) \
           SELECT p.id, ($2), ($3), ($4), ($5)\
           FROM products AS p \
           WHERE p.name LIKE ($1)\
         RETURNING *',
        [data.product, data.allowed, data.unit_cost, data.start_date, data.end_date]
      );
      var id;
      query.on('row', function (row) {
        id = row.id;
      });
      query.on('end', function () {
        // language=SQL
        var select = client.query('SELECT p.name AS product, c.id, c.allowed, c.start_date, c.end_date, c.unit_cost FROM customs_wastage_costs c LEFT JOIN products p ON c.product = p.id WHERE c.id = ($1)', [id]);
        var result;
        select.on('row', function(row) {
          row.DT_RowId = row.id;
          row.start_date = formatDate(row.start_date);
          row.end_date = formatDate(row.end_date);
          result = row;
        });
        select.on('end', function() {
          done();
          return res.json(result);
        });
        if (err) console.log(err);
      });
      if (err) console.log(err);
    });
  } else if (action == 'remove') {
    var ids = req.body['id[]'];
    pg.connect(connectionString, function (err, client, done) {
      var query;
      if (typeof ids == 'string') {
        //language=SQL
        query = client.query('DELETE FROM customs_wastage_costs WHERE id=($1)', [ids]);
      } else {
        //language=SQL
        query = client.query('DELETE FROM customs_wastage_costs WHERE id=ANY($1::INT[])', [ids]);
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
    pg.connect(connectionString, function (err, client, done) {
      var id = req.body.id;
      // language=SQL
      var query = client.query(
        'UPDATE customs_wastage_costs as c\
         SET product = p.id,\
         allowed = ($2),\
         unit_cost = ($3),\
         start_date = ($4),\
         end_date = ($5)\
         FROM (SELECT id FROM products WHERE name like ($1)) p\
         WHERE c.id = ($6)',
        [data.product, data.allowed, data.unit_cost, data.start_date, data.end_date, id]
      );
      query.on('end', function () {
        // language=SQL
        var select = client.query('SELECT p.name AS product, c.id, c.allowed, c.start_date, c.end_date, c.unit_cost FROM customs_wastage_costs c LEFT JOIN products p ON c.product = p.id WHERE c.id = ($1)', [id]);
        var result;
        select.on('row', function(row) {
          row.DT_RowId = row.id;
          row.start_date = formatDate(row.start_date);
          row.end_date = formatDate(row.end_date);
          result = row;
        });
        select.on('end', function() {
          done();
          return res.json(result);
        });
        if (err) console.log(err);
      });
      if (err) console.log(err);
    });
  }
});

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

module.exports = router;