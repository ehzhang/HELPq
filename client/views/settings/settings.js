// Helper to edit the settings
Template.settings.rendered = function(){
  $(this.findAll('.ui.checkbox')).checkbox();
  setRadio('expirationDelay');
};

Template.settings.helpers({
  settings: function(){
    return settings();
  }
});

Template.settings.events({
  "click #queueEnabled.ui.checkbox": function(e, t){
    Meteor.call("setSetting",
        'queueEnabled',
        $('#queueEnabled input').prop('checked'));
  },
  "click .checkbox[data-name='expire']": function(e, t){
    var value = t.findAll("input[name='expirationDelay']").filter(function(box){
      return box.checked;
    })[0].value;
    Meteor.call("setSetting", 'expirationDelay', parseInt(value));
  }
});

function settings(){
  return Settings.findOne({});
}

function setRadio(name){
  if (settings()){
    $("input[name='" + name + "']").each(function(i, el){
      if (el.value == settings()[name]){
        el.checked = true;
      }
    })
  }
}
