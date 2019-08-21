const { validationResult } = require('express-validator')
const validators = require('../middleware/validators')
const uploadToAWS = require('../aws/aws')
const multer = require('multer')
const ejs = require('ejs')
const fs = require('fs')
const Card = require('../models/card')
const User = require('../models/user')
const mailer = require('../mailer/mailer')
const authenticate = require('../middleware/authenticate')
const router = require('express').Router()
const path = require('path')
const emailTemplatePath = path.join(path.dirname(__dirname), 'public', 'emails', 'template.ejs')
const imageFolder = path.join(path.dirname(__dirname), 'public', 'imgs') || 'public/imgs'
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
    console.log('test')
    cb(null, true)
  } else {
    cb(null, false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: imageFilter
})
router.get('/new-card', authenticate, (req, res, next) => {
  res.render('add-card', {
    pageTitle: 'Add a new Card',
    errors: null,
    info: 'empty'
  })
})
router.post('/card', authenticate, upload.single('pic'), validators.cardValidation, async (req, res, next) => {
  const errors = await validationResult(req)
  console.log(`req.file ${req.file}`)
  console.log(`Form validation errors: ${errors.array()}`)
  if (!errors.isEmpty()) {
    return res.status(422).render('add-card', {
      pageTitle: 'Add a Card',
      errors: errors.array(),
      info: {
        title: req.body.title,
        message: req.body.message,
        sign: req.body.sign
      }
    })
  }
  const { title, message, sign, song, heart, confetti } = req.body
  const currentUser = req.user
  let picture = '/public/imgs/logo.png'
  if (req.file) {
    uploadToAWS(req.file.path, req.user._id, async (err, path) => {
      if (err) {
        throw err
      }
      picture = path
      fs.unlink(req.file.path, (err) => {
        if (err) throw err
        console.log('Filed Deleted')
      })
      console.log(picture)
      const card = await new Card({ title, message, picture, sign, song, heart, confetti, user: currentUser })
      await card.save()
      const user = await User.findById(currentUser)
      user.cards.push(card._id)
      await user.save()
      res.render('card', {
        pageTitle: `Your Card '${title}'`,
        card: card
      })
    })
  } else {
    console.log(picture)
    const card = await new Card({ title, message, picture, sign, song, heart, confetti, user: currentUser })
    await card.save()
    const user = await User.findById(currentUser)
    user.cards.push(card._id)
    await user.save()
    res.render('card', {
      pageTitle: `Your Card '${title}'`,
      card: card
    })
  }
})

// edit a card
router.get('/edit-card/:cardId', authenticate, async (req, res, next) => {
  const cardId = req.params.cardId
  try {
    const card = await Card.findById(cardId)
    res.render('edit-card', {
      pageTitle: 'Edit Your Card',
      errors: null,
      info: 'empty',
      card
    })
  } catch (err) {
    err.statusCode = 404
    err.msg = 'Card not Found'
  }
})

router.post('/edit-card', upload.single('pic'), validators.cardValidation, async (req, res, next) => {
  const { title, picture, message, sign, song, confetti, heart, id } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).render('edit-card', {
      pageTitle: 'Edit Your Card',
      errors: errors.array(),
      info: {
        title: req.body.title,
        message: req.body.message,
        sign: req.body.sign
      },
      card: {
        title,
        picture,
        message,
        sign,
        song,
        confetti,
        heart,
        id
      }
    })
  }
  console.log(picture)
  try {
    const card = await Card.findById(id)
    card.title = title
    card.picture = card.picture === picture ? picture : req.file.filename
    card.message = message
    card.sign = sign
    card.song = song
    card.confetti = confetti
    card.heart = heart
    await card.save()
    req.session.success = [{ msg: `Succesfuly updated card "${title}"` }]
    res.status(303).redirect('/cards')
  } catch (err) {
    err.msg = 'Oops... Something went wrong'
    err.statusCode = 501
    next(err)
  }
})
router.get('/card', authenticate, async (req, res, next) => {
  const { title, message, sign, picture, song, heart, confetti, nonav } = req.query
  const card = { title, message, sign, picture, song, heart, confetti, user: req.user }
  res.render('card', {
    pageTitle: 'Your Cards',
    card,
    nonav
  })
})
router.get('/card/:cardId', async (req, res, next) => {
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

// verify user is creater of card
router.post('/email-card', async (req, res, next) => {
  const { cardId, email } = req.body
  if (!cardId || !email) {
    return res.status(400).json({
      msg: 'Missing information to complete request',
      success: false
    })
  } else {
    try {
      const card = await Card.findById(cardId)
      console.log(card.title)
      const user = await User.findById(card.user)
      if (req.session.user._id.toString() !== user._id.toString()) {
        return res.status(403).json({
          msg: 'You must be the creator of this card to send it',
          success: false
        })
      }
      const emailTemplate = fs.readFileSync(emailTemplatePath, { encoding: 'utf-8' })
      const html = ejs.render(emailTemplate, {
        preheader: 'You have a Gift',
        message: `${user.name} sent you something special`,
        secondMessage: `Here is a <a href='http://127.0.0.1:3000/card/${cardId}'>link</a>
        To View your gift`,
        link: `http://127.0.0.1:3000/card/${cardId}`
      })
      const emailMsg = {
        to: email,
        from: user.name.replace(' ', '') + '@createcards.com',
        subject: `${user.name} sent you a card`,
        text: `${user.name} sent you a card`,
        html: html
      }
      mailer(emailMsg)
      return res.status(200).json({
        msg: `Thank you ${user.name} \nAn E-mail with a link to this card - ${card.title}\nwas sent on your behalf to ${email}`,
        success: true
      })
    } catch (err) {
      return res.status(501).json(err, { success: false })
    }
  }
})
router.get('/cards', authenticate, async (req, res, next) => {
  const cards = await Card.find({ user: req.user })
  console.log(cards)
  res.render('cards', {
    pageTitle: 'Your Cards',
    cards: cards
  })
})

module.exports = router
