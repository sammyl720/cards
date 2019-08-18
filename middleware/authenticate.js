module.exports = (req, res, next) => {
  if (!req.session.user) {
    return res.status(303).redirect('/')
  }
  next()
}
