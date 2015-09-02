var express = require('express');
var router = express.Router();
var pg = require('pg');
//noinspection JSUnresolvedVariable
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kacmaz';

router.get('/', function (req, res) {
  if (typeof req.user == 'undefined') {
    res.render('login');
  } else {
    res.render('shipments', {user: req.user});
  }
});

router.get('/api/options', function (req, res) {
  // TODO: Making parallel queries on different connections is a possibility. Performance looks good atm, so not immediately necessary.
  var options = {};
  options.tractorPlateOptions = [];
  options.trailerPlateOptions = [];
  options.driverOptions = [];
  options.locationOptions = [];
  options.productOptions = [];
  pg.connect(connectionString, function (err, client, done) {
    // language=SQL
    var plateQuery = client.query('SELECT license_plate, type FROM vehicles ORDER BY name');
    plateQuery.on('row', function (row) {
      if (row.type === 'Dorse') options.trailerPlateOptions.push(row.license_plate);
      else options.tractorPlateOptions.push(row.license_plate);
    });
    plateQuery.on('end', function () {
      // language=SQL
      var driverQuery = client.query('SELECT name, surname, id_number FROM drivers ORDER BY name');
      driverQuery.on('row', function (row) {
        options.driverOptions.push(row.name + ' ' + row.surname + ' - ' + row.id_number);
      });
      driverQuery.on('end', function () {
        // language=SQL
        var locationQuery = client.query('SELECT name FROM locations ORDER BY name');
        locationQuery.on('row', function (row) {
          options.locationOptions.push(row.name);
        });
        locationQuery.on('end', function () {
          // language=SQL
          var productQuery = client.query('SELECT name FROM products ORDER BY name');
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

router.get('/api', function (req, res) {
  var results = [];
  pg.connect(connectionString, function (err, client, done) {
    // language=SQL
    var query = client.query('SELECT * FROM shipments ORDER BY id DESC');
    query.on('row', function (row) {
      row.DT_RowId = row.id;
      row.loading_date = formatDate(row.loading_date);
      row.delivery_date = formatDate(row.delivery_date);
      row.cmr_date = formatDate(row.cmr_date);
      row.payment_date = formatDate(row.payment_date);
      results.push(row);
    });
    query.on('end', function () {
      done();
      return res.json({data: results});
    });
  });
});

function applyBusinessRulesThenPersist(data) {
  if (data.loading_location) {
    pg.connect(connectionString, function (err, client, done) {
      console.log('bla');
      // language=SQL
      var query = client.query('SELECT country FROM locations WHERE name LIKE ($1)', [data.loading_location]);
      console.log('yada');
      var result;
      query.on('row', function (row) {
        result = row.country;
      });
      query.on('end', function () {
        done();
        if (result == 'Irak' && data.delivery_weight && data.customs_weight) {
          data.customs_loss = data.customs_weight - data.delivery_weight;
        } else if (result == 'Türkiye' && data.customs_weight && data.loading_weight) {
          data.customs_loss = data.loading_weight - data.customs_weight;
        }
        if (data.delivery_weight && data.loading_weight) {
          data.delivery_loss = data.delivery_weight - data.loading_weight;
        }
        persist(data);
      });
      if (err) console.log(err);
    });
  } else {
    persist(data);
  }
}

router.post('/api', function (req, res) {
  var data = {
    loading_date: parseDate(req.body["data[loading_date]"]),
    delivery_date: parseDate(req.body["data[delivery_date]"]),
    cmr_date: parseDate(req.body["data[cmr_date]"]),
    payment_date: parseDate(req.body["data[payment_date]"]),
    company_name: req.body["data[company_name]"],
    tractor_plate_number: req.body["data[tractor_plate_number]"],
    trailer_plate_number: req.body["data[trailer_plate_number]"],
    driver: req.body["data[driver]"],
    loading_location: req.body["data[loading_location]"],
    delivery_location: req.body["data[delivery_location]"],
    cmr_number: req.body["data[cmr_number]"],
    product: req.body["data[product]"],
    loading_weight: (req.body["data[loading_weight]"] || undefined),
    customs_weight: (req.body["data[customs_weight]"] || undefined),
    delivery_weight: (req.body["data[delivery_weight]"] || undefined),
    allowed_loss_rate: req.body["data[allowed_loss_rate]"],
    // customs_allowed_loss_amount?
    customs_loss: req.body["data[customs_loss]"],
    delivery_loss: req.body["data[delivery_loss]"],
    customs_loss_unit_price: req.body["data[customs_loss_unit_price]"],
    delivery_loss_unit_price: req.body["data[delivery_loss_unit_price]"],
    customs_loss_price: req.body["data[customs_loss_price]"],
    delivery_loss_price: req.body["data[delivery_loss_price]"],
    cmr_price: req.body["data[cmr_price]"],
    shipping_unit_price: req.body["data[shipping_unit_price]"],
    shipping_price: req.body["data[shipping_price]"],
    net_price: req.body["data[net_price]"]
  };

  console.log(data);
  var action = req.body.action;
  if (action === 'create') {
    if (data.loading_location) {
      pg.connect(connectionString, function (err, client, done) {
        // language=SQL
        var locationQuery = client.query('SELECT country FROM locations WHERE name LIKE ($1)', [data.loading_location]);
        var result = '';
        locationQuery.on('row', function (row) {
          result = row.country;
        });
        locationQuery.on('end', function () {
          done();
          if (result === 'Irak' && data.delivery_weight && data.customs_weight) {
            data.customs_loss = data.customs_weight - data.delivery_weight;
          } else if (result === 'Türkiye' && data.customs_weight && data.loading_weight) {
            data.customs_loss = data.loading_weight - data.customs_weight;
          }
          if (data.delivery_weight && data.loading_weight) {
            data.delivery_loss = data.loading_weight - data.delivery_weight;
          }
          insertShipment(client, done, data, res);
        });
        if (err) console.log(err);
      });
    } else {
      pg.connect(connectionString, function (err, client, done) {
        insertShipment(client, done, data, res);
      });
    }
  } else if (action === 'remove') {
    var ids = req.body['id[]'];
    pg.connect(connectionString, function (err, client, done) {
      var query;
      if (typeof ids == 'string') {
        //language=SQL
        query = client.query('DELETE FROM shipments WHERE id=($1)', [ids]);
      } else {
        //language=SQL
        query = client.query('DELETE FROM shipments WHERE id=ANY($1::INT[])', [ids]);
      }
      query.on('end', function () {
        done();
        res.json({});
      });
      if (err) {
        console.log(err);
      }
    });
  } else if (action === 'edit') {
    if (data.loading_location) {
      pg.connect(connectionString, function (err, client, done) {
        // language=SQL
        var locationQuery = client.query('SELECT country FROM locations WHERE name LIKE ($1)', [data.loading_location]);
        var result = '';
        locationQuery.on('row', function (row) {
          result = row.country;
          if (result == 'Irak' && data.delivery_weight && data.customs_weight) {
            data.customs_loss = data.customs_weight - data.delivery_weight;
          } else if (result == 'Türkiye' && data.customs_weight && data.loading_weight) {
            data.customs_loss = data.loading_weight - data.customs_weight;
          }
          if (data.delivery_weight && data.loading_weight) {
            data.delivery_loss = data.loading_weight - data.delivery_weight;
          }
          data.id = req.body.id;
          updateShipment(client, done, data, res);
        });
        if (err) console.log(err);
      });
    } else {
      data.id = req.body.id;
      pg.connect(connectionString, function (err, client, done) {
        updateShipment(client, done, data, res);
      });
    }
  }
});

function insertShipment(client, done, data, res) {
  // language=SQL
  var query = client.query('INSERT INTO shipments\
        (loading_date, delivery_date, cmr_date, payment_date, company_name, tractor_plate_number, trailer_plate_number, \
        driver, loading_location, delivery_location, cmr_number, product, loading_weight, customs_weight, delivery_weight,\
        allowed_loss_rate, customs_loss, delivery_loss, customs_loss_unit_price, delivery_loss_unit_price, customs_loss_price,\
        delivery_loss_price, cmr_price, shipping_unit_price, shipping_price, net_price) \
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26) \
        RETURNING *;', [
    data.loading_date, data.delivery_date, data.cmr_date, data.payment_date, data.company_name,
    data.tractor_plate_number, data.trailer_plate_number, data.driver, data.loading_location, data.delivery_location,
    data.cmr_number, data.product, data.loading_weight, data.customs_weight, data.delivery_weight,
    data.allowed_loss_rate, data.customs_loss, data.delivery_loss, data.customs_loss_unit_price, data.delivery_loss_unit_price,
    data.customs_loss_price, data.delivery_loss_price, data.cmr_price, data.shipping_unit_price, data.shipping_price,
    data.net_price
  ]);
  var result = {};
  query.on('row', function (row) {
    row.DT_RowId = row.id;
    row.loading_date = formatDate(row.loading_date);
    row.delivery_date = formatDate(row.delivery_date);
    row.cmr_date = formatDate(row.cmr_date);
    row.payment_date = formatDate(row.payment_date);
    result = row;
  });
  query.on('end', function () {
    done();
    return res.json(result);
  });
}

function updateShipment(client, done, data, res) {
  // language=SQL
  var query = client.query('UPDATE shipments\
        SET loading_date=($1), delivery_date=($2), cmr_date=($3), payment_date=($4), company_name=($5),\
            tractor_plate_number=($6), trailer_plate_number=($7), driver=($8), loading_location=($9), delivery_location=($10),\
            cmr_number=($11), product=($12), loading_weight=($13), customs_weight=($14), delivery_weight=($15), \
            allowed_loss_rate=($16), customs_loss=($17), delivery_loss=($18), customs_loss_unit_price=($19), delivery_loss_unit_price=($20), \
            customs_loss_price=($21), delivery_loss_price=($22), cmr_price=($23), shipping_unit_price=($24), shipping_price=($25), \
            net_price=($26)\
        WHERE id=($27)\
        RETURNING *;', [
    data.loading_date, data.delivery_date, data.cmr_date, data.payment_date, data.company_name,
    data.tractor_plate_number, data.trailer_plate_number, data.driver, data.loading_location, data.delivery_location,
    data.cmr_number, data.product, data.loading_weight, data.customs_weight, data.delivery_weight,
    data.allowed_loss_rate, data.customs_loss, data.delivery_loss, data.customs_loss_unit_price, data.delivery_loss_unit_price,
    data.customs_loss_price, data.delivery_loss_price, data.cmr_price, data.shipping_unit_price, data.shipping_price,
    data.net_price, data.id
  ]);
  var result = {};
  query.on('row', function (row) {
    row.DT_RowId = row.id;
    row.loading_date = formatDate(row.loading_date);
    row.delivery_date = formatDate(row.delivery_date);
    row.cmr_date = formatDate(row.cmr_date);
    row.payment_date = formatDate(row.payment_date);
    console.log(row);
    result = row;
  });
  query.on('end', function () {
    done();
    return res.json(result);
  });
}

module.exports = router;