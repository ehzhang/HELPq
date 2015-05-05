Template.leaderboard.onCreated(function(){
  this.subscribe("allTickets");
});

Template.leaderboard.helpers({
  users: function(){
    // Top x Mentors
  }
});