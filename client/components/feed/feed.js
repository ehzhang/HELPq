Template.feed.onCreated(function(){
  this.subscribe("activeTickets");
});

Template.feed.helpers({
  tickets: function () {
    return activeTickets();
  },
  mentorsAvailable: function(){
    return mentorsOnline().length;
  },
  estimatedWait: function(){
    return formatTime(estimatedWait);
  }
});

Template.feedTicket.helpers({
  feedName: function () {
    if (this.name){
      return this.name;
    }
  },
  fromNow: function(time){
    return moment(time).from(ReactiveNow.get());
  },
  open: function(){
    return this.status === "OPEN";
  },
  claimed: function(){
    return this.status === "CLAIMED";
  }
});

Template.feedTicket.rendered = function(){
  $(this.find('.feedTicket')).addClass('animated fadeIn');
};

function activeTickets(){
  return Tickets.find({
    'status': {
      $in: ['OPEN', 'CLAIMED']
    }
  }, {
    $sort: {timestamp: 1}
  }).fetch();
}
