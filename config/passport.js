var LocalStrategy = require('passport-local').Strategy;
var users = require('../models/users');

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    users.find(id, function(user) {
      return done(null, user);
    });
  });

  passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
      },
      function (req, email, password, done) {
        users.login(email, password, function(user) {
          if (user && user.id) return done(null, user);
          else return done(null, false, req.flash('loginMessage', 'Geçersiz kullanıcı adı veya şifre.'));
        });
      }
    )
  );
};