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

Message.prototype.sendMessageToReceiver = function (action, callback) {
  var self = this

  ClusterHandler.getIdentityOf(self._data.sender, function (err, sender) {
    if (err) return callback(err)
    ClusterHandler.getIdentityOf(self._data.receiver, function (err, receiver) {
      if (err) return callback(err)

      if (self._data.agreement) {
        Agreement.findOne({id: self._data.agreement}, function (err, agreement) {
          if (err) return callback(err)
          if (agreement && agreement.id) {

            self._data.sender = sender
            self._data.receiver = receiver
            self._data.agreement = {id: agreement.id, title: agreement.title, status: agreement.status}

            self._send(receiver.id, action, callback)

          } else {
            return callback(new Error('Agreement not found.'))
          }
        })
      } else {
        self._data.sender = sender
        self._data.receiver = receiver
        self._data.agreement = {}

        self._send(receiver.id, action, callback)
      }

    })
  })
}

Message.prototype._send = function (cluster, action, callback) {
  var self = this,
    _data = extend({}, self._data)

  delete _data.key
  delete _data.id //TODO: FIXME: don't delete id
  if (typeof callback !== "function") {
    callback = function(){}
  }

  Cluster.findOne({id: cluster}, function (err, entry) {
    if (err) return callback(err)
    if (entry.id > 0) {
      _data.url = sails.config.publicaddress
      /*url = self._data.url + 'realm/verify?key=' +
      self.buildKey(self._data.hash, {url: sails.config.publicaddress}) +
      '&url=' + sails.config.publicaddress*/
      _data = Common.SanitizeRequestParameters(_data)
      console.log("\nDATA GOING TO BE USED TO BUILD KEY:")
      console.log(_data)
      _data.key = self.buildKey(entry.hash, _data)
      console.log("\nENTRY.HASH: " + entry.hash)
      console.log("\nDATA GOING TO BE SEND:")
      console.log(_data)
      requestify.get(entry.url + action, {params: _data}).then( function(response) {
        response.getBody()
        var body = {}
        try {
          body = JSON.parse(response.body)
          if (body.error) {
            return callback(new Error(body.error))
          } else {
            return callback(null, body.data)
          }
        } catch (e) {
          return callback(e)
        }
      }, function(error) {
        callback(error)
      })
    } else {
      return callback(new Error('Target cluster not found.'))
    }
  })
}



