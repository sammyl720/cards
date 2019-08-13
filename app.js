const express = require('express')
const mongoose = require('mongoose')
const app = express()
const path = require('path')
require('dotenv').config()
const Card = require('./models/card')
const port = process.env.PORT || 3000
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: false }))

app.use('/public', express.static(path.join(__dirname, 'public')))

app.get('/', (req, res, next) => {
  res.render('index', {
    pageTitle: 'Landing Page'
  })
})

app.post('/card', async (req, res, next) => {
  const { title, message, sign } = req.body
  const card = await new Card({title, message, sign })
  console.log(card)
  await card.save()
  res.render('card', {
    pageTitle: `Your Card '${title}'`,
    title,
    message,
    sign
  })
})
app.get('/card', async (req, res, next) => {
  const { title, message, sign } = req.query
  res.render('card', {
    pageTitle: 'Your Cards',
    title,
    message,
    sign
  })
})
app.get('/cards', async (req, res, next) => {
  const cards = await Card.find()
  console.log(cards)
  res.render('cards', {
    pageTitle: 'Your Cards',
    cards: cards
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

