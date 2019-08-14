const express = require('express')
const mongoose = require('mongoose')
const app = express()
const path = require('path')
const multer = require('multer')
require('dotenv').config()
const Card = require('./models/card')
const port = process.env.PORT || 3000
app.set('view engine', 'ejs')
const imageFolder = path.join(__dirname, 'public', 'imgs') || 'public/imgs'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imageFolder)
  },
  filename: (req, file, cb) => {
    console.log(`file name: ${file.originalname}`)
    cb(null, file.fieldname + '-' + Date.now().toString() + path.extname(file.originalname))
  }
})
const upload = multer({
  storage: storage
})
app.use(express.urlencoded({ extended: false }))

app.use('/public', express.static(path.join(__dirname, 'public')))

app.get('/', (req, res, next) => {
  res.render('index', {
    pageTitle: 'Landing Page'
  })
})

app.post('/card', upload.single('pic'), async (req, res, next) => {
  console.log(req.file)
  const picture = req.file ? req.file.filename : 'picture.png'
  console.log(picture)
  const { title, message, sign } = req.body
  const card = await new Card({ title, message, picture, sign })
  console.log(card)
  await card.save()
  res.render('card', {
    pageTitle: `Your Card '${title}'`,
    title,
    picture,
    message,
    sign
  })
})
app.get('/card', async (req, res, next) => {
  const { title, message, sign, picture } = req.query
  res.render('card', {
    pageTitle: 'Your Cards',
    title,
    message,
    sign,
    picture
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

