
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

ClusterHandler.prototype.createAgreement = function (params, callback) {
  var data = extend({}, params)

  data.hash = Common.GenerateRandomKey(15, 12)
  data.receiver = Number(data.receiver)
  data.sender = Number(data.sender)
  delete data.url
  delete data.id

  Agreement.create(data).exec(function (err, entry) {
    if (err) return callback(err)
    return callback(null, entry)
  })

}



