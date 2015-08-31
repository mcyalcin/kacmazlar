// TODO: Rework for postgre
var LocalStrategy = require('passport-local').Strategy;

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
    console.log('ser ' + user);
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    console.log('des ' + id);
    if (id == 1) return done(null, {username: 'admin', id: 1});
    else if (id == 2) return done(null, {username: 'user', id: 2});
    //User.findById(id, function (err, user) {
    //  done(err, user);
    //});
  });

  passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
      },
      function (req, email, password, done) {
        if (email == 'admin' && password == 'admin') return done(null, {username: 'admin', id: 1});
        else if (email == 'user' && password == 'user') return done(null, {username: 'user', id: 2});
        else return done(null, false, req.flash('loginMessage', 'Geçersiz kullanıcı adı veya şifre.'));
        //User.findOne({'local.email': email}, function(err, user) {
        //  if (err) {
        //    return done(err);
        //  }
        //  if (!user) {
        //    return done(null, false, req.flash('loginMessage', 'No user found.'));
        //  }
        //  if (!user.validPassword(password)) {
        //    return done(null, false, req.flash('loginMessage', 'Wrong password.'));
        //  }
        //  return done(null, user);
        //});
      }
    )
  );
};