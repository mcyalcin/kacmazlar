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
    var plateQuery = client.query('SELECT license_plate, type FROM vehicles ORDER BY license_plate');
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

function setLoss(client, done, data, res, callback) {
  if (data.loading_location && data.delivery_weight && data.customs_weight && data.loading_weight) {
    // language=SQL
    var locationQuery = client.query('SELECT country FROM locations WHERE name LIKE ($1)', [data.loading_location]);
    var result = '';
    locationQuery.on('row', function (row) {
      result = row.country;
    });
    locationQuery.on('end', function () {
      if (result === 'Irak' && data.delivery_weight && data.customs_weight) {
        data.customs_loss = data.customs_weight - data.delivery_weight;
      } else if (result === 'Türkiye' && data.customs_weight && data.loading_weight) {
        data.customs_loss = data.loading_weight - data.customs_weight;
      }
      if (data.delivery_weight && data.loading_weight) {
        data.delivery_loss = data.loading_weight - data.delivery_weight;
      }
      setFirm(client, done, data, res, callback)
    });
  } else {
    setFirm(client, done, data, res, callback)
  }
}

function setFirm(client, done, data, res, callback) {
  if (data.tractor_plate_number) {
    // language=SQL
    var firmQuery = client.query('SELECT c2_holder.name AS name FROM vehicles vehicle \
      LEFT JOIN firms c2_holder ON c2_holder.id = vehicle.c2_holder_firm\
      WHERE vehicle.license_plate LIKE ($1)', [data.tractor_plate_number]);
    var result = '';
    firmQuery.on('row', function (row) {
      result = row.name;
    });
    firmQuery.on('end', function () {
      data.company_name = result;
      setLossData(client, done, data, res, callback);
    });
  } else {
    setLossData(client, done, data, res, callback);
  }
}

function setLossData(client, done, data, res, callback) {
  if (data.product && data.loading_weight) {
    // language=SQL
    var productQuery = client.query('SELECT * FROM products WHERE name LIKE ($1)', [data.product]);
    var result = {};
    productQuery.on('row', function (row) {
      result = row;
    });
    productQuery.on('end', function () {
      if (!isNaN(result.allowed_waste)) {
        data.delivery_allowed_loss_amount = parseFloat(result.allowed_waste);
      } else if (!isNaN(result.allowed_waste_rate)) {
        data.delivery_allowed_loss_amount = parseFloat(result.allowed_waste_rate) * data.loading_weight;
      }
      data.delivery_loss_unit_price = result.waste_unit_cost;
      setCustomsLossData(client, done, data, res, callback);
    });
  } else {
    setCustomsLossData(client, done, data, res, callback);
  }
}

function setCustomsLossData(client, done, data, res, callback) {
  if (data.product && data.loading_weight) {
    // language=SQL
    var customsQuery = client.query('SELECT * FROM customs_wastage_costs c LEFT JOIN products p ON c.product = p.id WHERE p.name LIKE ($1)', [data.product]);
    var result = {};
    customsQuery.on('row', function(row) {
      result = row;
    });
    console.log(data);
    customsQuery.on('end', function() {
      if (!isNaN(result.allowed)) {
        data.customs_allowed_loss_amount = parseFloat(result.allowed);
      } else if (!isNaN(result.allowed_rate)) {
        console.log(result);
        data.customs_allowed_loss_amount = parseFloat(result.allowed_rate) * data.loading_weight;
      }
      data.customs_loss_unit_price = result.unit_cost;
      setPriceData(client, done, data, res, callback);
    });
  } else {
    setPriceData(client, done, data, res, callback);
  }
}

function setPriceData(client, done, data, res, callback) {
  if (data.product && data.loading_location && data.delivery_location) {
    // language=SQL
    var priceQuery = client.query('SELECT * FROM transport_prices t LEFT JOIN products p WHERE t.product = p.id AND p.name like ($1) and t.from like ($2) and t.to like ($3)', [data.product, data.loading_location, data.delivery_location]);
    var result = {};
    priceQuery.on('row', function(row) {
      result = row;
    });
    priceQuery.on('end', function() {
      data.shipping_unit_price = result.unit_price;
    });
    callback(client, done, data, res, callback);
  } else {
    callback(client, done, data, res, callback);
  }
}

router.post('/api', function (req, res) {
  var data = {
    loading_date: parseDate(req.body["data[loading_date]"]),
    customs_entry_date: parseDate(req.body["data[customs_entry_date]"]),
    customs_exit_date: parseDate(req.body["data[customs_exit_date]"]),
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
    loading_weight: parseFloat(req.body["data[loading_weight]"]),
    customs_weight: parseFloat(req.body["data[customs_weight]"]),
    delivery_weight: parseFloat(req.body["data[delivery_weight]"]),
    customs_loss: parseFloat(req.body["data[customs_loss]"]),
    delivery_loss: parseFloat(req.body["data[delivery_loss]"]),
    customs_loss_unit_price: parseFloat(req.body["data[customs_loss_unit_price]"]),
    delivery_loss_unit_price: parseFloat(req.body["data[delivery_loss_unit_price]"]),
    customs_loss_price: parseFloat(req.body["data[customs_loss_price]"]),
    delivery_loss_price: parseFloat(req.body["data[delivery_loss_price]"]),
    cmr_price: parseFloat(req.body["data[cmr_price]"]),
    shipping_unit_price: parseFloat(req.body["data[shipping_unit_price]"]),
    shipping_price: parseFloat(req.body["data[shipping_price]"]),
    customs_allowed_loss_amount: parseFloat(req.body["data[customs_allowed_loss_amount]"]),
    delivery_allowed_loss_amount: parseFloat(req.body["data[delivery_allowed_loss_amount]"]),
    net_price: parseFloat(req.body["data[net_price]"]),
    transportation_unit_price: parseFloat(req.body["data[transportation_unit_price]"]),
    transportation_price: parseFloat(req.body["data[transportation_price]"])
  };
  var action = req.body.action;
  if (action === 'create') {
    pg.connect(connectionString, function (err, client, done) {
      setLoss(client, done, data, res, insertShipment);
      if (err) console.log(err);
    });
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
    pg.connect(connectionString, function (err, client, done) {
      setLoss(client, done, data, res, updateShipment);
      if (err) console.log(err);
    });
  }
});

function doCalculations(data) {
  if (data.delivery_allowed_loss_amount < data.delivery_loss) {
    data.delivery_loss_price = data.delivery_loss_unit_price * (data.delivery_loss - data.delivery_allowed_loss_amount);
  } else {
    data.delivery_loss_price = 0;
  }
  if (data.customs_allowed_loss_amount < Math.abs(data.customs_loss)) {
    data.customs_loss_price = data.customs_loss_unit_price * Math.abs(data.customs_loss);
  } else {
    data.customs_loss_price = 0;
  }
  return data;
}

function insertShipment(client, done, data, res) {
  // language=SQL
  data = doCalculations(data);
  var query = client.query('INSERT INTO shipments\
        (loading_date, delivery_date, cmr_date, payment_date, company_name, tractor_plate_number, trailer_plate_number, \
        driver, loading_location, delivery_location, cmr_number, product, loading_weight, customs_weight, delivery_weight,\
        customs_loss, delivery_loss, customs_loss_unit_price, delivery_loss_unit_price, customs_loss_price,\
        delivery_loss_price, cmr_price, shipping_unit_price, shipping_price, net_price, customs_entry_date,\
        customs_exit_date, transportation_unit_price, transportation_price, customs_allowed_loss_amount, delivery_allowed_loss_amount) \
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31) \
        RETURNING *;', [
    data.loading_date, data.delivery_date, data.cmr_date, data.payment_date, data.company_name,
    data.tractor_plate_number, data.trailer_plate_number, data.driver, data.loading_location, data.delivery_location,
    data.cmr_number, data.product, data.loading_weight, data.customs_weight, data.delivery_weight,
    data.customs_loss, data.delivery_loss, data.customs_loss_unit_price, data.delivery_loss_unit_price,
    data.customs_loss_price, data.delivery_loss_price, data.cmr_price, data.shipping_unit_price, data.shipping_price,
    data.net_price, data.customs_entry_date, data.customs_exit_date, data.transportation_unit_price, data.transportation_price,
    data.customs_allowed_loss_amount, data.delivery_allowed_loss_amount
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
  data = doCalculations(data);
  var query = client.query('UPDATE shipments\
        SET loading_date=($1), delivery_date=($2), cmr_date=($3), payment_date=($4), company_name=($5),\
            tractor_plate_number=($6), trailer_plate_number=($7), driver=($8), loading_location=($9), delivery_location=($10),\
            cmr_number=($11), product=($12), loading_weight=($13), customs_weight=($14), delivery_weight=($15), \
            customs_loss=($17), delivery_loss=($18), customs_loss_unit_price=($19), delivery_loss_unit_price=($20), \
            customs_loss_price=($21), delivery_loss_price=($22), cmr_price=($23), shipping_unit_price=($24), shipping_price=($25), \
            net_price=($26)\
        WHERE id=($27)\
        RETURNING *;', [
    data.loading_date, data.delivery_date, data.cmr_date, data.payment_date, data.company_name,
    data.tractor_plate_number, data.trailer_plate_number, data.driver, data.loading_location, data.delivery_location,
    data.cmr_number, data.product, data.loading_weight, data.customs_weight, data.delivery_weight,
    data.customs_loss, data.delivery_loss, data.customs_loss_unit_price, data.delivery_loss_unit_price,
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