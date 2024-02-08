const csrf = require('host-csrf');
const User = require('../models/User')
const parseVErr = require('../utils/parseValidationErr');

const registerShow = (req, res) => {
  res.render('register');
};

// eslint-disable-next-line consistent-return
const registerDo = async (req, res, next) => {
  // eslint-disable-next-line camelcase
  let validation_errors = false;
  // eslint-disable-next-line eqeqeq
  if (req.body.password != req.body.password1) {
    req.flash('error', 'The passwords entered do not match.');
    // eslint-disable-next-line camelcase
    validation_errors = true;
  }

  try {
    // eslint-disable-next-line camelcase
    if (!validation_errors) {
      await User.create(req.body);
    }
  } catch (e) {
    if (e.constructor.name === 'ValidationError') {
      parseVErr(e, req);
    } else if (e.name === 'MongoServerError' && e.code === 11000) {
      req.flash('error', 'That email address is already registered.');
    } else {
      return next(e);
    }
    // eslint-disable-next-line camelcase
    validation_errors = true;
  }
  // if there are no validation errors then redirect to main page
  // else pass errors to be rendered in the register view
  // eslint-disable-next-line camelcase
  if (!validation_errors) {
    res.redirect('/');
  } else {
    return res.render('register', { errors: req.flash('error') });
  }
};

const logoff = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    csrf.refresh(req, res);
    res.redirect('/');
  });
};

// eslint-disable-next-line consistent-return
const logonShow = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('logon');
};

module.exports = {
  logoff,
  logonShow,
  registerDo,
  registerShow,
};
