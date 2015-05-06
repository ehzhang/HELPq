Template.announcement.onCreated(function(){
  this.subscribe("allAnnouncements");
});

Template.announcement.rendered = function(){
  $(this.find('.message')).addClass('animated fadeIn');
};

Template.announcement.helpers({
  announcement: function(){
    return Announcements.findOne({},{sort: {timestamp: -1}});
  },
  time: function(){
    return moment(this.timestamp).format('MMMM Do YYYY, h:mm a');
  }
});