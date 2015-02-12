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
    Meteor.call("createAnnouncement", a.header, a.content);
  }
}

function getAnnouncement(){
  return {
    header: $('#a-header').val(),
    content: $('#a-content').val()
  }
}

function isValid(){
  return $('#a-header').val().length > 0
      && $('#a-content').val().length > 0
}
