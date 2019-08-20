// https://www.npmjs.com/package/@sendgrid/mail
const sgMail = require('@sendgrid/mail')
require('dotenv').config()
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const sendMail = async (msg) => {
  console.log('Sending message')
  await sgMail.send(msg)
  console.log('E-mail sent to ' + msg.to)
  return 'sent email'
}

module.exports = sendMail
