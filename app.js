const express = require('express')
const mongoose = require('mongoose')
const app = express()
const path = require('path')
const cardRoutes = require('./routes/cards')
const authRoutes = require('./routes/auth')
require('dotenv').config()

const port = process.env.PORT || 3000
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: false }))

app.use('/public', express.static(path.join(__dirname, 'public')))
app.use((req, res, next) => {
  res.locals.nonav = false
  res.locals.success = null
  next()
})

app.get('/', (req, res, next) => {
  res.render('index', {
    pageTitle: 'Landing Page',
    errors: null,
    info: 'empty'
  })
})

app.use('/auth', authRoutes)
app.use(cardRoutes)

app.use((err, req, res, next) => {
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
