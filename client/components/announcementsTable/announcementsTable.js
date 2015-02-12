Template.announcementsTable.helpers({
  announcements: function(){
    return Announcements.find({

    }, {
      sort: {
        timestamp: -1
      }
    })
  },
  time: function(){
    return moment(this.timestamp).format('MMMM Do YYYY, h:mm a');
  }
});

Template.announcementsTable.events({
  'click .close.icon': function(){
    Meteor.call('deleteAnnouncement', this._id);
  }
});