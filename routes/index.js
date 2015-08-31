module.exports = function (app, passport) {

  app.get('/', function (req, res) {
    if (typeof req.user == 'undefined') {
      res.render('login');
    } else {
      res.render('index', {user: req.user});
    }
  });

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));

  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
      return next();
    res.redirect('/');
  }

};