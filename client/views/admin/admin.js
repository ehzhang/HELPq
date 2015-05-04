Template.admin.helpers({
  pageIs: function(page){
    return Session.equals("admin", page);
  },
  isActive: function(page){
    return Session.equals("admin", page) ? "active" : "";
  }
});

Template.admin.events({
  'click .admin.menu .item': function(e){
    var page = e.target.getAttribute('data-goto');
    Session.set("admin", page);
  }
});

