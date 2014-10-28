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

  }

}

