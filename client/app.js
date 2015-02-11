Tickets = new Meteor.Collection("tickets");

Meteor.subscribe("allUsers");
Meteor.subscribe("userData");
Meteor.subscribe("activeTickets");
//Meteor.subscribe("allTickets");

