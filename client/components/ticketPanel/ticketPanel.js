const pinLeftOffset = 0;
const pinTopOffset = 0;
const topPadding = 16;
const leftPadding = 15;

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
    return Meteor.settings.public.MISC+"/floorplan.jpg";
  },
});

Template.ticketPanel.rendered = function(){
  $(this.find('.ticketPanel')).addClass('animated bounceIn')
};

Template.ticketPanel.events({
  'click #location': function(event){ //Displays Map UI
    $('.map').css('display', 'block');
    const map = $('.map')
    const ratio = .8;
    const windowWidth = $(window).width();
    const offset = map.offset();
    if (windowWidth > 760) {
      //size it with some padding
      map.width(windowWidth * ratio);
      offset.left = windowWidth * (1 - ratio) / 2;
    } else {
      //no padding
      map.width(windowWidth);
      offset.left = 0;
    }
    map.offset(offset);
  },
  'click #map': function(event){ //Pins user's click location
    var $map_confirm = $('#map_confirm');
    console.log(event);
    $('#location').val(event.pageX, event.pageY);
    $map_confirm.removeClass('disabled');
    createPin(event.clientX, event.clientY);
    console.log("clientX: " + event.clientX + " - clientY: " + event.clientY);

    // set pin-location
    const map = $('.map');
    const pin = $('.pin');
    
    const poff = pin.offset();
    const moff = map.offset();

    const top = poff.top - moff.top + pinTopOffset - topPadding;
    const left = poff.left - moff.left + pinLeftOffset - topPadding;

    const width = map.width();
    const height = map.height();
    
    $('#pin-location').val((top/height)+","+(left/width));
  },
  'click #map_cancel': function(){ //Exit Map UI
    $('#pin-location').val('');
    $('#map_confirm').addClass('disabled')
    createPin(-1000, -1000);
    $('.map').css('display', 'none');
  },
  'click #map_confirm': function(){ //Confirm Location
    console.log($('#pin-location').val())
    if($('#pin-location').val() != '') {
      
      $('.map').css('display', 'none');
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
  const scroll = $(document).scrollTop();
  $('.pin').css('display', 'block');
  $('.pin').offset({top: y - pinTopOffset + scroll, left: x - pinLeftOffset});
}

function isValid(){
  return $('#topic').val().length > 0 &&
         $('#pin-location').val() != "" &&
         $('#contact').val().length > 0
}

function getTicket(){
  return {
    topic: $('#topic').val(),
    location: $('#pin-location').val(),
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
