Template.login.events({
  'click #login-github': function(){
    Meteor.loginWithGithub({
      loginStyle: 'redirect'
    });
  },
  'click #login-facebook': function(){
    Meteor.loginWithFacebook({
      loginStyle: 'redirect'
    });
  }
});

Template.login.helpers({
  enabled: function(){
    var services = {};
    ServiceConfiguration.configurations.find({}).fetch().forEach(function(service){
      services[service.service] = true;
    });
    return services;
  }
});

Template.login.rendered = function(){
  $(this.findAll('.container')).addClass('animated fadeIn');
};