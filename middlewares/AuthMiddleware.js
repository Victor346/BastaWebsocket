exports.isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).json({ msg: 'You are not authorized to view this resource' });
  }
}
