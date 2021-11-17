module.exports = (fn) => (req, res, next) => {
  // as fn is an asyn so it will return a promise on which we can call the catch method.
  fn(req, res, next).catch(next); // or fn(req, res, next).catch(err => next(err));
};
// or
/*
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  }
}*/
