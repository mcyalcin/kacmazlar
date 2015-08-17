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

module.exports = router;