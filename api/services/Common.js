/**
 * Created by Theadd on 22/10/2014.
 */

var extend = require('util')._extend
var bcrypt = require('bcrypt')
var crypto = require('crypto')

module.exports.GenerateRandomKey = GenerateRandomKey
module.exports.StringXOR = StringXOR
module.exports.SanitizeRequestParameters = SanitizeRequestParameters
module.exports.Encode = Encode
module.exports.Decode = Decode

function GenerateRandomKey (len, salt) {
  len = len || 15
  salt = salt || 14
  return bcrypt.hashSync(crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len), salt)
}

/**
 *
 * @param y
 * @param z
 * @returns {string}
 * @constructor
 */
function StringXOR (y, z) {
  var x = ""
  for (var i = 0; i < y.length; ++i) {
    x += String.fromCharCode(y.charCodeAt(i) ^ z.charCodeAt(i))
  }
  return x
}

function SanitizeRequestParameters (input) {
  input = input || {}
  var output = extend({}, input)
  console.log("\nIN SanitizeRequestParameters:")
  for (var i in output) {
    switch (i) {
      case 'updatedAt':
      case 'createdAt':
        output[i] = output[i].getTime()
        break;
      case 'sender':
      case 'receiver':
      case 'agreement':
        output[i] = JSON.stringify(output[i])
        break;
    }
    console.log("\tTYPEOF " + i + ": " + (typeof output[i]) + ", VALUE: " + output[i])
  }
  return output
}

function Encode (input, key){
  var cipher = crypto.createCipher('aes-256-cbc', key)
  var crypted = cipher.update(JSON.stringify(input), 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

/**
 *
 * @param input
 * @param key
 * @returns {*}
 * @constructor
 */
function Decode (input, key){
  var decipher = crypto.createDecipher('aes-256-cbc', key)
  var dec = decipher.update(input, 'hex', 'utf8')
  dec += decipher.final('utf8')
  try {
    return JSON.parse(dec)
  } catch (e) {
    return false
  }
}
