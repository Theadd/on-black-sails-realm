/**
 * ClusterController
 *
 * @description :: Server-side logic for managing clusters
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */



module.exports = {

  index: function(req, res) {

    Cluster.find(function (err, entries) {
      if (err) {
        res.json({
          error: err.message
        })
      } else {
        res.json({
          error: false,
          data: entries
        })
      }
    })
  },

  create: function (req, res) {
    var params = req.params.all()

    if ((params.name || false) && (params.url || false) && (params.hash || false)) {

      var data = {
        name: params.name,
        url: params.url,
        hash: params.hash
      }

      ClusterHandler.exists(data, function (err, exists) {
        if (err) {
          res.json({
            error: err.message
          })
        } else {
          var message = new Message(data)

          message.verifyURL(function (err) {
            if (err) {
              res.json({
                error: err.message
              })
            } else {
              if (!exists) {
                Cluster.create(data).exec(function (err, entry) {
                  console.log(entry)
                  if (err) {
                    res.json({
                      error: err.message
                    })
                  } else {
                    res.json({
                      error: false,
                      data: { cluster: entry.id }
                    })
                  }
                })
              } else {
                res.json({
                  error: false,
                  data: { cluster: exists }
                })
              }
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

