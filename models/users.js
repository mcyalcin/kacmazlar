var connectionString = require('./database');
var express = require('express');
var router = express.Router();
var pg = require('pg');

module.exports = {
  find: function(id, callback) {
    pg.connect(connectionString, function(err, client, done) {
      // language=SQL
      var query = client.query('SELECT * FROM users WHERE id = ($1)', [id]);
      var result = {};
      query.on('row', function(row) {
        result = row;
      });
      query.on('end', function() {
        done();
        callback(result);
      });
      if (err) {
        console.log(err);
      }
    });
  },

  login: function(name, password, callback) {
    pg.connect(connectionString, function(err, client, done) {
      // language=SQL
      var query = client.query('SELECT * FROM users WHERE name LIKE ($1) AND password LIKE ($2)', [name, password]);
      var result = {};
      query.on('row', function(row) {
        result = row;
      });
      query.on('end', function() {
        done();
        callback(result);
      });
      if (err) {
        console.log(err);
      }
    })
  }
};