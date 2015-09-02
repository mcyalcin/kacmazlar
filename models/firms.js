var connectionString = require('./database');
var express = require('express');
var router = express.Router();
var pg = require('pg');

function getFirms(res) {
  var results = [];
  pg.connect(connectionString, function (err, client, done) {
    var query = client.query('select * from firms order by id asc');
    query.on('row', function (row) {
      row.DT_RowId = row.id;
      if (row.is_c2_holder) {
        row.is_c2_holder = "Evet";
      } else {
        row.is_c2_holder = "Hayır";
      }
      if (row.is_license_holder) {
        row.is_license_holder = "Evet";
      } else {
        row.is_license_holder = "Hayır";
      }
      if (row.is_subcontractor) {
        row.is_subcontractor = "Evet";
      } else {
        row.is_subcontractor = "Hayır";
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

router.post('/', function (req, res) {
  var data = {
    name: req.body["data[name]"],
    address: req.body["data[address]"],
    phone_number: req.body["data[phone_number]"],
    is_c2_holder: (req.body["data[is_c2_holder]"] === 'Evet'),
    is_license_holder: (req.body["data[is_license_holder]"] === 'Evet'),
    is_subcontractor: (req.body["data[is_subcontractor]"] === 'Evet')
  };
  var action = req.body.action;
  if (action == 'create') {
    pg.connect(connectionString, function (err, client, done) {
      var query = client.query('insert into firms(name, address, phone_number, is_c2_holder, is_license_holder, is_subcontractor) values($1, $2, $3, $4, $5, $6) returning *',
        [data.name, data.address, data.phone_number, data.is_c2_holder, data.is_license_holder, data.is_subcontractor]);
      var result = {};
      query.on('row', function (row) {
        row.DT_RowId = row.id;
        if (row.is_c2_holder) {
          row.is_c2_holder = "Evet"
        } else {
          row.is_c2_holder = "Hayır";
        }
        if (row.is_license_holder) {
          row.is_license_holder = "Evet"
        } else {
          row.is_license_holder = "Hayır";
        }
        if (row.is_subcontractor) {
          row.is_subcontractor = "Evet"
        } else {
          row.is_subcontractor = "Hayır";
        }
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
        query = client.query('delete from firms where id=($1)', [ids]);
      } else {
        query = client.query('delete from firms where id=any($1::int[])', [ids]);
      }
      query.on('end', function () {
        done();
        return res.json({});
      });
      if (err) {
        console.log(err);
      }
    });
  } else if (action == 'edit') {
    var id = req.body.id;
    pg.connect(connectionString, function (err, client, done) {
      // language=SQL
      var query = client.query('UPDATE firms SET name=($1), address=($2), phone_number=($3), is_c2_holder=($4), is_license_holder=($5), is_subcontractor=($6) WHERE id=($7) RETURNING *',
        [data.name, data.address, data.phone_number, data.is_c2_holder, data.is_license_holder, data.is_subcontractor, id]);
      var result = {};
      query.on('row', function (row) {
        row.DT_RowId = row.id;
        if (row.is_c2_holder) {
          row.is_c2_holder = "Evet"
        } else {
          row.is_c2_holder = "Hayır";
        }
        if (row.is_license_holder) {
          row.is_license_holder = "Evet"
        } else {
          row.is_license_holder = "Hayır";
        }
        if (row.is_subcontractor) {
          row.is_subcontractor = "Evet"
        } else {
          row.is_subcontractor = "Hayır";
        }
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

router.get('/', function (req, res) {
  getFirms(res);
});

module.exports = router;