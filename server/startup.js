// Startup Functions
Meteor.startup(function(){
  // Grab the config
  var config = JSON.parse(Assets.getText('config.json'));

  if (process.env.ADMIN_PASSWORD) {
    config.admin.password = process.env.ADMIN_PASSWORD
  }
  if ((process.env.GITHUB == 'true') && process.env.GITHUB_CLIENTID && process.env.GITHUB_SECRET){
    config.github = {
      'enable': true,
      'clientId': process.env.GITHUB_CLIENTID,
      'secret': process.env.GITHUB_SECRET
    }
  }
  if ((process.env.FACEBOOK == 'true') && process.env.FACEBOOK_APPID && process.env.FACEBOOK_SECRET){
    config.facebook = {
      'enable': true,
      'appId': process.env.FACEBOOK_APPID,
      'secret': process.env.FACEBOOK_SECRET
    }
  }
  if ((process.env.GOOGLE == 'true') && process.env.GOOGLE_CLIENTID && process.env.GOOGLE_SECRET){
    config.github = {
      'enable': true,
      'clientId': process.env.GOOGLE_CLIENTID,
      'secret': process.env.GOOGLE_SECRET
    }
  }


  // Create the admin
  createAdmin(config.admin.username, config.admin.password);

  // Clear Service integrations
  ServiceConfiguration.configurations.remove({});

  // Add Service Integrations
  addServiceIntegration('github', config.github);
  addFacebookIntegration(config.facebook);
  addServiceIntegration('google', config.google);

  // Add Base Settings
  setBasicSettings(config);

  Accounts.onCreateUser(function(options, user){
    if (options.profile){
      user.profile = options.profile;

      if (config.defaultMentor){
        user.profile.mentor = true;
      }
    }

    return user;
  });

});

function createAdmin(username, password){
  var user = Meteor.users.findOne({
    username: username
  });

  if (!user){
    Accounts.createUser({
      username: username,
      password: password,
      profile: {
        name: 'Admin'
      }
    });
  }

  Meteor.users.update({
    username: username
  },{
    $set:
      {
        'profile.admin': true
      }
  })
}

function addServiceIntegration(service, config){
  if (config.enable){
    ServiceConfiguration.configurations.upsert({
      service: service
    },{
      $set: {
        clientId: config.clientId,
        secret: config.secret
      }
    });
  }
}

function addFacebookIntegration(fb){
  if (fb.enable){
    ServiceConfiguration.configurations.upsert({
      service: 'facebook'
    },{
      $set: {
        appId: fb.appId,
        secret: fb.secret
      }
    });
  }
}

function setBasicSettings(config){
  // Check if the settings document already exists
  var settings = Settings.find({}).fetch();
  if (settings.length == 0 || settings.length > 1){
    // Remove all documents and then create the singular settings document.
    Settings.remove({});
    Settings.insert(config.settings);
  }
}
