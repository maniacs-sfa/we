/**
 * Contact.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {

    // user how send the request
    from: {
      model: 'user',
      required: true
    },

    // user how receive the request
    to: {
      model: 'user',
      required: true
    },

    // requested | accepted| ignored
    status: {
      type: 'string',
      defaultsTo: 'requested'
    }

	}

};
