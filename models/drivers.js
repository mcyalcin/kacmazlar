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
  var data = {text: req.body.text, complete: false};
  pg.connect(connectionString, function(err, client, done) {
    var query = client.query('insert into drivers(text, complete) values($1, $2)', [data.text, data.complete]);
    query.on('end', function() {
      client.end();
      getDrivers(res);
    });
    if(err) {
      console.log(err);
    }
  });
});

router.get('/', function(req, res) {
  getDrivers(res);
});

router.put('/:driver_id', function(req, res) {
  var id = req.params.driver_id;
  var data = {text: req.body.text, complete: req.body.complete};
  pg.connect(connectionString, function(err, client, done) {
    var query = client.query('update items set text=($1), complete=($2) where id=($3)', [data.text, data.complete, id]);
    query.on('end', function() {
      client.end();
      getTodos(res);
    });
    if(err) {
      console.log(err);
    }
  });
});

router.delete('/:driver_id', function(req, res) {
  var id = req.params.todo_id;

  pg.connect(connectionString, function(err, client, done) {
    var query = client.query('delete from items where id=($1)', [id]);
    query.on('end', function() {
      client.end();
      getTodos(res);
    });
    if(err) {
      console.log(err);
    }
  });
});

module.exports = router;