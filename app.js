const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const app = express()

const path = require('path')
const cardRoutes = require('./routes/cards')
const authRoutes = require('./routes/auth')
require('dotenv').config()
const store = new MongoStore({
  uri: process.env.DATABASE_URI,
  collection: 'sessions'
})
const port = process.env.PORT || 3000
app.set('view engine', 'ejs')
console.log('hello')
app.use(express.urlencoded({ extended: false }))
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: store,
  saveUninitialized: false,
  resave: false }))
app.use('/public', express.static(path.join(__dirname, 'public')))
app.use((req, res, next) => {
  res.locals.nonav = false
  if (req.session.success) {
    res.locals.success = req.session.success
    req.session.success = null
  } else {
    res.locals.success = null
  }
  if (req.session.errors) {
    res.locals.errors = req.session.errors
    req.session.errors = null
  }
  next()
})

// check if user is logged in
app.use((req, res, next) => {
  if (req.session.user) {
    req.user = req.session.user
    res.locals.isLoggedIn = true
    // console.log(`user logged in:${req.user} `)
  } else {
    res.locals.isLoggedIn = false
    // console.log(`user is not logged in`)
  }
  next()
})
app.get('/', (req, res, next) => {
  res.render('index', {
    pageTitle: 'Landing Page',
    errors: null,
    info: 'empty'
  })
})

app.use(cardRoutes)
app.use('/auth', authRoutes)

app.use((err, req, res, next) => {
  console.log(err)
  res.status(err.statusCode || 501).render('error', {
    pageTitle: 'Error',
    error: err.message
  })
})
mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true }).then(result => {
  console.log('Connected to database')
  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })
}).catch(err => {
  console.log(err)
})
