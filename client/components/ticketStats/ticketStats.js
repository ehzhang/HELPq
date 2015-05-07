Template.ticketStats.onCreated(function(){
  this.subscribe("allTickets");
});

Template.ticketStats.helpers({
  claimTimes: function(){
    return Tickets.find({status: 'COMPLETE'}).fetch()
      .filter(function(ticket){
        return ticket.claimTime && ticket.timestamp;
      })
      .map(function(ticket){
        return (ticket.claimTime - ticket.timestamp);
      });
  },
  completeTimes: function(){
    return Tickets.find({status: 'COMPLETE'})
        .fetch()
        .filter(function(t){return t.claimTime && t.completeTime})
        .map(function(t){return t.completeTime - t.claimTime});
  },
  ratings: function(){
    return Tickets.find({})
        .fetch()
        .filter(function(t){return t.rating})
        .map(function(t){return t.rating});
  },
  meanTime: function(){
    return formatTime(stats.mean(this));
  },
  medianTime: function(){
    return formatTime(stats.median(this));
  },
  stdDevTime: function(){
    return formatTime(stats.stdDev(this));
  },
  mean: function(){
    return stats.mean(this).toFixed(1);
  },
  count: function(num){
    return this.filter(function(n){return n == num}).length;
  }

});

function formatTime(ms){
  var sec = ms/1000;
  var output = (sec % 60).toFixed(0) + " seconds";
  if (sec > 60){
    output = Math.floor(sec / 60) + " minutes, " + output;
  }
  if (sec > 3600){
    output = Math.floor(sec / 3600) + " hours, " + output;
  }
  return output;
}