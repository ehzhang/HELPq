Template.userStats.helpers({
  users: function(){
    return Meteor.users.find({}).fetch();
  },
  mentors: function(){
    return Meteor.users.find({
      'profile.mentor': true
    }).fetch();
  },
  admins: function(){
    return Meteor.users.find({
      'profile.admin': true
    }).fetch();
  }

});