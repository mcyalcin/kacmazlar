var connectionString = require('./database');
var express = require('express');
var router = express.Router();
var pg = require('pg');

function getDrivers(res) {
  var results = [];
  pg.connect(connectionString, function(err, client, done) {
    var query = client.query('select * from drivers order by id asc');
    query.on('row', function(row) {
      results.push(row);
    });
    query.on('end', function() {
      client.end();
      return res.json({data: results});
    });
    if (err) {
      console.log(err);
    }
  });
}

router.post('/', function(req, res) {
  var data = {
    name: req.body["data[name]"],
    surname: req.body["data[surname]"],
    mother_name: req.body["data[mother_name]"],
    father_name: req.body["data[father_name]"],
    id_number: req.body["data[id_number]"],
    birthplace: req.body["data[birthplace]"],
    phone_number: req.body["data[phone_number]"]
  };
  pg.connect(connectionString, function(err, client, done) {
    var query = client.query('insert into drivers(name, surname, id_number, mother_name, father_name, birthplace, phone_number) values($1, $2, $3, $4, $5, $6, $7) returning *',
      [data.name, data.surname, data.id_number, data.mother_name, data.father_name, data.birthplace, data.phone_number]);
    var result = {};
    query.on('row', function(row) {
      result = row;
    });
    query.on('end', function() {
      res.json({row: result});
    });
    if(err) {
      console.log(err);
    }
  });
});

router.get('/', function(req, res) {
  getDrivers(res);
});

router.put('/', function(req, res) {
  var id = req.body.driver_id;
  var data = {
    name: req.body["data[name]"],
    surname: req.body["data[surname]"],
    mother_name: req.body["data[mother_name]"],
    father_name: req.body["data[father_name]"],
    id_number: req.body["data[id_number]"],
    birthplace: req.body["data[birthplace]"],
    phone_number: req.body["data[phone_number]"]
  };
  pg.connect(connectionString, function(err, client, done) {
    var query = client.query('update drivers set name=($1), surname=($2), id_number=($3), mother_name=($4), father_name=($5), birthplace=($6), phone_number=($7) where id=($8) returning *',
      [data.name, data.surname, data.id_number, data.mother_name, data.father_name, data.birthplace, data.phone_number, id]);
    var result = {};
    query.on('row', function(row) {
      result = row;
    });
    query.on('end', function() {
      res.json({row: result});
    });
    if(err) {
      console.log(err);
    }
  });
});

router.delete('/', function(req, res) {
  var ids = req.body['id[]'];
  pg.connect(connectionString, function(err, client, done) {
    var query = client.query('delete from drivers where id=any($1::int[])', [ids]);
    query.on('end', function() {
      client.end();
      res.end();
    });
    if(err) {
      console.log(err);
    }
  });
});

module.exports = router;