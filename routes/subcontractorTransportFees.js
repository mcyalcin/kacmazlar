var express = require('express');
var router = express.Router();
var pg = require('pg');
//noinspection JSUnresolvedVariable
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kacmaz';

router.get('/', function (req, res) {
  if (typeof req.user == 'undefined') {
    res.render('login');
  } else if (req.user.role === 'admin') {
    res.render('subcontractorTransportFees', {user: req.user});
  } else {
    res.render('index', {user: req.user});
  }
});

router.get('/api/options', function (req, res) {
  var options = {};
  options.productOptions = [];
  options.locationOptions = [];
  options.firmOptions = [];
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
      locationsQuery.on('row', function (row) {
        options.locationOptions.push(row.name);
        options.locationDef = row.name;
      });
      locationsQuery.on('end', function () {
        // language=SQL
        var firmsQuery = client.query('SELECT name FROM firms');
        firmsQuery.on('row', function (row) {
          options.firmOptions.push(row.name);
          options.firmDef = row.name;
        });
        firmsQuery.on('end', function () {
          done();
          return res.json(options);
        });
      });
    });
    if (err) {
      console.log(err);
    }
  });
});

router.get('/api', function (req, res) {
  pg.connect(connectionString, function (err, client, done) {
    // language=SQL
    var query = client.query(
      'SELECT \
       firm.name AS firm,\
       p.name AS product,\
       f.name AS "from",\
       t.name AS "to",\
       u.unit_price AS unit_price,\
       u.id AS id\
       FROM subcontractor_transport_prices u\
       LEFT JOIN locations f ON u."from" = f.id\
       LEFT JOIN locations t ON u.to = t.id\
       LEFT JOIN products p ON u.product = p.id\
       LEFT JOIN firms firm ON u.firm = firm.id'
    );
    var result = [];
    query.on('row', function (row) {
      row.DT_RowId = row.id;
      result.push(row);
    });
    query.on('end', function () {
      done();
      return res.json({data: result});
    });
    if (err) console.log(err);
  });
});

//noinspection JSUnresolvedFunction
router.post('/api', function (req, res) {
  var data = {
    firm: req.body["data[firm]"],
    product: req.body["data[product]"],
    from: req.body["data[from]"],
    to: req.body["data[to]"],
    unit_price: parseFloat(req.body["data[unit_price]"].replace(/,/,'.'))
  };
  var action = req.body.action;
  if (action == 'create') {
    pg.connect(connectionString, function (err, client, done) {
      // language=SQL
      var query = client.query(
        'INSERT INTO subcontractor_transport_prices(firm, product, "from", "to", unit_price)\
           SELECT firm.id, p.id, f.id, t.id, ($4)\
           FROM products AS p, locations AS f, locations AS t, firms AS firm\
           WHERE p.name LIKE ($1) AND f.name LIKE ($2) AND t.name LIKE ($3) AND firm.name LIKE($5)\
         RETURNING id',
        [data.product, data.from, data.to, data.unit_price, data.firm]
      );
      var id;
      query.on('row', function (row) {
        id = row.id;
      });
      query.on('end', function () {
        // language=SQL
        var select = client.query('SELECT \
            firm.name AS firm,\
            p.name AS product,\
            f.name AS "from",\
            t.name AS "to",\
            u.unit_price AS unit_price,\
            u.id AS DT_RowId\
          FROM subcontractor_transport_prices u\
          LEFT JOIN locations f ON u."from" = f.id\
          LEFT JOIN locations t ON u.to = t.id\
          LEFT JOIN products p ON u.product = p.id\
          LEFT JOIN firms firm ON u.firm = firm.id\
          WHERE u.id = ($1)', [id]);
        var result;
        select.on('row', function (row) {
          result = row;
        });
        select.on('end', function () {
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
        query = client.query('DELETE FROM subcontractor_transport_prices WHERE id=($1)', [ids]);
      } else {
        //language=SQL
        query = client.query('DELETE FROM subcontractor_transport_prices WHERE id=ANY($1::INT[])', [ids]);
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
        'UPDATE subcontractor_transport_prices SET product = f.pid, "from" = f.fid, "to" = f.tid, firm = f.firmId, unit_price = ($4)\
         FROM (SELECT p.id AS pid, f.id AS fid, t.id AS tid, firm.id AS firmId FROM products AS p, locations AS f, firms AS firm, locations AS t WHERE p.name LIKE ($1) AND f.name LIKE ($2) AND t.name LIKE ($3) and firm.name LIKE ($6)) f\
         WHERE id = ($5)',
        [data.product, data.from, data.to, data.unit_price, id, data.firm]
      );
      query.on('end', function () {
        // language=SQL
        var select = client.query('SELECT \
            firm.name AS firm,\
            p.name AS product,\
            f.name AS "from",\
            t.name AS "to",\
            u.unit_price AS unit_price,\
            u.id AS DT_RowId\
          FROM subcontractor_transport_prices u\
          LEFT JOIN locations f ON u."from" = f.id\
          LEFT JOIN locations t ON u.to = t.id\
          LEFT JOIN products p ON u.product = p.id\
          LEFT JOIN firms firm ON u.firm = firm.id\
          WHERE u.id = ($1)', [id]);
        var result;
        select.on('row', function (row) {
          result = row;
        });
        select.on('end', function () {
          done();
          return res.json(result);
        });
      });
      if (err) console.log(err);
    });
  }
});

module.exports = router;