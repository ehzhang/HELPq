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
    if (this.status === "CLAIMED") return "warning"
  }
});