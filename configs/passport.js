let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let UserModel = require('../models/User');
let bcrypt = require('bcryptjs');

const userTableFields = {
  usernameField: 'email',
  passwordField: 'password'
};

const verifyCallback = (email, password, done) => {
  UserModel.findByEmail(email)
    .then((user) => {
      // Si no encuentra un usuario entonces regresa falso
      if (!user) {
        return done(null, false);
      }
      // Si encuentra un usuario y coincide con la contraseña entonces
      // inicia la sesión
      let isValid = bcrypt.compareSync(password, user.password);
      if (isValid) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    })
    .catch((err) => {
      done(err);
    });
}

const strategy  = new LocalStrategy(userTableFields, verifyCallback);

passport.use(strategy);

// Guarda en las variables de sesión el id del usuario loggeado
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Obtiene el usuario
passport.deserializeUser((id, done) => {
  UserModel.find(id)
    .then((user) => {
      done(null, user);
    })
    .catch(err => done(err))
});
