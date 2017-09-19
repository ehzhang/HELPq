// Startup Functions
Meteor.startup(function () {
  var fs = Meteor.npmRequire("fs");
  var path = Meteor.npmRequire("path");

  var settings_text;
  try {
    settings_text = Assets.getText('config.json');
  } catch (err) {
    console.log("Could not find 'config.json' in default location.");
    var settings_path = process.env.SETTINGS_FILE;
    console.log("Looking for it in", settings_path);

    settings_text = fs.readFileSync(settings_path);
  }
  var settings = JSON.parse(settings_text);

  // Create the admin
  createAdmin(settings.admin.username, settings.admin.password);

  // Clear Service integrations
  ServiceConfiguration.configurations.remove({});

  // Add Service Integrations
  addServiceIntegration('github', settings.github);
  addFacebookIntegration(settings.facebook);
  addServiceIntegration('google', settings.google);
  addCustomIntegration(settings.cas);

  // Add Base Settings
  setBasicSettings(settings);

  Accounts.onCreateUser(function (options, user) {
    if (options.profile) {
      user.profile = options.profile;

      if (settings.defaultMentor) {
        user.profile.mentor = true;
      }
    }

    return user;
  });

});

function createAdmin(username, password) {
  var user = Meteor.users.findOne({
    username: username
  });

  if (!user) {
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
  }, {
    $set: {
      'profile.admin': true
    }
  });
}

function addServiceIntegration(service, config) {
  if (config.enable) {
    ServiceConfiguration.configurations.upsert({
      service: service
    }, {
      $set: {
        clientId: config.clientId,
        secret: config.secret
      }
    });
  }
}

function addCustomIntegration(cas) {
  if (cas.enable) {
    ServiceConfiguration.configurations.upsert({
      service: 'cas'
    }, {
      $set: {
        data: cas
      }
    });
    Meteor.settings.public.cas = cas.public.cas;
    Meteor.settings.cas = cas.cas;
  }
}

function addFacebookIntegration(fb) {
  if (fb.enable) {
    ServiceConfiguration.configurations.upsert({
      service: 'facebook'
    }, {
      $set: {
        appId: fb.appId,
        secret: fb.secret
      }
    });
  }
}

function setBasicSettings(config) {
  // Check if the settings document already exists
  var settings = Settings.find({}).fetch();
  if (settings.length == 0 || settings.length > 1) {
    // Remove all documents and then create the singular settings document.
    Settings.remove({});
    Settings.insert(config.settings);
  }
}
