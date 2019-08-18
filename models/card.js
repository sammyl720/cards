const mongoose = require('mongoose')

const Schema = mongoose.Schema

const cardSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  sign: {
    type: String,
    required: true
  },
  picture: {
    type: String,
    required: true
  },
  song: {
    type: Boolean,
    default: true
  },
  heart: {
    type: Boolean,
    default: true
  },
  confetti: {
    type: Boolean,
    default: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Card', cardSchema)
