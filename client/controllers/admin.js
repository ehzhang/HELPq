Template.admin.events({
  'click .toggle-mentor': function(){
    Meteor.call("toggleRole", "mentor", this._id);
  },
  'click .toggle-admin': function(){
    Meteor.call("toggleRole", "admin", this._id);
  }
});