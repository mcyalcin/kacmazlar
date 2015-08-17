var express = require('express');
var router = express.Router();
var pg = require('pg');
//noinspection JSUnresolvedVariable
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kacmaz';

router.get('/', function (req, res) {
  res.render('shipments', {});
});

router.get('/api/options', function (req, res) {
  // TODO: Making parallel queries on different connections is a possibility. Implement if needed.
  var options = {};
  options.tractorPlateOptions = [];
  options.trailerPlateOptions = [];
  options.driverOptions = [];
  options.locationOptions = [];
  options.productOptions = [];
  pg.connect(connectionString, function (err, client, done) {
    // language=SQL
    var plateQuery = client.query('SELECT license_plate, type FROM vehicles');
    plateQuery.on('row', function (row) {
      if (row.type === 'Dorse') options.trailerPlateOptions.push(row.license_plate);
      else options.tractorPlateOptions.push(row.license_plate);
    });
    plateQuery.on('end', function () {
      // language=SQL
      var driverQuery = client.query('SELECT name, surname, id_number FROM drivers');
      driverQuery.on('row', function (row) {
        options.driverOptions.push(row.name + ' ' + row.surname + ' - ' + row.id_number);
      });
      driverQuery.on('end', function () {
        // language=SQL
        var locationQuery = client.query('SELECT name FROM locations');
        locationQuery.on('row', function (row) {
          options.locationOptions.push(row.name);
        });
        locationQuery.on('end', function () {
          // language=SQL
          var productQuery = client.query('SELECT name FROM products');
          productQuery.on('row', function (row) {
            options.productOptions.push(row.name);
          });
          productQuery.on('end', function () {
            done();
            return res.json(options);
          });
        });
      });
    });
    if (err) console.log(err);
  });
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

router.get('/api', function(req, res) {
  var results = [];
  pg.connect(connectionString, function(err, client, done) {
    // language=SQL
    var query = client.query('SELECT * FROM shipments ORDER BY id DESC');
    query.on('row', function(row) {
      row.DT_RowId = row.id;
      row.loading_date = formatDate(row.loading_date);
      row.delivery_date = formatDate(row.delivery_date);
      row.cmr_date = formatDate(row.cmr_date);
      row.payment_date = formatDate(row.payment_date);
      results.push(row);
    });
    query.on('end', function() {
      done();
      return res.json({data: results});
    });
  });
});

router.post('/api', function(req, res) {

});

module.exports = router;