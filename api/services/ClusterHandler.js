
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
    self._performAgreementAction({
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


ClusterHandler.prototype.performAgreementAction = function (action, agreementid, senderid, callback) {
  var self = this, valid = false, isSender = false

  Agreement.findOne({id: agreementid }, function (err, agreement) {
    if (err) return callback(err)
    if (agreement && agreement.id) {

      var actionParams = {
        type: action,
        note: '',
        agreement: agreement.id,
        sender: senderid,
        receiver: 0
      }

      if (agreement.sender == senderid) {
        actionParams.receiver = agreement.receiver
        isSender = true
      } else if (agreement.receiver == senderid) {
        actionParams.receiver = agreement.sender
      } else {
        return callback(new Error("Not part of this agreement."))
      }

      switch (agreement.status) {
        case 'pending':
          switch (action) {
            case 'accept': valid = !isSender; break
            case 'refuse': valid = !isSender; break
            case 'cancel': valid = isSender; break
          }
          break;
        case 'accepted':
          switch (action) {
            case 'pause': valid = true; break
            case 'resume': valid = true; break
            case 'cancel': valid = true; break
          }
          break;
        case 'denied':
          switch (action) {
            case 'delete': valid = isSender; break
          }
          break;
        case 'cancelled':
          switch (action) {
            case 'delete': valid = isSender; break
          }
          break;
        case 'paused':
          switch (action) {
            case 'resume': valid = true; break
            case 'cancel': valid = true; break
          }
          break;
      }

      if (!valid) return callback(new Error("Invalid action '" + action + "' on '" + agreement.status + "' status."))
      self._performAgreementAction(actionParams, callback)
    }
  })
}

ClusterHandler.prototype._performAgreementAction = function (params, callback) {
  console.log("\nraw params as argument of performAgreementAction: ")
  console.log(params)
  console.log(" ")
  callback = callback || function () {}
  Action.create(params).exec(function (err, entry) {
    if (err) return callback(err)

    //update agreement status
    var status = ''
    switch (params.type) {
      case 'accept': status = 'accepted'; break
      case 'refuse': status = 'denied'; break
      case 'cancel': status = 'cancelled'; break
      case 'pause': status = 'paused'; break
      case 'resume': status = 'accepted'; break
      case 'delete': status = 'deleted'; break
    }
    if (status.length) {
      Agreement.update({ id: params.agreement }, { status: status }, function () {})
    }

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
            Action.update({ id: entries[i].id }, { received: true }, function () {})
          }
        })
      } catch (e) {}
    }
  })
}



