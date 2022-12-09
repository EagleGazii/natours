module.exports = (func) => {
  // in the next line will call by express not by use that is reason why we use return like that
  return (req, res, next) => {
    //func(req, res, next).catch((err) => next(err)); it is same as next line
    func(req, res, next).catch(next);
  };
};
