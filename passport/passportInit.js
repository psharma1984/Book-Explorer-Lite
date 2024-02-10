const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

const passportInit = () => {
  passport.use(
    'local',
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, { message: 'Incorrect credentials.' });
          }

          const result = await user.comparePassword(password);
          if (result) {
            return done(null, user);
          }
          return done(null, false, { message: 'Incorrect credentials.' });
        } catch (e) {
          return done(e);
        }
      },
    ),
  );

  passport.serializeUser(async (user, done) => {
    done(null, user.id);
  });

  // eslint-disable-next-line consistent-return
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      if (!user) {
        return done(new Error('user not found'));
      }
      return done(null, user);
    } catch (e) {
      done(e);
    }
  });
};

module.exports = passportInit;
