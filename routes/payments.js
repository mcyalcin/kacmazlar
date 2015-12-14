var express = require('express');
var router = express.Router();
var pg = require('pg');
//noinspection JSUnresolvedVariable
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kacmaz';

router.get('/', function (req, res) {
  if (typeof req.user == 'undefined') {
    res.render('login');
  } else {
    res.render('payments', {user: req.user});
  }
});

router.get('/api', function (req, res) {
  if (!req.user) {
    response.status(401);
    response.send('Unauthorized.');
  } else if (req.user.role !== 'admin') {
    response.status(403);
    response.send('Unauthorized.');
  } else {
    pg.connect(connectionString, function (err, client, done) {
      //language=SQL
      var query = client.query('SELECT company_name AS firm, sum(net_price) AS payment_total, sum(transportation_price) AS acquisition_total FROM shipments GROUP BY company_name;');
      var results = [];
      query.on('row', function(row) {
        row.paid = 0;
        row.payment_due = row.payment_total;
        row.acquired = 0;
        row.acquisition_due = row.acquisition_total;
        results.push(row);
      });
      query.on('end', function() {
        done();
        return res.json({data:results});
      });
      if (err) {
        console.log(err);
      }
    })
  }
});

module.exports = router;