// -----------------------
// UI Helpers
// -----------------------

// Get a constant from the constants.js
UI.registerHelper('constant', function(variable){
  return window["CONSTANTS"][variable];
});

// -----------------------
// Handlebars Helpers
// -----------------------

// Check if a user is a certain role
UI.registerHelper('userIs', function(role){
  return authorized[role]();
});

UI.registerHelper('isEqual', function(a, b){
  return a === b;
});

UI.registerHelper('getExpirationDelay', function(){
  return Settings.findOne().expirationDelay;
});