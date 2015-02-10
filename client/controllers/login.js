Template.login.events({
  'click #login': function(){
    Meteor.loginWithGithub();
  }
});

Template.login.rendered = function(){
  $(this.findAll('.container')).addClass('animated fadeIn');
};