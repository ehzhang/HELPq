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
  statusIs: function(status){
    return this.status === status;
  },
  greeting: function(){
    // Return the first name
    if (Meteor.user().profile.name){
      return "Hey, " + Meteor.user().profile.name.split(" ")[0] + "!";
    }

    if (Meteor.user().services.github){
      return "Hey, " + Meteor.user().services.github.username + "!";
    }

    return "Hey there!";

  },
  queueEnabled: function(){
    var settings = Settings.findOne({});
    if (settings){
      return settings.queueEnabled;
    }
  },
  hasUnratedTicket: function(){
    // If there is an unrated ticket
  }
});

Template.ticketPanel.rendered = function(){
  $(this.find('.ticketPanel')).addClass('animated bounceIn')
};

Template.ticketPanel.events({
  'click #submit': function(){
    return createTicket();
  },
  'click .cancel': function(){
    if(confirm('Are you sure you would like to cancel your ticket?')){
      return Meteor.call("cancelTicket", this._id);
    }
  },
  'keydown input': function(e){
    if (e.keyCode == 13){
      createTicket();
    }
  },
  'keyup input': function(){
    var $submit = $('#submit');
    if (isValid()){
      $submit.removeClass('disabled');
    } else {
      $submit.addClass('disabled');
    }
  }
});

function isValid(){
  return $('#topic').val().length > 0 &&
         $('#location').val().length > 0 &&
         $('#contact').val().length > 0
}

function getTicket(){
  return {
    topic: $('#topic').val(),
    location: $('#location').val(),
    contact: $('#contact').val()
  }
}

function createTicket(){
  if (isValid()){
    var ticket = getTicket();
    Meteor.call('createTicket', ticket.topic, ticket.location, ticket.contact);
  }
}
