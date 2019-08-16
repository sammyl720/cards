const { check } = require('express-validator')

exports.cardValidation = [
  check('title').isLength({ min: 4, max: 14 }).withMessage('Title should be between 4 and 14 Characters long'),
  check('message').isLength({ min: 4, max: 40 }).withMessage('Message should be between 4 and 40 Characters long'),
  check('sign').isLength({ min: 2, max: 14 }).withMessage('Sign should be between 2 and 14 Characters long')]
