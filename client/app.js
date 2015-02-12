Tickets = new Meteor.Collection("tickets");

Meteor.subscribe("userData");
Meteor.subscribe("activeTickets");

Tracker.autorun(function(){
  if (authorized.admin()){
    Meteor.subscribe("allUsers");
  }
});

Tracker.autorun(function(){
  if (authorized.admin() && Session.equals('admin', 'tickets')){
    Meteor.subscribe("allTickets");
  }
});

