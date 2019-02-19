Template.login.onCreated(function(){
  this.error = new ReactiveVar();
  this.loading = new ReactiveVar();
});

Template.login.events({
  'click #login-github': function(){
    Meteor.loginWithGithub({
      loginStyle: 'redirect'
    });
  },
  'click #login-facebook': function(){
    Meteor.loginWithFacebook({
      loginStyle: 'redirect'
    });
  },
  'click #login-password': function(e, t){
    t.loading.set(true);
    loginPassword(t);
  },
  'keyup #password': function(e, t){
    if (e.keyCode === 13){
      loginPassword(t);
    }
  }
});

Template.login.helpers({
  enabled: function(){
    var services = {};
    ServiceConfiguration.configurations
        .find({})
        .fetch()
        .forEach(function(service){
          services[service.service] = true;
        });
    return services;
  },
  error: function(){
    return Template.instance().error.get();
  },
  loading: function(){
    return Template.instance().loading.get();
  }
});

Template.login.rendered = function(){
  $(this.findAll('.container')).addClass('animated fadeIn');
};

function loginPassword(t){
  const username=$(t.findAll('#username')).val().trim();
  const password=$(t.findAll('#password')).val();
  function loginCallback(callbackError, existsInLCS){
    if(existsInLCS){
      Meteor.loginWithPassword(
	username,
	password,
	  function(error){
          if (error){
            $(t.findAll('#password')).val("");
            t.error.set(error.reason);
          }
          if (Meteor.user().profile.mentor){
              console.log("MENTOR!");
              window.location.replace("/mentor");
          }
	})
    }else{
      t.loading.set(false);
      t.error.set("Bad username or password");
    }
  }
  Meteor.call('LCSLoginCheck',username, password, loginCallback);
}
