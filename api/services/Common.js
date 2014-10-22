/**
 * Created by Theadd on 22/10/2014.
 */

var bcrypt = require('bcrypt')
var crypto = require('crypto')

module.exports.GenerateRandomKey = GenerateRandomKey

function GenerateRandomKey (len, salt) {
  len = len || 15
  salt = salt || 14
  return bcrypt.hashSync(crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len), salt)
}


