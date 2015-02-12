Session.set('admin', 'users');

Template.admin.helpers({
  isPage: function(page){
    return Session.equals("admin", page);
  },
  isActive: function(page){
    return Session.equals("admin", page) ? "active" : "";
  }
});

Template.admin.events({
  'click .menu .item': function(e){
    var page = e.target.getAttribute('data-goto');
    Session.set("admin", page);
  }
});

