Template.nav.events({
  'click #logout': function(){
    Meteor.logout();
  }
});

Template.nav.helpers({
  profile: function(){
    if (Meteor.user().profile.name){
      return Meteor.user().profile.name;
    }
    return "Profile";
  }
});