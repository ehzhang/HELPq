Meteor.addLCSLogin = function(config){
  Meteor.methods({
    LCSLoginCheck: function(username, password){
      check(username, String);
      check(password, String);

      // TODO remove all these log statements after debugging is done
      console.log(Meteor.users.findOne({username:username}))
      if(!Meteor.users.findOne({username:username})){
	
	console.log(_settings());
	console.log("url",config.authURL);
	console.log(username,password);
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
	console.log(token);
	// TODO update roles if marked as mentor in lcs
	Accounts.createUser({
	  username: username,
	  password: password,
	  profile:{}
	});
      }
      return true;
    }
  });
}
