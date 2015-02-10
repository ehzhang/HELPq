Tickets = new Meteor.Collection("tickets");

Meteor.subscribe("userData");
Meteor.subscribe("allActiveTickets");