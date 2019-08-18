const router = require('express').Router()
const validators = require('../middleware/validators')
const { validationResult } = require('express-validator')
const User = require('../models/user')
const bcrypt = require('bcrypt')

router.get('/login', (req, res, next) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    nonav: false,
    errors: null,
    info: 'empty'
  })
})

router.get('/signup', (req, res, next) => {
  res.render('auth/signup', {
    pageTitle: 'Signup',
    nonav: false,
    errors: null,
    info: 'empty'
  })
})

router.post('/signup', validators.signupValidation, async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(403).render('auth/signup', {
      pageTitle: 'Signup',
      nonav: false,
      errors: errors.array(),
      info: {
        name,
        email,
        password,
        passwordConfirm
      }
    })
  }
  const passMatches = password === passwordConfirm

  if (!passMatches) {
    return res.status(403).render('auth/signup', {
      pageTitle: 'Signup',
      nonav: false,
      errors: [{ msg: 'Passwords must match' }],
      info: {
        name,
        email,
        password,
        passwordConfirm
      }
    })
  }
  const checkEmail = await User.findOne({ email: email })
  if (checkEmail) {
    return res.status(403).render('auth/signup', {
      pageTitle: 'Signup',
      nonav: false,
      errors: [{ msg: 'Email is already in use' }],
      info: {
        name,
        email,
        password,
        passwordConfirm
      }
    })
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await new User({
      name,
      email,
      password: hashedPassword
    })
    await user.save()
    return res.status(200).render('add-card', {
      pageTitle: 'Welcome',
      success: [{ msg: 'Welcome Aboard' }],
      errors: null,
      info: 'empty'
    })
  } catch (err) {
    err.statusCode = 501
    next(err)
  }
  res.render('auth/signup', {
    pageTitle: 'Signup',
    nonav: false,
    errors: [{ msg: 'Development mode' }],
    info: {
      name,
      email,
      password,
      passwordConfirm
    }
  })
})
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email: email })
    if (!user) {
      return res.status(403).render('auth/login', {
        pageTitle: 'Login',
        nonav: false,
        errors: [{ msg: 'Invalid Credntails' }],
        info: {
          email,
          password
        }
      })
    } else {
      const match = await bcrypt.compare(password, user.password)
      if (!match) {
        return res.status(403).render('auth/login', {
          pageTitle: 'Login',
          nonav: false,
          errors: [{ msg: 'Invalid Credntails' }],
          info: {
            email,
            password
          }
        })
      } else {
        req.session.user = user.id
        res.locals.isLoggedIn = true
        console.log(req.session)
        return res.status(200).render('add-card', {
          pageTitle: 'Welcome',
          success: [{ msg: 'Welcome Aboard' }],
          errors: null,
          info: 'empty'
        })
      }
    }
  } catch (err) {
    err.statusCode = 404
    next(err)
  }
})

router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      err.statusCode = 501
      next(err)
    }
    return res.status(303).redirect('/')
  })
})
module.exports = router