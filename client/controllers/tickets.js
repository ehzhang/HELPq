Template.tickets.users = function(){
  return Meteor.users.find({'profile.active': true});
};

Template.ticket.rendered = function(){
  $(this.findAll('.ticket')).addClass('animated bounceInUp');
};

Template.ticket.events({
  'click .help.button': function(){
    if (confirm("Are you sure?")){
      Meteor.users.update(
          {
            _id: this._id
          },
          {
            $set: {
              'profile.active': false
            }
          }
      );
    }
  }
});