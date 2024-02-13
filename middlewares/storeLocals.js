// Middleware to store user information, flash messages
const storeLocals = (req, res, next) => {
  if (req.user) {
    res.locals.user = req.user;
  } else {
    res.locals.user = null;
  }
  // Store flash messages
  res.locals.info = req.flash('info');
  res.locals.errors = req.flash('error');
  res.locals.success = req.flash('success');
  next();
};

module.exports = storeLocals;
