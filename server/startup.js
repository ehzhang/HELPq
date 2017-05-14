// Startup Functions
Meteor.startup(function(){
  // Grab the config
  var config = {};
  var configJson;
  try {
    configJson = Assets.getText('config.json');
  } catch (err) {
    // file doesn't exist, but that's okay
  }
  if (configJson) {
    config = JSON.parse(configJson);
  }

  // environment variables override config file
  var configTemplate = JSON.parse(Assets.getText('config.json.template'));
  var envConfigs = readConfigsFromEnv(configTemplate);
  overlay(config, envConfigs);

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
    user = Accounts.createUser({
      username: username,
      password: password,
      profile: {
        name: 'Admin'
      }
    });
  }

  Accounts.setPassword(user, password);

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

// reads configuration overrides from environment variables according to a
// template object
//
// name are mapped to environment variables like
// 'foo.bar.bazQuux' -> 'FOO_BAR_BAZ_QUUX'
function readConfigsFromEnv(template) {
  function rec(template, pathElems) {
    var config = {};
    for (var key in template) {
      if (!template.hasOwnProperty(key)) {
        continue;
      }
      var value = template[key];
      var upperCased = key.replace(
        /([A-Z])/g,
        function(c) { return '_' + c.toLowerCase(); }
      ).toUpperCase();
      var elems = pathElems.concat([upperCased]);
      var envName = elems.join('_');
      switch (typeof value) {
        case 'object':
          config[key] = rec(value, elems);
          break;
        case 'string':
          if (typeof process.env[envName] !== 'undefined') {
            config[key] = process.env[envName];
          }
          break;
        case 'boolean':
          var parsedBool = parseBool(process.env[envName]);
          if (parsedBool !== null) {
            config[key] = parsedBool;
          }
          break;
        case 'number':
          var parsedInt = parseInt(process.env[envName]);
          if (!isNaN(parsedInt)) {
            config[key] = parsedInt;
          }
          break;
        default:
          throw 'unsupported type: ' + (typeof value);
      }
    }
    return config;
  }
  function parseBool(str) {
    if (str) {
      if (!isNaN(str)) {
        // numeric string
        return +str > 0;
      } else {
        return /^t/i.test(str) || /^y/i.test(str); // accepts things like 'True' and "yes"
      }
    } else {
      return null;
    }
  }
  return rec(template, []);
}

// updates a base object using the values in an overlay object, leaving all
// other values in the base object intact
function overlay(base, object) {
  for (var key in object) {
    if (!object.hasOwnProperty(key)) {
      continue;
    }
    if (typeof object[key] === 'object' && typeof base[key] === 'object') {
      overlay(base[key], object[key]);
    } else {
      base[key] = object[key];
    }
  }
}
