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