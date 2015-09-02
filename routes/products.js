var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kacmaz';

router.get('/', function(req, res, next) {
  if (typeof req.user == 'undefined') {
    res.render('login');
  } else {
    res.render('products', {user: req.user});
  }
});

router.get('/api', function(req, res) {
  var results = [];
  pg.connect(connectionString, function (err, client, done) {
    var query = client.query('select * from products order by id asc');
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
    allowed_waste: req.body["data[allowed_waste]"],
    waste_unit_cost: req.body["data[waste_unit_cost]"]
  };
  console.log('a '+data.waste_unit_cost);
  var action = req.body.action;
  if (action == 'create') {
    pg.connect(connectionString, function (err, client, done) {
      var query = client.query('insert into products(name, allowed_waste, waste_unit_cost) values($1, $2, $3) returning *',
        [data.name, data.allowed_waste, data.waste_unit_cost]);
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
        query = client.query('delete from products where id=($1)', [ids]);
      } else {
        query = client.query('delete from products where id=any($1::int[])', [ids]);
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
      var query = client.query('update products set name=($1), allowed_waste=($2), waste_unit_cost=($3) where id=($4) returning *',
        [data.name, data.allowed_waste, data.waste_unit_cost, id]);
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