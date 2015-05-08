Template.feedback.onCreated(function(){
  this.subscribe("allTickets");
});

Template.feedback.helpers({
  tickets: function(){
    return Tickets.find({status: 'COMPLETE'})
        .fetch()
        .filter(function(t){
          return t.rating;
        })
        .map(function(t){
          return {
            name: t.claimName,
            rating: t.rating,
            comments: t.comments
          }
        });
  }

});

Template.feedbackItem.helpers({
  negative: function(){
    return this.rating < 3;
  }
});

Template.feedbackItem.rendered = function(){
  $(this.findAll(".ui.rating")).rating(
      {
        interactive: false,
        maxRating: 5
      }
  )
};