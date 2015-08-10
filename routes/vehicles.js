var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kacmaz';

router.get('/', function (req, res, next) {
  res.render('vehicles');
});

router.get('/api/typeOptions', function(req, res) {
  return res.json('["Çekici", "Dorse", "Tanker"]');
});

router.get('/api', function (req, res) {
  var results = [];
  pg.connect(connectionString, function (err, client, done) {
    //language=SQL
    var query =
      client.query(
        'SELECT \
        vehicle.id,\
        vehicle.type,\
        vehicle.license_plate, \
        subcontractor.name AS subcontractor, \
        subcontractor.id AS subcontractor_id, \
        license_holder.name AS license_holder, \
        license_holder.id AS license_holder_id, \
        c2_holder.name AS c2_holder,\
        c2_holder.id AS c2_holder_id\
        FROM vehicles vehicle\
        LEFT JOIN firms subcontractor ON subcontractor.id = vehicle.subcontractor_firm\
        LEFT JOIN firms license_holder ON license_holder.id = vehicle.license_holder_firm\
        LEFT JOIN firms c2_holder ON c2_holder.id = vehicle.c2_holder_firm');
    query.on('row', function (row) {
      row.DT_RowId = row.id;
      results.push(row);
    });
    query.on('end', function () {
      client.end();
      return res.json({data: results});
    });
    if (err) {
      console.log(err);
    }
  });
});

router.post('/api', function (req, res) {
  var data = {
    type: req.body["data[type]"],
    license_plate: req.body["data[license_plate]"]
  };
  var action = req.body.action;
  if (action == 'create') {
    pg.connect(connectionString, function (err, client, done) {
      //language=SQL
      var query = client.query('INSERT INTO vehicles(license_plate) values($1) returning *',
        [data.type, data.license_plate]);
      var result = {};
      query.on('row', function (row) {
        row.DT_RowId = row.id;
        result = row;
      });
      query.on('end', function () {
        res.json({row: result});
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
        query = client.query('delete from locations where id=($1)', [ids]);
      } else {
        query = client.query('delete from locations where id=any($1::int[])', [ids]);
      }
      query.on('end', function () {
        client.end();
        res.json({});
      });
      if (err) {
        console.log(err);
      }
    });
  } else if (action == 'edit') {
    var id = req.body.id;
    pg.connect(connectionString, function (err, client, done) {
      var query = client.query('update locations set name=($1) where id=($2) returning *',
        [data.name]);
      var result = {};
      query.on('row', function (row) {
        row.DT_RowId = row.id;
        result = row;
      });
      query.on('end', function () {
        res.json({row: result});
      });
      if (err) {
        console.log(err);
      }
    });
  }
});

module.exports = router;