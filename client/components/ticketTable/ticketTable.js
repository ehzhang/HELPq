Template.ticketTable.onCreated(function(){
  this.subscribe("allTickets");
});

Template.ticketTable.helpers({
  tickets: function(){
    return Tickets.find({
        },{
          sort: {
            timestamp: -1
          }
        }

    );
  },
  rowClass: function(){
    if (this.status === "COMPLETE") return "positive";
    if (this.status === "CANCELLED") return "negative";
    if (this.status === "CLAIMED") return "active";
    if (this.status === "EXPIRED") return "warning";
  }
});

Template.ticketTable.events({
  'click .delete': function(){
    Meteor.call('deleteTicket', this._id);
  }
});