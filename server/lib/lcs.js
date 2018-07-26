// parameterized login function to be initialized from setup.js
// with the config
Meteor.addLCSLogin = function(config){
  Meteor.methods({
    LCSLoginCheck: function(username, password){
      check(username, String);
      check(password, String);

      if(!Meteor.users.findOne({username:username})){
	const LCSResponse = HTTP.call('POST', config.authURL, {
	  data: {
	    email: username,
	    password: password
	  }
	});
	if(LCSResponse.data.statusCode !== 200){
	  return false;
	}
	const responseBody = LCSResponse.data.body;
	const token = JSON.parse(responseBody).auth.token;
	// TODO update roles if marked as mentor in lcs
	// TODO update user password if changed in lcs
	//it is important to add email an username because
	//if there is no email attached to a user, then when the
	//client tries to use Meteor.loginWithPassword
	//it will see that you're trying to use an email (because it has an @)
	//and it will fail because no user has that email
	Accounts.createUser({
	  username: username,
	  password: password,
	  email: username,
	  profile: {name:username}
	});
      }
      return true;
    }
  });
}
