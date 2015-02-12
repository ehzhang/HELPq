Template.login.events({
  'click #login-github': function(){
    Meteor.loginWithGithub();
  },
  'click #login-facebook': function(){
    Meteor.loginWithFacebook();
  }
});

Template.login.rendered = function(){
  $(this.findAll('.container')).addClass('animated fadeIn');
};