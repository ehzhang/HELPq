// parameterized login function to be initialized from setup.js
// with the config
Meteor.addLCSLogin = function(config){
  // sends username and password to lcs and returns a login token or null
  const getLCSToken = function(username, password){
    const LCSResponse = HTTP.call("POST", config.URL + "/authorize", {
      data: {
	email: username,
	password: password
      }
    });
    if(LCSResponse.data.statusCode !== 200){
      return null;
    }
    const responseBody = LCSResponse.data.body;
    return JSON.parse(responseBody).auth.token;
  }

  // takes an email and a token an returns a users data from lcs
  const LCSData = function(email, token){
    const response = HTTP.call("POST", config.URL + "/read", {
      data: {
	email: email,
	token: token,
	//looking for a user document with our email will give
	//us the entire user's document
	query: {email: email}
      }
    });
    if(response.data.statusCode !== 200){
      return null;
    }
    const userData = response.data.body[0];
    return userData;
  }

  // returns true if a user is in the database or in LCS
  // if a user is in LCS but not the database they are inserted
  // if they are in both lcs and the database theire password
  // and role is updated
  const LCSLoginCheck = function(username, password){
    check(username, String);
    check(password, String);
    const LCSToken = getLCSToken(username, password)
    const userInDB = Meteor.users.findOne({username: username});

    // TODO test pasword change by mocking lcs enpoint
    if(!userInDB && !LCSToken){
      return false;
    }else if(!userInDB && LCSToken){
      //it is important to add email an username because
      //if there is no email attached to a user, then when the
      //client tries to use Meteor.loginWithPassword
      //it will see that you're trying to use an email (because it has an @)
      //and it will fail because no user has that email
      var user = LCSData(username, LCSToken);
      Accounts.createUser({
	username: username,
	password: password,
	email: username,
	profile: {
	  name: (user.first_name)? user.first_name : "anonymous",
	  username: username,
	  mentor: user.role.mentor,
          admin: user.role.director
	}
      });
    }else if(userInDB&&LCSToken){
      var user = LCSData(username, LCSToken);
      Meteor.users.update({username: username},
                          {$set: {
                            "profile.mentor": user.role.mentor,
                            "profile.admin": user.role.director
                          }},
                          {multi: false});
      Accounts.setPassword(userInDB._id, password, {logout: false});
    }
    return true;
  }

  // get rooms for the client
  const response = HTTP.call("GET", config.MISC + "/rooms.json");
  if(response.statusCode !== 200){
    console.log("error getting rooms\n", response);
    Meteor.settings.public.rooms=[];
  }else{
    Meteor.settings.public.rooms=response.data.rooms;
  }

  // give client misc endpoint
  Meteor.settings.public.MISC=config.MISC
  
  Meteor.methods({
    LCSLoginCheck: LCSLoginCheck
  });
}
