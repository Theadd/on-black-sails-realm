/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://links.sailsjs.org/docs/config/bootstrap
 */

module.exports.bootstrap = function(cb) {

  // It's very important to trigger this callack method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  /*Action.destroy({}).exec(function() {
    Agreement.destroy({}).exec(function() {
      Cluster.destroy({}).exec(function() {
       console.error("hey, we've destroyed everything!")
       cb()
      })
    })
  })*/
  Agreement.update({incomingallfields: null}, {
    incomingallfields: true,
    outgoingallfields: true
  }, function (err, entries) {
    if (err) {
      sails.log.error(err)
    }
    console.log(entries)
    cb()
  })
  //cb()
}
