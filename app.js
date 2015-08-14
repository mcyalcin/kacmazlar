var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var drivers = require('./routes/drivers');
var driversDb = require('./models/drivers');
var locations = require('./routes/locations');
var locationsDb = require('./models/locations');
var cmrPrices = require('./routes/cmrPrices');
var cmrPricesDb = require('./models/cmrPrices');
var firms = require('./routes/firms');
var firmsDb = require('./models/firms');
var users = require('./routes/users');
var products = require('./routes/products');
var vehicles = require('./routes/vehicles');
var transportations = require('./routes/transportations');
var transportationsDb = require('./models/transportations');
var transportFees = require('./routes/transportFees');
var customs = require('./routes/customs');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/drivers', drivers);
app.use('/drivers/api', driversDb);
app.use('/locations', locations);
app.use('/locations/api', locationsDb);
app.use('/cmr_prices', cmrPrices);
app.use('/cmr_prices/api', cmrPricesDb);
app.use('/firms', firms);
app.use('/firms/api', firmsDb);
app.use('/products', products);
app.use('/vehicles', vehicles);
app.use('/transportations', transportations);
app.use('/transportations/api', transportationsDb);
app.use('/transport_fees', transportFees);
app.use('/customs', customs);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
