// ---------------------------------------
// Helper Functions
// ---------------------------------------

_getUser = function(id){
  return Meteor.users.findOne({_id: id});
};

_getUserName = function(user){
  if (user.profile.name){
    return user.profile.name;
  }

  if (user.services.github.username){
    return user.services.github.username;
  }
  return "Anonymous";
};

_settings = function(){
  return Settings.findOne({});
};

_log = function(message){
  console.log("[", new Date().toLocaleString(), "]", message);
};