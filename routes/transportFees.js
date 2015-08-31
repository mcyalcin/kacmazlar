var express = require('express');
var router = express.Router();
var pg = require('pg');
//noinspection JSUnresolvedVariable
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kacmaz';

router.get('/', function(req, res) {
  if (typeof req.user == 'undefined') {
    res.render('login');
  } else {
    res.render('transportFees', req.user);
  }
});

router.get('/api/options', function (req, res) {
  var options = {};
  options.productOptions = [];
  options.locationOptions = [];
  pg.connect(connectionString, function (err, client, done) {
    // language=SQL
    var productsQuery = client.query('SELECT name FROM products');
    productsQuery.on('row', function (row) {
      options.productOptions.push(row.name);
      if (!options.productDef) options.productDef = row.name;
    });
    productsQuery.on('end', function () {
      // language=SQL
      var locationsQuery = client.query('SELECT name FROM locations');
      locationsQuery.on('row', function(row) {
        options.locationOptions.push(row.name);
        options.locationDef = row.name;
      });
      locationsQuery.on('end', function() {
        done();
        return res.json(options);
      });
    });
    if (err) {
      console.log(err);
    }
  });
});

router.get('/api', function(req, res) {
  pg.connect(connectionString, function(err, client, done) {
    // language=SQL
    var query = client.query(
      'SELECT \
       p.name as product,\
       f.name as "from",\
       t.name as "to",\
       u.unit_price as unit_price,\
       u.id as id\
       FROM transport_prices u\
       LEFT JOIN locations f ON u."from" = f.id\
       LEFT JOIN locations t ON u.to = t.id\
       LEFT JOIN products p ON u.product = p.id'
    );
    var result = [];
    query.on('row', function(row) {
      row.DT_RowId = row.id;
      result.push(row);
    });
    query.on('end', function() {
      done();
      return res.json({data: result});
    });
    if (err) console.log(err);
  });
});

//noinspection JSUnresolvedFunction
router.post('/api', function(req, res) {
  var data = {
    product: req.body["data[product]"],
    from: req.body["data[from]"],
    to: req.body["data[to]"],
    unit_price: req.body["data[unit_price]"]
  };
  var action = req.body.action;
  if (action == 'create') {
    pg.connect(connectionString, function(err, client, done){
      // language=SQL
      var query = client.query(
        'INSERT INTO transport_prices(product, "from", "to", unit_price)\
           SELECT p.id, f.id, t.id, ($4)\
           FROM products as p, locations as f, locations as t\
           WHERE p.name like ($1) AND f.name like ($2) AND t.name like ($3)\
         RETURNING id',
        [data.product, data.from, data.to, data.unit_price]
      );
      var id;
      query.on('row', function(row) {
        id = row.id;
      });
      query.on('end', function() {
        // language=SQL
        var select = client.query('SELECT \
        p.name as product,\
        f.name as "from",\
        t.name as "to",\
        u.unit_price as unit_price,\
        u.id as DT_RowId\
        FROM transport_prices u\
        LEFT JOIN locations f ON u."from" = f.id\
        LEFT JOIN locations t ON u.to = t.id\
        LEFT JOIN products p ON u.product = p.id\
        WHERE u.id = ($1)', [id]);
        var result;
        select.on('row', function(row) {
          result = row;
        });
        select.on('end', function() {
          done();
          return res.json(result);
        });
      });
      if (err) console.log(err);
    });
  } else if (action == 'remove') {
    var ids = req.body['id[]'];
    pg.connect(connectionString, function (err, client, done) {
      var query;
      if (typeof ids == 'string') {
        //language=SQL
        query = client.query('DELETE FROM transport_prices WHERE id=($1)', [ids]);
      } else {
        //language=SQL
        query = client.query('DELETE FROM transport_prices WHERE id=ANY($1::INT[])', [ids]);
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
    pg.connect(connectionString, function(err, client, done) {
      // language=SQL
      var query = client.query(
        'UPDATE transport_prices SET product = f.pid, "from" = f.fid, "to" = f.tid, unit_price = ($4)\
         FROM (SELECT p.id as pid, f.id as fid, t.id as tid FROM products as p, locations as f, locations as t WHERE p.name LIKE ($1) AND f.name LIKE ($2) AND t.name LIKE ($3)) f\
         WHERE id = ($5)',
        [data.product, data.from, data.to, data.unit_price, id]
      );
      query.on('end', function() {
        // language=SQL
        var select = client.query('SELECT \
        p.name as product,\
        f.name as "from",\
        t.name as "to",\
        u.unit_price as unit_price,\
        u.id as DT_RowId\
        FROM transport_prices u\
        LEFT JOIN locations f ON u."from" = f.id\
        LEFT JOIN locations t ON u.to = t.id\
        LEFT JOIN products p ON u.product = p.id\
        WHERE u.id = ($1)', [id]);
        var result;
        select.on('row', function(row) {
          result = row;
        });
        select.on('end', function() {
          done();
          return res.json(result);
        });
      });
      if (err) console.log(err);
    });
  }
});

module.exports = router;