
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

      if (entry.id || false) {
        if (typeof data.hash !== "undefined") {
          if (entry.hash == data.hash) {
            return callback(null, entry.id)
          } else {
            return callback(new Error('Public address already registered but key does not match.'))
          }
        } else {
          return callback(null, true)
        }
      } else {
        return callback(null, false)
      }

    })
  } else {
    callback(new Error('Missing required parameters.'))
  }

}



