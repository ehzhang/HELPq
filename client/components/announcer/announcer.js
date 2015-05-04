Template.announcer.rendered = function(){
  $(this.findAll('.ui.checkbox')).checkbox();
};

Template.announcer.events({
  'click .submit.button': function(){
    createAnnouncement();
  },
  'keydown input': function(e){
    if (e.keyCode == 13){
      createAnnouncement();
    }
  },
  'keyup .field': function(){
    var $submit = $('button.submit');
    if (isValid()){
      $submit.removeClass('disabled');
    } else {
      $submit.addClass('disabled');
    }
  }
});

function createAnnouncement(){
  if(isValid()){
    var a = getAnnouncement();
    Meteor.call("createAnnouncement", a.header, a.content, a.type);
    clearFields();
  }
}

function getAnnouncement(){
  var form = $('.ui.form input, .ui.form textarea')
      .serializeArray()
      .reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
      }, {});
  return {
    header: form.header,
    content: form.content,
    type: form.type
  }
}

function clearFields(){
  $(".ui.form input[type='text'], .ui.form textarea").val("");
}

function isValid(){
  return $('#a-header').val().length > 0
      && $('#a-content').val().length > 0
}
