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
  if (ext === '.png' || ext === '.jpeg' || ext === '.gif' || ext === '.jpg') {
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
  console.log(errors.array())
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
  const { title, message, sign, picture, nonav } = req.query
  res.render('card', {
    pageTitle: 'Your Cards',
    title,
    message,
    sign,
    picture,
    nonav
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