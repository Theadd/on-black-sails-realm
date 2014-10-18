/**
* Cluster.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  schema: true,

  attributes: {

    name: {
      type: 'string',
      required: true
    },

    url: {
      type: 'string',
      required: true,
      unique: true
    },

    email: {
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

    reputation: {
      type: 'integer',
      defaultsTo: 0
    },

    status: {
      type: 'string',
      defaultsTo: 'stable'
    },

    indexfiles: {
      type: 'boolean',
      defaultsTo: false
    },

    removedead: {
      type: 'boolean',
      defaultsTo: false
    },

    total: {
      type: 'integer',
      defaultsTo: 0
    },

    downloaded: {
      type: 'integer',
      defaultsTo: 0
    },

    scraped: {
      type: 'integer',
      defaultsTo: 0
    }

  }
};

