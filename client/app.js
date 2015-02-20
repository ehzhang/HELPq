Tickets = new Meteor.Collection("tickets");
Announcements = new Meteor.Collection("announcements");

Meteor.subscribe("userData");
Meteor.subscribe("activeTickets");
Meteor.subscribe("allAnnouncements");

Tracker.autorun(function(){
  if (authorized.admin() && Session.equals('admin', 'users')){
    Meteor.subscribe("allUsers");
  }
});

Tracker.autorun(function(){
  if (authorized.admin() && Session.equals('admin', 'tickets')){
    Meteor.subscribe("allTickets");
  }
});
