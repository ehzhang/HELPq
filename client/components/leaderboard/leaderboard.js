Template.leaderStats.onCreated(function(){
  this.subscribe("allTickets");
});

Template.leaderStats.helpers({
  users: function(){
    // Top x Mentors
  }
});