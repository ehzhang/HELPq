Template.ticketPanel.onCreated(function(){
  this.subscribe("userTickets");
});

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
  unratedTicket: function(){
    // If there is an unrated ticket that this user owns
    return Tickets.findOne({
      userId: Meteor.user()._id,
      status: "COMPLETE",
      rating: null
    }, {
      sort: {
        timestamp: -1
      }
    });
  },
  expirationFromNow: function(){
    var ticket = Tickets.findOne({
      userId: Meteor.userId(),
      status: 'OPEN'
    });

    if (!ticket){
      return
    }

    // If the ticket doesn't expire
    if (ticket.expiresAt == Infinity){
      return false;
    }

    if (ticket.expiresAt < ReactiveNow.get()){
      Meteor.call("expireTicket", ticket._id);
    }

    return moment(ticket.expiresAt).from(ReactiveNow.get());
  },
  floorplan: function(){
    console.log("Call me maybe");
    return Meteor.settings.public.MISC+"/floorplan.jpg";
  },
});

Template.ticketPanel.rendered = function(){
  $(this.find('.ticketPanel')).addClass('animated bounceIn')
};

Template.ticketPanel.events({
  'click #location': function(event){ //Displays Map UI
      //$('#location').val("LOL"); //Temporary for Testing
      document.getElementsByClassName('map')[0].style.display = 'block';
  },
  'click #map': function(){ //Pins user's click location
      var $map_confirm = $('#map_confirm');
      $('#location').val(event.clientX, event.clientY);
      $map_confirm.removeClass('disabled');
      createPin(event.clientX, event.clientY);
      console.log("clientX: " + event.clientX + " - clientY: " + event.clientY);
  },
  'click #map_cancel': function(){ //Exit Map UI
      $('#location').val(null);
      document.getElementsByClassName('map')[0].style.display = 'none';
      console.log("EXIT");
  },
  'click #map_confirm': function(){ //Confirm Location
      if($('#location').val().length > 0){
        document.getElementsByClassName('map')[0].style.display = 'none';
        console.log("CONFIRM");
      }
  },
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

function createPin(x, y){
  console.log("Pinned by a pin");
  var nPin = document.createElement("pin");
  nPin.setAttribute('src', "/public/assets/images/pin.png");
  nPin.style.position = "absolute";
  nPin.style.zIndex = 5;
  nPin.style.left = x+'px';
  nPin.style.top = y+'px';
  document.body.appendChild(nPin);
}

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

Template.ticketPanelRating.rendered = function(){
  $(this.findAll('.ui.rating')).rating();
};

Template.ticketPanelRating.events({
  'click .rating': function(e, t){
    $('#feedback').removeClass('disabled');
  },
  'click #feedback': function(e, t){
    var $rating = $('#rating .rating');
    var rating = $rating.rating('get rating');
    var comments = $('textarea.comments');
    if (rating > 0){
      Meteor.call("rateTicket", this._id, rating, comments.val());

      // Clear the rating area. Shouldn't be used, unless there are multiple
      // unrated tickets.
      comments.val("");
      $rating.rating('clear rating');
      $('#feedback').addClass('disabled');
    }
  }
});
