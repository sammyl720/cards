module.exports = (req, res, next) => {
  if (!req.session.user) {
    req.session.errors = [{ msg: 'Unauthorized Access' }] 
    return res.status(303).redirect('/')
  }
  next()
}
