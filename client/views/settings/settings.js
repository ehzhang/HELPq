// Helper to edit the settings
Template.settings.rendered = function(){
  $(this.findAll('.ui.checkbox')).checkbox();
};

Template.settings.helpers({
  settings: function(){
    return Settings.findOne({});
  }
});

Template.settings.events({
  "click #queueEnabled.ui.checkbox": function(e, t){
    Meteor.call("toggleSetting",
        'queueEnabled',
        $('#queueEnabled input').prop('checked'));
  }
});
