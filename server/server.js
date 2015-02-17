// Collections
/**
 *
 * Ticket:
 *  {
 *     userId: STRING,
 *     name: STRING,
 *     imageUrl: STRING [optional]
 *     topic: STRING,
 *     location: STRING,
 *     contact: STRING,
 *     timestamp: Number (Milliseconds),
 *     status: STRING [OPEN, CLAIMED, COMPLETE, CANCELLED],
 *     claimId: STRING
 *     claimName: STRING
 *     claimTime: Number (Milliseconds)
 *     completeTime: Number (Milliseconds)
 *  }
 *
 */
Tickets = new Meteor.Collection('tickets');

/**
 * Announcement:
 *  {
 *    userId: STRING,
  *   name: STRING,
  *   header: STRING,
  *   content: STRING,
  *   timestamp: Number (Milliseconds)
 *  }
 */
Announcements = new Meteor.Collection('announcements');

// ----------------------------------------
// Basic Roles
// ----------------------------------------

// Admin have all rights
var authorized = {
  user: function(id){
    var user = _getUser(id);
    return user ? true : false;
  },
  admin: function(id){
    var user = _getUser(id);
    return user.profile.admin
  },
  mentor: function(id){
    var user = _getUser(id);
    return user.profile.admin || user.profile.mentor
  }
};

// ----------------------------------------
// Collection Permissions
// ----------------------------------------

Meteor.users.allow({
  // Update users, only if Admin
  update: function(userId, doc){
    var user = _getUser(userId);
    return user.profile.admin;
  }
});

// Currently, disable all direct modifications
Tickets.allow({
  insert: function () {
    // Don't fuck with the console, yo
    return false;
  },
  update: function () {
    // Only admin and mentors can modify tickets
    return false;
    // Enable below to allow client modifications
    //return Meteor.user().profile.admin || Meteor.user().profile.mentor;
  },
  remove: function () {
    // Only admin and mentors can remove tickets
    return false;
    // Enable below to allow client modifications
    //return Meteor.user().profile.admin || Meteor.user().profile.mentor;
  }
});

Announcements.allow({
  insert: function() {return false},
  update: function() {return false},
  remove: function() {return false}
});

// ---------------------------------------
// Meteor Methods
// ---------------------------------------

Meteor.methods({
  createTicket: createTicket,
  claimTicket: claimTicket,
  completeTicket: completeTicket,
  cancelTicket: cancelTicket,
  deleteTicket: deleteTicket,
  reopenTicket: reopenTicket,
  createAnnouncement: createAnnouncement,
  deleteAnnouncement: deleteAnnouncement,
  toggleRole: toggleRole,
  updateUser: updateUser,
  createAccount: createAccount
});

function createTicket(topic, location, contact) {
  // Must be logged in
  if (authorized.user(this.userId)) {
    // User can't have more than one
    var userActiveTickets = Tickets.find(
        {
          userId: this.userId,
          status: {
            $in: ["OPEN", "CLAIMED"]
          }
        }).fetch();

    // You can't have more than one active ticket!
    if (userActiveTickets.length > 0) return;

    var user = _getUser(this.userId);

    Tickets.insert({
      userId: user._id,
      name: _getUserName(user),
      topic: topic,
      location: location,
      contact: contact,
      timestamp: Date.now(),
      status: "OPEN"
    });

    _log("Ticket Created by " + this.userId);
  }
}

function claimTicket(id){
  // Mentor only
  if (authorized.mentor(this.userId)){
    var user = _getUser(this.userId);
    Tickets.update({
      _id: id
    },{
      $set: {
        status: "CLAIMED",
        claimId: user._id,
        claimName: _getUserName(user),
        claimTime: Date.now()
      }
    });

    _log("Ticket Claimed by " + this.userId);
    return true;
  }
  return false;
}

function completeTicket(id){
  // Mentor only
  if (authorized.mentor(this.userId)){
    var user = _getUser(this.userId);
    Tickets.update({
      _id: id
    },{
      $set: {
        status: "COMPLETE",
        claimId: user._id,
        claimName: _getUserName(user),
        completeTime: Date.now()
      }
    });

    _log("Ticket Completed by " + this.userId);
    return true;
  }
  return false;
}

function reopenTicket(id){
  // Mentor only
  if (authorized.mentor(this.userId)){
    Tickets.update({
      _id: id
    },{
      $set: {
        status: 'OPEN',
        claimId: null,
        claimName: null
      }
    });
    _log("Ticket Reopened: " + id);
    return true;
  }
  return false;
}

function cancelTicket(id){

  // Ticket owner or mentor
  var ticket = Tickets.findOne({_id: id});

  if (authorized.mentor(this.userId) || ticket.userId === this.userId){
    Tickets.update({
      _id: id
    },{
      $set: {
        status: "CANCELLED"
      }
    });
    _log("Ticket Cancelled by " + this.userId);
    console.log("[", new Date().toLocaleString(), "]", "Ticket Cancelled by");
    return true;
  }
}

function deleteTicket(id){
  // Admin only
  if (authorized.admin(this.userId)){
    Tickets.remove({
      _id: id
    });
    _log("Ticket Deleted by " + this.userId);
  }
}

function createAnnouncement(header, content){
  if (authorized.admin(this.userId)){
    var user = _getUser(this.userId);
    Announcements.insert({
      userId: user._id,
      name: _getUserName(user),
      timestamp: Date.now(),
      header: header,
      content: content
    });
    _log("Announcement created by " + this.userId);
    return true;
  }
  return false
}

function deleteAnnouncement(id){
  if (authorized.admin(this.userId)){
    Announcements.remove({
      _id: id
    });
    _log("Announcement deleted by " + this.userId);
    return true;
  }
  return false;
}

function toggleRole(role, id){
  if (authorized.admin(this.userId)){
    // can only toggle available roles
    var roles = ["admin", "mentor"];
    if (roles.indexOf(role) < 0) return;

    var user = _getUser(id);
    var setRole = {};
    setRole['profile.' + role] = !user.profile[role];

    Meteor.users.update({
      _id: id
    },{
      $set: setRole
    });
    return true;
  }
}

// Admin or user
// Editable fields:
// Name, Email. Phone, Skills
function updateUser(id, profile){
  var user = _getUser(id);

  if (authorized.admin(this.userId) || user._id === this.userId){
    var validFields = [
      'name',
      'email',
      'phone'
    ];

    // Copy the user profile
    var userProfile = user.profile;

    // Pick valid fields from the submitted changes
    validFields.forEach(function(field){
      if (_.isString(profile[field])){
        userProfile[field] = profile[field];
      }
    });

    if(_.isArray(profile['skills'])){
      userProfile['skills'] = profile['skills'];
    }

    Meteor.users.update({
      _id: id
    },{
      $set: {
        profile: userProfile
      }
    }, function(err){
      return err;
    });
  }
}

// Only admin can create user accounts
function createAccount(username, password, profile){
  if (authorized.admin(this.userId)){
    Accounts.createUser({
      username: username,
      password: password,
      profile: profile
    });
  }
}

// ---------------------------------------
// Publish Data
// ---------------------------------------

Meteor.publish("userData", getUserData);
Meteor.publish("allUsers", getAllUsers);
Meteor.publish("activeTickets", getActiveTickets);
Meteor.publish("allTickets", getAllTickets);
Meteor.publish("userTickets", getUserTickets);
Meteor.publish("allAnnouncements", getAllAnnouncements);

// Get all users
function getAllUsers(){
  if (authorized.admin(this.userId)) {
    return Meteor.users.find({},
        {
          fields: {
            'createdAt': 1,
            'services': 1,
            'profile': 1
          }
        });
  } else {
    this.ready();
  }
}

// Get user data on yourself
function getUserData(){
  if (authorized.user(this.userId)) {
    return Meteor.users.find({_id: this.userId},
        {
          fields: {
            'services': 1,
            'profile': 1
          }
        });
  } else {
    this.ready();
  }
}

// Get all of the active tickets
function getActiveTickets(){
  if (authorized.user(this.userId)) {
    return Tickets.find(
    {
      status: {
        $in: ["OPEN", "CLAIMED"]
      }
    }, {
      sort: {
        timestamp: 1
      }
    });
  } else {
    this.ready();
  }
}

// Get all of the tickets
function getAllTickets(){
  if (authorized.admin(this.userId)){
    return Tickets.find({});
  }
}

// Get the tickets for the current user
function getUserTickets(){
  if (authorized.user(this.userId)){
    return Tickets.find({
      userId: this.userId
    })
  }
}

// Get all of the announcements
function getAllAnnouncements(){
  if (authorized.user(this.userId)){
    return Announcements.find({});
  }
}

// ---------------------------------------
// Helper Functions
// ---------------------------------------

function _getUser(id){
  return Meteor.users.findOne({_id: id});
}

function _getUserName(user){
  if (user.profile.name){
    return user.profile.name;
  }

  if (user.services.github.username){
    return user.services.github.username;
  }
  return "Anonymous";
}

function _log(message){
  console.log("[", new Date().toLocaleString(), "]", message);
}
