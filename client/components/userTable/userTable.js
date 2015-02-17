var filters = {
  all: {}
  ,
  student: {
    'profile.mentor': false,
    'profile.admin': false
  },
  mentor: {
    'profile.mentor': true
  },
  admin: {
    'profile.admin': true
  }
};

Template.userTable.created = function(){
  this.searchText = new ReactiveVar();
  this.filter = new ReactiveVar({});
  this.selectedUser = new ReactiveVar(Meteor.user());
};

Template.userTable.rendered = function(){
  $(this.find('.ui.dropdown')).dropdown();
};

Template.userTable.helpers({
  filter: function(){
    return Template.instance().filter.get();
  },
  searchText: function() {
    return Template.instance().searchText.get();
  },
  selectedUser: function(){
    return Template.instance().selectedUser.get();
  },
  users: function(){
    var t = Template.instance();
    var users = Meteor.users.find(
        t.filter.get()
        , {
          sort: {
            createdAt: 1
          }
    }).fetch();
    return filterBySearchText(users, t.searchText.get());
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
  },
  'keyup .searchText': function(e, t){
    var currentValue=t.find(".searchText").value;
    t.searchText.set(currentValue);
  },
  'click .filter': function(e, t){
    var filter = filters[e.target.getAttribute('data-filter')];
    t.filter.set(filter);
  },
  'click .edit-user': function(e, t){
    t.selectedUser.set(this);
    $('.ui.edit-user.modal').modal('show');
  }
});

function filterBySearchText(users, searchText){
  return users.filter(function(user){
    if (!searchText) return true;
    return JSON.stringify(user).toLowerCase().indexOf(searchText.toLowerCase()) > -1;
  })
}