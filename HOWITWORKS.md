# How it works
This is a more detailed documentation of how meteor works, and how
the code we added interacts with helpq, and allows integration with LCS

## Meteor
Meteor is a framework for doing both frontend and backend development
in JavaScript. The meteor server accomplishes this by two means:

### Methods
these are effectively like api requests. a client can call a method with
Meteor.call and that communicates with the server to call serverside code.
methods are added with Meteor.methods

### Collections
Meteor also gives you a conduit to directly query the MongoDB database from
the client. This is built on a websocket type interface so when you update a
collection it can push the changes out to all the clients that are watching it.
users don't have access to the whole database though. you manually configure
what users can and can't do with documents. this allows meteor to be secure and
is also why methods are needed for when a user needs someone with special
permission (like the server) to do something for them.

## LCS integration
On startup and for login, the server will contact LCS over HTTP to get user data
and to validate passwords. in server/lib/lcs.js there is a function that takes in
the config and adds all the LCS functionality to helpq. things like:
- dynamically getting the floor plan image to display to the user
  + this is so there is a single source of truth so if the floor plan changes
    we don't have to rebuild/redeploy a bunch of applications that use this
- get the names of all available locations on the map.
  + this is only updated at start time, but is done for all the reasons above
  + this can get fixed using something like fetch in the client and passing the
    client the endpoint from config
- LCS login
  + on every login helpq asks if a username and pass is valid. if it isn't it checks
    to see if the user was added manually
    + if a user was valid it changes their password/creates their account in helpq
- checking user roles in LCS
  + the first time a user logs in it will check to see if they have the mentor role
    in LCS. if they do it also gives them the appropriate role in helpq