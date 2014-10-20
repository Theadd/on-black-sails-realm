var requestify = require('requestify')
var crypto = require('crypto')
var bcrypt = require('bcrypt')
var extend = require('util')._extend

module.exports = Message

function Message (data) {
  var self = this
  if (!(self instanceof Message)) return new Message(data)

  self._data = extend({}, data)
}

Message.prototype.verifyURL = function (callback) {
  var self = this,
    url = self._data.url + 'settings/verify?key=' + self.buildKey(self._data.hash, sails.config.publicaddress)

  requestify.get(url).then(function(response) {
    response.getBody()
    var body = {}
    try {
      body = JSON.parse(response.body)
      if (body.error) {
        return callback(new Error(body.error))
      } else {
        return callback(null)
      }
    } catch (e) {
      return callback(e)
    }
  }, function(error) {
    callback(new Error("Error " + error.code + " in HTTP request: " + url))
  })

}

Message.prototype.buildKey = function (key, data) {
  var dataHash = crypto.createHash('md5').update(JSON.stringify(data)).digest("hex")

  return bcrypt.hashSync(key + dataHash, 10)
}

