Template.login.onCreated(function () {
  this.error = new ReactiveVar();
});

Template.login.events({
  'click #login-github': function () {
    Meteor.loginWithGithub({
      loginStyle: 'redirect'
    });
  },
  'click #login-facebook': function () {
    Meteor.loginWithFacebook({
      loginStyle: 'redirect'
    });
  },
  'click #login-password': function (e, t) {
    loginPassword(t);
  },
  'click #login-cas': function (e, t) {
    loginWithCAS({
      loginStyle: 'redirect'
    })
  },
  'keyup #password': function (e, t) {
    if (e.keyCode === 13) {
      loginPassword(t);
    }
  }
});

Template.login.helpers({
  enabled: function () {
    var services = {};
    ServiceConfiguration.configurations
        .find({})
        .fetch()
        .forEach(function (service) {
          services[service.service] = true;
        });
    return services;
  },
  error: function () {
    return Template.instance().error.get();
  }
});

Template.login.rendered = function () {
  $(this.findAll('.container')).addClass('animated fadeIn');
};

function loginPassword(t) {
  Meteor.loginWithPassword(
      $(t.findAll('#username')).val(),
      $(t.findAll('#password')).val(),
      function (error) {
        if (error) {
          $(t.findAll('#password')).val("");
          t.error.set(error.reason);
        }
      }
  )
}

 function loginWithCAS (options, callback) {
  // support both (options, callback) and (callback).
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  var config = ServiceConfiguration.configurations.findOne({
    service: 'cas'
  });
  if (!config) {
    throw new ServiceConfiguration.ConfigError();
  }
  
  var credentialToken = Random.secret();
  var loginUrl = config.loginURL + "?service=" + Meteor.absoluteUrl('_cas/') + credentialToken;
  
  // TODO: add option for popup vs redirect
  // if(options.loginStyle=='popup') {
  //
  // } else if(options.longinStyle=='redirect') {
  //
  // }
  Reload._onMigrate('oauth', function () {
    return [true, {loginService: 'cas', credentialToken: credentialToken}];
  });
  Reload._migrate(null, {immediateMigration: true});
  //window.location = loginUrl;
}