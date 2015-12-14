var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var passport = require('passport');
var flash = require('connect-flash');

//var routes = require('./routes/index');
var payments = require('./routes/payments');
var drivers = require('./routes/drivers');
var locations = require('./routes/locations');
var cmrPrices = require('./routes/cmrPrices');
var firms = require('./routes/firms');
var users = require('./routes/users');
var products = require('./routes/products');
var vehicles = require('./routes/vehicles');
var shipments = require('./routes/shipments');
var transportFees = require('./routes/transportFees');
var subcontractorTransportFees = require('./routes/subcontractorTransportFees');
var customs = require('./routes/customs');
var login = require('./routes/login');

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

app.use(require('express-session')({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./routes/index')(app, passport);
app.use('/payments', payments);
app.use('/drivers', drivers);
app.use('/locations', locations);
app.use('/cmr_prices', cmrPrices);
app.use('/firms', firms);
app.use('/products', products);
app.use('/vehicles', vehicles);
app.use('/shipments', shipments);
app.use('/transport_fees', transportFees);
app.use('/subcontractor_transport_fees', subcontractorTransportFees);
app.use('/customs', customs);
app.use('/users', users);
app.use('/login', login);

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
