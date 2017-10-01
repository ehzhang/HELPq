Template.ticket.rendered = function(){
};

Template.ticket.helpers({
  statusIs: function(status){
    return this.status === status;
  },
  claimer: function(){
    return this.claimId === Meteor.user()._id;
  },
  ownsTicket: function(){
    return this.userId === Meteor.user()._id;
  },
  fromNow: function(){
    return moment(this.timestamp).from(ReactiveNow.get());
  },
  formattedDate: function(){
    return moment().format('MMMM Do YYYY, h:mm a');
  },
  hasClaimedTicket: function(){
    return Tickets.find({status: "CLAIMED", claimId: Meteor.user()._id}).fetch().length > 0;
  },
  isExpirable: function(){
    return this.expiresAt !== Infinity;
  },
  relativeExpirationString: function(){
    return "Ticket expiration: " + moment(this.expiresAt).from(ReactiveNow.get());
  },
  actualExpirationString: function(){
    return "(" + moment(this.expiresAt).format('h:mm') + ")";
  },
  percentDone: function(){
    //number between 0 and 1
    if (this.expiresAt === Infinity) {
      return 0;
    }

    var totalDuration = this.expiresAt - this.timestamp;

    if (totalDuration === 0 || this.expiresAt < InstantReactiveNow.get()) {
      return 1;
    }

    return 1 - (this.expiresAt - InstantReactiveNow.get()) / (this.expiresAt - this.timestamp);
  },
  formatPercent: function(percent){
    //takes a value like 0.8 and outputs 80%
    return percent * 100 + "%";
  },
  getColor: function(percent){
    return 'hsl(' + (1 - percent) * 120 + ', 75%, 50%)'
  }
});

Template.ticket.events({
  'click .claim.button': function(){
    Meteor.call('claimTicket', this._id);
  },
  'click .complete.button': function(){
    Meteor.call('completeTicket', this._id);
  },
  'click .reopen.button': function(){
    Meteor.call('reopenTicket', this._id);
  },
  'click .cancel.button': function(){
    if(confirm('Are you sure you would like to cancel this ticket?')){
      Meteor.call('cancelTicket', this._id);
    }
  }
});