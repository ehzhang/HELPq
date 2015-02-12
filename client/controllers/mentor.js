Template.tickets.helpers({
  activeTickets: function () {
    return Tickets.find({
      status: {
        $in: ['OPEN', 'CLAIMED']
      }
    }).fetch();
  }
});

Template.ticket.rendered = function(){
  $(this.findAll('.ticket')).addClass('animated bounceInUp');
};

Template.ticket.helpers({
  statusIs: function(status){
    return this.status === status;
  },
  claimer: function(){
    return this.claimId === Meteor.user()._id;
  },
  fromNow: function(){
    return moment(this.timestamp).fromNow();
  },
  formattedDate: function(){
    return moment().format('MMMM Do YYYY, h:mm a');
  }
});

Template.ticket.events({
  'click .claim.button': function(){
    Meteor.call('claimTicket', this._id)
  },
  'click .complete.button': function(){
    Meteor.call('completeTicket', this._id)
  },
  'click .reopen.button': function(){
    Meteor.call('reopenTicket', this._id)
  },
  'click .cancel.button': function(){
    if(confirm('Are you sure you would like to cancel this ticket?')){
      Meteor.call('cancelTicket', this._id)
    }
  }
});