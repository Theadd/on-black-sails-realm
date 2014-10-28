/**
 * Agreement.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  schema: true,

  attributes: {

    title: {
      type: 'string',
      defaultsTo: ''
    },

    note: {
      type: 'string',
      defaultsTo: ''
    },

    hash: {
      type: 'string',
      required: true
    },

    sender: {
      model: 'Cluster'
    },

    receiver: {
      model: 'Cluster'
    },

    incomingfilters: {
      type: 'array',
      defaultsTo: []
    },

    outgoingfilters: {
      type: 'array',
      defaultsTo: []
    },

    incomingallsources: {
      type: 'boolean',
      defaultsTo: false
    },

    outgoingallsources: {
      type: 'boolean',
      defaultsTo: false
    },

    status: {
      type: 'string',
      enum: ['pending', 'accepted', 'denied', 'cancelled', 'paused', 'deleted'],
      defaultsTo: 'pending'
    },

    toJSON: function() {
      var obj = this.toObject()
      delete obj.hash
      return obj
    }

  }
};

