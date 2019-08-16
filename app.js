const express = require('express')
const mongoose = require('mongoose')
const app = express()
const path = require('path')
const multer = require('multer')
const { validationResult } = require('express-validator')
const validators = require('./middleware/validators')
require('dotenv').config()
const Card = require('./models/card')
const port = process.env.PORT || 3000
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: false }))
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

const imageFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname)
  console.log(ext)
  if (ext === '.png' || ext === '.jpeg' || ext === '.gif' || ext === '.jpg' || ext === '.JPG') {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

app.use('/public', express.static(path.join(__dirname, 'public')))
app.use((req, res, next) => {
  res.locals.nonav = false
  next()
})

app.get('/', (req, res, next) => {
  res.render('index', {
    pageTitle: 'Landing Page',
    errors: null,
    info: 'empty'
  })
})

const upload = multer({
  storage: storage,
  fileFilter: imageFilter
})
app.post('/card', upload.single('pic'), validators.cardValidation, async (req, res, next) => {
  const errors = await validationResult(req)
  console.log(`Bday Song: ${req.body.song}`)
  console.log(`Form validation errors: ${errors.array()}`)
  if (!errors.isEmpty()) {
    return res.status(422).render('index', {
      pageTitle: 'Landing Page',
      errors: errors.array(),
      info: {
        title: req.body.title,
        message: req.body.message,
        sign: req.body.sign
      }
    })
  }
  const picture = req.file ? req.file.filename : 'logo.png'
  const { title, message, sign, song, heart, confetti } = req.body
  const card = await new Card({ title, message, picture, sign, song, heart, confetti })
  console.log(card)
  await card.save()
  res.render('card', {
    pageTitle: `Your Card '${title}'`,
    card: card
  })
})
app.get('/card', async (req, res, next) => {
  const { title, message, sign, picture, song, heart, confetti, nonav } = req.query
  const card = { title, message, sign, picture, song, heart, confetti }
  res.render('card', {
    pageTitle: 'Your Cards',
    card,
    nonav
  })
})
app.get('/card/:cardId', async (req, res, next) => {
  const cardId = req.params.cardId
  try {
    const card = await Card.findById(cardId)
    res.render('card', {
      pageTitle: 'A gift for you!',
      card: card
    })
  } catch (err) {
    console.log(err.message)
    err.message = `a Card with id ${cardId} was not found`
    err.statusCode = 404
    next(err)
  }
})
app.get('/cards', async (req, res, next) => {
  const cards = await Card.find()
  console.log(cards)
  res.render('cards', {
    pageTitle: 'Your Cards',
    cards: cards
  })
})
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