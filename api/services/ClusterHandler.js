
var extend = require('util')._extend

module.exports = new ClusterHandler()

function ClusterHandler () {
  var self = this
  if (!(self instanceof ClusterHandler)) return new ClusterHandler()
}

ClusterHandler.prototype.exists = function (data, callback) {
  var self = this

  if (data.url || false) {
    Cluster.findOne({url: data.url }, function (err, entry) {
      if (err) return callback(err)

      if (entry && entry.id) {
        return callback(null, entry.id)
      } else {
        return callback(null, false)
      }

    })
  } else {
    callback(new Error('Missing required parameters.'))
  }

}

ClusterHandler.prototype.getIdentityOf = function (id, callback) {
  var self = this

  if (id || false) {
    Cluster.findOne({id: id }, function (err, entry) {
      if (err) return callback(err)

      if (entry && entry.id) {
        var identity = {
          id: entry.id,
          name: entry.name,
          reputation: entry.reputation
        }
        return callback(null, identity)
      } else {
        return callback(new Error('Cluster not found, id: ' + id))
      }

    })
  } else {
    callback(new Error('Missing required parameters in ClusterHandler.getIdentityOf.'))
  }
}

ClusterHandler.prototype.createAgreement = function (params, callback) {
  var self = this,
    data = extend({}, params)

  data.hash = Common.GenerateRandomKey(15, 12)
  data.receiver = Number(data.receiver)
  data.sender = Number(data.sender)
  delete data.url
  delete data.id

  Agreement.create(data).exec(function (err, entry) {
    if (err) return callback(err)
    self.performAgreementAction({
      type: 'request',
      note: '',
      agreement: entry.id,
      sender: data.sender,
      receiver: data.receiver
    }, function (err) {
      if (err) sails.log.error(err)
      return callback(null, entry)
    })
  })
}

ClusterHandler.prototype.performAgreementAction = function (params, callback) {
  console.log("\nraw params as argument of performAgreementAction: ")
  console.log(params)
  console.log(" ")
  Action.create(params).exec(function (err, entry) {
    if (err) return callback(err)
    var message = new Message(params)
    message.sendMessageToReceiver('message/create', function (err, response) {
      if (response || false) {
        Action.update({ id: entry.id }, { received: true }, function () {})
      }
    })
    return callback(null, entry)
  })
}

ClusterHandler.prototype.retryPendingActionsOf = function (receiver) {
  receiver = Number(receiver)
  Action.find({receiver: receiver, received: false}).exec(function (err, entries) {
    if (err) return callback(err)
    for (var i in entries) {
      try {
        var message = new Message(entries[i])
        message.sendMessageToReceiver('message/create', function (err, response) {
          if (response || false) {
            Action.update({ id: entries[i].id }, { received: true }, function () {
            })
          }
        })
      } catch (e) {}
    }
  })
}



