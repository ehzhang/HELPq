Template.mentorChat.onCreated(function(){
  this.subscribe("userTickets");
});

Template.mentorChat.helpers({
  // Return the current open or claimed Ticket held by the user, if it exists
  currentTicket: function(){
    return Tickets.findOne({
      userId: Meteor.userId(),
      status: {
        $in: ["OPEN", "CLAIMED"]
      }
    })
  },
  statusIs: function(status){
    return this.status === status;
  },
  queueEnabled: function(){
    var settings = Settings.findOne({});
    if (settings){
      return settings.queueEnabled;
    }
  }
});

Template.mentorChat.rendered = function(){
  $(this.find('.mentorChat')).addClass('animated bounceIn')
};
