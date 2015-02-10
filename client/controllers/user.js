Template.user.rendered = function(){
  $(this.findAll('.ticket')).addClass('animated bounceIn')
};

Template.user.events({
  'click #submit': function(){
    return updateTicket();
  },
  'click #cancel': function(){
    return cancelTicket();
  },
  'keydown input#location': function(e){
    if (e.keyCode == 13){
      updateTicket();
    }
  }
});

function getTicket(){
  return {
    date: new Date(),
    topic: $('#topic').val(),
    location: $('#location').val()
  }
}

function updateTicket(){
  var ticket = getTicket();
  Meteor.users.update(Meteor.user()._id, {
    $set: {
      'profile.active': true,
      'profile.ticket': ticket
    }
  });
}

function cancelTicket(){
  Meteor.users.update(Meteor.user()._id, {
    $set: {
      'profile.active': false,
      'profile.ticket.topic': null // Only clear the topic
    }
  });
}


