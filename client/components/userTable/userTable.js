Template.userTable.helpers({
  users: function(){
    return Meteor.users.find({},{
      sort: {
        createdAt: 1
      }
    })
  }
});

Template.userTable.events({
  'click .toggle-mentor': function(){
    Meteor.call("toggleRole", "mentor", this._id);
  },
  'click .toggle-admin': function(){
    if (this._id === Meteor.userId()){
      if (confirm('Are you sure you would like to remove your admin privileges?')){
        Meteor.call("toggleRole", "admin", this._id);
      }
    } else {
      Meteor.call("toggleRole", "admin", this._id);
    }
  }
});