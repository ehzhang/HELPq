Template.ticket.rendered = function(){
};

Template.ticket.helpers({
  floorplan: function(){
    return Meteor.settings.public.MISC+"/floorplan.jpg";
  },
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
  }
});

Template.ticket.events({
  'click #see-location': function(event){
    const map = $('#map' + this._id);
    const mapimg = $('#mapimg' + this._id);
    const pin = $('#pin' + this._id);

    //set visible
    map.css('display', 'block');

    // set size of map
    const ratio = .8;
    const windowWidth = $(window).width();
    const offset = map.offset();
    console.log(windowWidth, offset);
    if (windowWidth > 760) {
      // size it with some padding
      map.width(windowWidth * ratio);
      offset.left = windowWidth * (1 - ratio) / 2;
    } else {
      // no padding
      map.width(windowWidth);
      offset.left = 0;
    }
    map.offset(offset);
    
    //move pin
    const loc = this.location.split(',');
    console.log(this.location);
    const top = parseFloat(loc[1]) * mapimg.height();
    const left = parseFloat(loc[0]) * mapimg.width();
    
    const pinOffset = Object.assign({}, mapimg.offset());
    console.log(pinOffset);
    pinOffset.top += top;
    pinOffset.left += left;
    console.log(top, left, pinOffset);
    pin.offset(pinOffset);
  },
  'click #map-close': function(){
    $('#map' + this._id).css('display', 'none');
  },
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
