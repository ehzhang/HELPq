Template.ticketPanel.helpers({
  // Return the current open or claimed Ticket held by the user, if it exists
  currentTicket: function(){
    return Tickets.findOne({
      userId: Meteor.userId(),
      status: {
        $in: ["OPEN", "CLAIMED"]
      }
    })
  },
  currentTicketIs: function(status){
    return Tickets.findOne({
      userId: Meteor.userId(),
      status: {
        $in: ["OPEN", "CLAIMED"]
      }
    }).status === status;
  }
});

Template.ticketPanel.rendered = function(){
  $(this.find('.ticketPanel')).addClass('animated bounceIn')
};

Template.ticketPanel.events({
  'click #submit': function(){
    return createTicket();
  },
  'click #cancel': function(){
    return cancelTicket();
  },
  'keydown input': function(e){
    if (e.keyCode == 13){
      createTicket();
    }
  }
});

function getTicket(){
  return {
    topic: $('#topic').val(),
    location: $('#location').val(),
    contact: $('#contact').val()
  }
}

function createTicket(){
  var ticket = getTicket();
  Meteor.call('createTicket', ticket.topic, ticket.location, ticket.contact);
}

function cancelTicket(){
  var ticket = getTicket();
}


