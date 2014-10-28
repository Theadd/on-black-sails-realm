/**
 * Created by Theadd on 22/10/2014.
 */

var extend = require('util')._extend
var bcrypt = require('bcrypt')
var crypto = require('crypto')

module.exports.GenerateRandomKey = GenerateRandomKey
module.exports.StringXOR = StringXOR
module.exports.SanitizeRequestParameters = SanitizeRequestParameters

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
