Template.feed.helpers({
  tickets: function () {
    return Tickets.find({
      status: {
        $in: ['OPEN', 'CLAIMED']
      }
    }, {
      $sort: {timestamp: 1}
    }).fetch();
  }
});

Template.feedTicket.helpers({
  feedName: function () {
    if (this.name){
      return this.name;
    }
  },
  fromNow: function(time){
    return moment(time).fromNow();
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