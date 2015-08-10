var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kacmaz';

router.get('/', function (req, res, next) {
  res.render('vehicles');
});

router.get('/api/options', function (req, res) {
  var options = {};
  options.typeOptions = ['Çekici', 'Dorse', 'Tanker'];

  options.subcontractorOptions = [];
  options.licenseHolderOptions = [];
  options.c2HolderOptions = [];

  pg.connect(connectionString, function(err, client, done){
    //language=SQL
    var subcontractorQuery = client.query('select name AS label, id AS value from firms where is_subcontractor = true');
    subcontractorQuery.on('row', function(row) {
      console.log(row);
      options.subcontractorOptions.push(row);
    });
    subcontractorQuery.on('end', function() {
      //language=SQL
      var licenseHolderQuery = client.query('select name AS label, id AS value from firms where is_license_holder = true');
      licenseHolderQuery.on('row', function(row) {
        options.licenseHolderOptions.push(row);
      });
      licenseHolderQuery.on('end', function() {
        //language=SQL
        var c2HolderQuery = client.query('select name AS label, id AS value from firms where is_c2_holder = true');
        c2HolderQuery.on('row', function(row) {
          options.c2HolderOptions.push(row);
        });
        c2HolderQuery.on('end', function() {
          done();
          return res.json(options);
        });
      });
    });
  });
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
    type: req.body["data[type]"],
    license_plate: req.body["data[license_plate]"],
    subcontractor: req.body["data[subcontractor_id]"],
    license_holder: req.body["data[license_holder_id]"],
    c2_holder: req.body["data[c2_holder_id]"]
  };
  console.log(data);
  if (data.subcontractor_firm=='') data.subcontractor_firm = null;
  if (data.license_holder_firm=='') data.license_holder_firm = null;
  if (data.c2_holder_firm=='') data.c2_holder_firm = null;
  var action = req.body.action;
  if (action == 'create') {
    pg.connect(connectionString, function (err, client, done) {
      //language=SQL
      var query = client.query('INSERT INTO vehicles(type, license_plate, subcontractor_firm, license_holder_firm, c2_holder_firm) VALUES($1, $2, $3, $4, $5) RETURNING *',
        [data.type, data.license_plate, data.subcontractor, data.license_holder, data.c2_holder]);
      var result = {};
      query.on('row', function (row) {
        result = row;
      });
      query.on('end', function () {
        //language=SQL
        var select = client.query('SELECT \
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
            LEFT JOIN firms c2_holder ON c2_holder.id = vehicle.c2_holder_firm\
            WHERE vehicle.id=($1)', [result.id]);
        var rresult = {};
        select.on('row', function(rrow) {
          rrow.DT_RowId = rrow.id;
          rresult = rrow;
        });
        select.on('end', function() {
          done();
          return res.json(rresult);
        });
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
        //language=SQL
        query = client.query('DELETE FROM vehicles WHERE id=($1)', [ids]);
      } else {
        //language=SQL
        query = client.query('DELETE FROM vehicles WHERE id=ANY($1::INT[])', [ids]);
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
      //language=SQL
      var query = client.query('UPDATE vehicles SET type=($1), license_plate=($2), subcontractor_firm=($3), license_holder_firm=($4), c2_holder_firm=($5) WHERE id=($6) RETURNING *',
        [data.type, data.license_plate, data.subcontractor, data.license_holder, data.c2_holder, id]);
      var result = {};
      query.on('row', function (row) {
        result = row;
      });
      query.on('end', function () {
        //language=SQL
        var select = client.query('SELECT \
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
            LEFT JOIN firms c2_holder ON c2_holder.id = vehicle.c2_holder_firm\
            WHERE vehicle.id=($1)', [result.id]);
        var rresult = {};
        select.on('row', function(rrow) {
          rrow.DT_RowId = rrow.id;
          rresult = rrow;
        });
        select.on('end', function() {
          done();
          return res.json(rresult);
        });
      });
      if (err) {
        console.log(err);
      }
    });
  }
});

module.exports = router;