const errorHandlerMiddleware = ((err, req, res, next) => {
  console.log('An exception was thrown: ', err);
  let customError = {
    statusCode: 500,
    msg: 'Something went wrong. Try again later',
  };
  if (err.name === 'CastError') {
    customError.msg = `No item found with id: ${err.value}`;
    customError.statusCode = 404;
  }
  req.flash('error', customError.msg);
  return res.redirect('back');
});

module.exports = errorHandlerMiddleware;
