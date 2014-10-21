var requestify = require('requestify')
var bcrypt = require('bcrypt')
var extend = require('util')._extend
var objectHash = require('object-hash')

module.exports = Message

function Message (data) {
  var self = this
  if (!(self instanceof Message)) return new Message(data)

  self._data = extend({}, data)
}

Message.prototype.verifyURL = function (callback) {
  var self = this,
    url = self._data.url + 'realm/verify?key=' +
      self.buildKey(self._data.hash, {url: sails.config.publicaddress}) +
      '&url=' + sails.config.publicaddress

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
  return bcrypt.hashSync(key + objectHash(data), 10)
}

Message.prototype.validate = function (callback) {
  var self = this,
    key = self._data.key || ''

  delete self._data.key

  var dataHash = objectHash(self._data)

  Cluster.findOne({url: self._data.url }, function (err, entry) {
    if (err) return callback(err)

    if (entry && entry.hash) {
      var valid = bcrypt.compareSync(entry.hash + dataHash, key)

      if (!valid) {
        return callback(new Error("Invalid key"))
      } else {
        return callback(null, self._data)
      }
    } else {
      return callback(new Error("Cluster not found"))
    }
  })

}

