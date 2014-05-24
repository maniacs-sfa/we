/** Copyright 2014, Alberto Souza
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

// starts we.js lib
// TODO move this to amber logic

define([
  'we',
  'showdown',
  'async',
  'ember',
  'weEmberPlugin',
  'sails.io',
  'ember-uploader'
], function (we, Showdown, async) {

  window.socket = we.io.socket;

  window.App = Ember.Application.create({
    locale: we.config.language,
    LOG_TRANSITIONS: true, // basic logging of successful transitions
    LOG_TRANSITIONS_INTERNAL: true, // detailed logging of all routing steps
    LOG_VIEW_LOOKUPS: true
  });

  App.deferReadiness();


  //App.ApplicationAdapter = DS.SailsRESTAdapter.extend({
  App.ApplicationAdapter = DS.SailsSocketAdapter.extend({
      defaultSerializer: '-default',
    //namespace: 'api/v1'
    // pathForType: function(type) {
    //   var camelized = Ember.String.camelize(type);
    //   return Ember.String.singularize(camelized);
    // }
  });

  App.LayoutView = Ember.View.extend({
    //templateName: 'layouts/twoColumns',
    isVisible: true,
    attributeBindings: ['isVisible'],
    init: function() {
      this._super();
      var thisView = this;
      this.set("controller", App.ModalLoginController.create());
    }
  });

  App.Router.reopen({
    location: 'history'
  });

  var modelNames = Object.keys(we.emberApp.models);
  console.warn('we.config', we.configs.client.emberjsParts.parts);

  var emberRequireModules = [];

  for(var emberjsPart in we.configs.client.emberjsParts.parts){
    emberRequireModules = emberRequireModules.concat( we.configs.client.emberjsParts.parts[emberjsPart] );
  }

  require(emberRequireModules,function(){
    // Set default routes contigs
    async.each( modelNames, function(modelName, next){

      var modelVarName = modelName.charAt(0).toUpperCase() + modelName.slice(1).toLowerCase();
      App[modelVarName] = we.emberApp.models[modelName];

      App[modelVarName + 'Route'] = Ember.Route.extend({
        model: function() {
          return this.store.find(modelName);
        }
      });
      next();

    }, function(){


      // Map app routers
      App.Router.map(function(match) {
        this.resource('home', {
          path: '/',

        });

        var thisPointer = this;

        modelNames.forEach(function(modelName){
          this.resource(modelName, function() {
            this.route(modelName);
          });

        }, this);

        App.advanceReadiness();

      });

    });
  });

  var showdown = new Showdown.converter();

  Ember.Handlebars.helper('format-markdown', function(input) {
    return new Handlebars.SafeString(showdown.makeHtml(input));
  });

  Ember.Handlebars.helper('format-date', function(date) {
    return moment(date).fromNow();
  });

  Ember.Handlebars.registerHelper('t', function (property, options) {
    if(property){
      return we.i18n( property );
    } else{
      return '';
    }
  });

  return App;

});