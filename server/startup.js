// Startup Functions
Meteor.startup(function(){
  // Grab the config
  var config = JSON.parse(Assets.getText('config.json'));

  // Create the admin
  createAdmin(config.admin.username, config.admin.password);


  // Add Service Integrations
  addServiceIntegration('github', config.github.clientId, config.github.clientId);
  //addServiceIntegration('facebook', config.facebook.clientId, config.facebook.secret);
  //addServiceIntegration('google', config.google.clientId, config.google.secret);

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

function addServiceIntegration(service, clientId, secret){
  ServiceConfiguration.configurations.upsert({
    service: service
  },{
    $set: {
      clientId: clientId,
      secret: secret
    }
  });
}