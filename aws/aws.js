const fs = require('fs')
const AWS = require('aws-sdk')
const bufferFrom = require('buffer-from')
const path = require('path')
require('dotenv').config()
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
})
// const file = path.join(path.dirname(__dirname), 'public', 'imgs', filename)
// console.log(file)

const uploadFile = async (filepath, user, cb) => {
  if (!filepath) {
    const err = new Error('Please make sure file is in the public /imgs folder')
    cb(err, null)
  }
  const file = path.win32.basename(filepath)
  await fs.readFile(filepath, (err, data) => {
    if (err) {
      return cb(err, null)
    }
    const base64data = bufferFrom(data)
    const params = {
      Bucket: 'create-cards-bucket',
      Key: `pictures/${user}/${file}`,
      Body: base64data,
      ACL: 'public-read'
    }
    s3.upload(params, (s3err, datas3) => {
      console.log('uploading..')
      if (s3err) {
        return cb(err, null)
      }
      console.log(`File uploaded successfuly at ${datas3.Location}`)
      return cb(null, datas3.Location)
    })
  })
}
module.exports = uploadFile
