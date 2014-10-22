/**
 * AgreementController
 *
 * @description :: Server-side logic for managing clusters
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */



module.exports = {



  create: function (req, res) {
    var params = req.params.all()

    if ((params.receiver || false) && (params.sender || false)) {

      delete params.id

      var message = new Message(params)

      message.validate(function(err, data) {
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

