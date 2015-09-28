var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kacmaz';

router.get('/', function (req, res, next) {
  if (typeof req.user == 'undefined') {
    res.render('login');
  } else {
    res.render('products', {user: req.user});
  }
});

router.get('/api', function (req, res) {
  var results = [];
  pg.connect(connectionString, function (err, client, done) {
    // language=SQL
    var query = client.query('SELECT * FROM products ORDER BY id ASC');
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
    allowed_waste: parseFloat(req.body["data[allowed_waste]"].replace(/,/,'.')),
    allowed_waste_rate: parseFloat(req.body["data[allowed_waste_rate]"].replace(/,/,'.')),
    waste_unit_cost: parseFloat(req.body["data[waste_unit_cost]"].replace(/,/,'.'))
  };
  console.log('a ' + data.waste_unit_cost);
  var action = req.body.action;
  if (action == 'create') {
    pg.connect(connectionString, function (err, client, done) {
      // language=SQL
      var query = client.query('INSERT INTO products(name, allowed_waste, allowed_waste_rate, waste_unit_cost) VALUES($1, $2, $3, $4) RETURNING *',
        [data.name, data.allowed_waste, data.allowed_waste_rate, data.waste_unit_cost]);
      var result = {};
      query.on('row', function (row) {
        row.DT_RowId = row.id;
        result = row;
      });
      query.on('end', function () {
        done();
        return res.json({row: result});
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
        query = client.query('DELETE FROM products WHERE id=($1)', [ids]);
      } else {
        // language=SQL
        query = client.query('DELETE FROM products WHERE id=ANY($1::INT[])', [ids]);
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
      var query = client.query('UPDATE products SET name=($1), allowed_waste=($2), allowed_waste_rate=($3), waste_unit_cost=($4) WHERE id=($5) RETURNING *',
        [data.name, data.allowed_waste, data.allowed_waste_rate, data.waste_unit_cost, id]);
      var result = {};
      query.on('row', function (row) {
        row.DT_RowId = row.id;
        console.log(row.waste_unit_cost);
        result = row;
      });
      query.on('end', function () {
        done();
        return res.json({row: result});
      });
      if (err) {
        console.log(err);
      }
    });
  }
});

module.exports = router;