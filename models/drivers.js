var connectionString = require('./database');
var express = require('express');
var router = express.Router();
var pg = require('pg');

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

function getDrivers(res) {
  var results = [];
  pg.connect(connectionString, function (err, client, done) {
    // language = SQL
    var query = client.query('select * from drivers order by id asc');
    query.on('row', function (row) {
      row.DT_RowId = row.id;
      row.birth_date = formatDate(row.birth_date);
      if (row.has_license_scan) {
        row.has_license_scan = 'VAR';
      } else {
        row.has_license_scan = 'YOK';
      }
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
}

router.post('/licenseUpload', function(req, res) {
  console.log(req.body);
  console.log(req.files);
  return res.redirect('/drivers');
});

router.post('/', function (req, res) {
  var data = {
    name: req.body["data[name]"],
    surname: req.body["data[surname]"],
    mother_name: req.body["data[mother_name]"],
    father_name: req.body["data[father_name]"],
    id_number: req.body["data[id_number]"],
    birthplace: req.body["data[birthplace]"],
    birth_date: parseDate(req.body["data[birth_date]"]),
    phone_number: req.body["data[phone_number]"],
    permission_status: req.body["data[permission_status]"],
    has_license_scan: req.body["data[has_license_scan]"] == "VAR"
  };
  var action = req.body.action;
  if (action == 'create') {
    pg.connect(connectionString, function (err, client, done) {
      var query;
      // language=SQL
      query = client.query('insert into drivers(name, surname, id_number, mother_name, father_name, birthplace, birth_date, phone_number, permission_status, has_license_scan) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning *',
        [data.name, data.surname, data.id_number, data.mother_name, data.father_name, data.birthplace, data.birth_date, data.phone_number, data.permission_status, data.has_license_scan]);
      var result = {};
      query.on('row', function (row) {
        row.DT_RowId = row.id;
        row.birth_date = formatDate(row.birth_date);
        if (row.has_license_scan) {
          row.has_license_scan = 'VAR';
        } else {
          row.has_license_scan = 'YOK';
        }
        result = row;
      });
      query.on('end', function () {
        done();
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
        query = client.query('delete from drivers where id=($1)', [ids]);
      } else {
        query = client.query('delete from drivers where id=any($1::int[])', [ids]);
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
      var query;
      // language=SQL
      query = client.query('update drivers set name=($1), surname=($2), id_number=($3), mother_name=($4), father_name=($5), birthplace=($6), birth_date=($7), phone_number=($8), permission_status=($10), has_license_scan=($11) where id=($9) returning *',
        [data.name, data.surname, data.id_number, data.mother_name, data.father_name, data.birthplace, data.birth_date, data.phone_number, id, data.permission_status, data.has_license_scan]);
      var result = {};
      query.on('row', function (row) {
        row.DT_RowId = row.id;
        row.birth_date = formatDate(row.birth_date);
        if (row.has_license_scan) {
          row.has_license_scan = 'VAR';
        } else {
          row.has_license_scan = 'YOK';
        }
        result = row;
      });
      query.on('end', function () {
        done();
        res.json({row: result});
      });
      if (err) {
        console.log(err);
      }
    });
  }
});

router.get('/', function (req, res) {
  getDrivers(res);
});

module.exports = router;