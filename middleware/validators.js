const { check } = require('express-validator')

exports.cardValidation = [
  check('title').isLength({ min: 4, max: 21 }).withMessage('Title should be between 4 and 20 Characters long'),
  check('message').isLength({ min: 4, max: 120 }).withMessage('Message should be between 4 and 120 Characters long'),
  check('heart').toBoolean(),
  check('song').toBoolean(),
  check('confetti').toBoolean(),
  check('sign').isLength({ min: 2, max: 14 }).withMessage('Sign should be between 2 and 14 Characters long')]

exports.signupValidation = [
  check('password')
    .isLength({ min: 6 })
    .withMessage('password must be at least 6 characters'),
  check('email', 'email is not valid')
    .isEmail()
    .trim()
]
