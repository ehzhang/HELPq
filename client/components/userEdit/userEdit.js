Template.userEdit.created = function (){
  var skills = this.data.profile.skills ? this.data.profile.skills : [];

  this.skills = new ReactiveVar(skills);
  this.success = new ReactiveVar();
  this.error = new ReactiveVar();
};
Template.userEdit.helpers({
  success: function(){
    return Template.instance().success.get();
  },
  error: function(){
    return Template.instance().error.get();
  },
  skills: function(){
    return Template.instance().skills.get().map(function(skill, idx){
      return {
        index: idx,
        skill: skill
      }
    });
  }
});

Template.userEdit.events({
  'click .delete.skill': function(e, t){
    removeSkill(e, t);
  },
  "keyup input[name='skills']": function(e, t){
    if (e.keyCode === 13){
      addSkill(e, t)
    }
  },
  'click .add-skill': addSkill,
  'click .save.button': function(e, t){
    var profile = {};

    // Get the profile inputs
    // Look in this template only
    $(t.firstNode).find('input.profile').each(function(idx, el){
      var $el = $(el);
      profile[$el.attr('name')] = $el.val();
    });

    // Get the skills
    profile['skills'] = t.skills.get();

    Meteor.call("updateUser", t.data._id, profile, function(err){
      if (err){
        t.error.set(err);
        setTimeout(function(){
          t.error.set(false);
        }, 5000)
      } else {
        t.success.set(true);
        setTimeout(function(){
          t.success.set(false);
        }, 5000);
      }
    });
  }
});

function removeSkill(e, t){
  var skills = t.skills.get();
  var idx = e.target.getAttribute('data-index');
  skills.splice(idx, 1);
  t.skills.set(skills);
}

function addSkill(e, t){
  var $skillsInput = $("input[name='skills']");
  var skills = t.skills.get();
  if (skills.indexOf($skillsInput.val().toLowerCase()) < 0){
    skills.push($skillsInput.val().toLowerCase());
    t.skills.set(skills);
  }
  $skillsInput.val("");
}