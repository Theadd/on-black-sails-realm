/**
 * AgreementController
 *
 * @description :: Server-side logic for managing clusters
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */



module.exports = {

  index: function (req, res) {

    console.log("\n\nin agreement index")
    var params = req.params.all()
    console.log(params)

    ClusterHandler.exists(params, function (err, clusterid) {
      if (err) {
        res.json({
          error: err.message
        })
      } else {
        if (!clusterid) {
          res.json({
            error: 'Unexpected error.'
          })
        } else {
          Agreement.find(
            {
              where: {
                or: [
                  { sender: clusterid },
                  { receiver: clusterid }
                ]
              },
              sort: 'createdAt DESC'

            }).populate('sender').populate('receiver').exec(function (err, entries) {
              if (err) {
                res.json({
                  error: err.message
                })
              } else {
                res.json({
                  error: false,
                  data: entries
                })
                ClusterHandler.retryPendingActionsOf(clusterid)
              }
            })
        }
      }
    })

  },

  hash: function (req, res) {

    var params = req.params.all()

    ClusterHandler.exists(params, function (err, clusterid) {
      if (err) {
        res.json({
          error: err.message
        })
      } else {
        if (!clusterid) {
          res.json({
            error: 'Unexpected error.'
          })
        } else {
          Agreement.findOne(
            {
              where: {
                id: params.agreement,
                status: 'accepted',
                or: [
                  { sender: clusterid },
                  { receiver: clusterid }
                ]
              }
            }).exec(function (err, entry) {
              if (err) {
                res.json({
                  error: err.message
                })
              } else if (entry && entry.hash) {
                Cluster.findOne({id: clusterid}).exec(function (err, cluster) {
                  if (err || !(cluster && cluster.hash)) {
                    res.json({
                      error: err.message || "Unexpected error."
                    })
                  } else {
                    res.json({
                      error: false,
                      data: Common.Encode(entry.hash, cluster.hash)
                    })
                  }
                })
              } else {
                res.json({
                  error: "Unexpected error."
                })
              }
            })
        }
      }
    })

  },

  create: function (req, res) {
    var params = req.params.all()

    if ((params.receiver || false) && (params.sender || false)) {

      delete params.id

      var message = new Message(params)

      message.validate(function (err, data) {
        if (!err) {
          ClusterHandler.createAgreement(data, function (err, entry) {
            console.log(entry)
            if (err) {
              res.json({
                error: err.message
              })
            } else {
              res.json({
                error: false,
                data: { agreement: entry.id }
              })
            }
          })
        } else {
          res.json({
            error: err.message
          })
        }
      })

    } else {
      res.json({
        error: "Missing required parameters."
      })
    }

  },

  /** ACTIONS **/

  'action': function(req, res) {
    var params = req.params.all()
    if ((params.agreement || false) && (params.type || false)) {
      delete params.id

      ClusterHandler.exists(params, function (err, clusterid) {
        if (err) {
          res.json({
            error: err.message
          })
        } else {
          var message = new Message(params)

          message.validate(function (err, data) {
            if (!err) {
              //perform action
              ClusterHandler.performAgreementAction(params.type, params.agreement, clusterid, function (err, response) {
                if (err) {
                  res.json({
                    error: err.message
                  })
                } else {
                  res.json({
                    error: false,
                    data: response || true
                  })
                }
              })
            } else {
              res.json({
                error: err.message
              })
            }
          })
        }
      })

    } else {
      res.json({
        error: "Missing required parameters."
      })
    }

  }

}

