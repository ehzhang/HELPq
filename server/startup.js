// Startup Functions
Meteor.startup(function(){
  // Grab the config
  var config = JSON.parse(Assets.getText('config.json'));

  // Create the admin
  createAdmin(config.admin.username, config.admin.password);

  // Clear Service integrations
  ServiceConfiguration.configurations.remove({});

  // Add Service Integrations
  addServiceIntegration('github', config.github);
  addFacebookIntegration(config.facebook);
  addServiceIntegration('google', config.google);

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
