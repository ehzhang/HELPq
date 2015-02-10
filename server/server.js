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
 *     status: STRING [OPEN, CLAIMED, COMPLETE],
 *     claimId: STRING
 *     claimName: STRING
 *  }
 *
 */
Tickets = new Meteor.Collection('tickets');

// ----------------------------------------
// Basic Roles
// ----------------------------------------

var authorized = {
  user: function(){
    return Meteor.user() ? true : false;
  },
  admin: function(){
    return Meteor.user().profile.admin
  },
  mentor: function(){
    return Meteor.user().profile.mentor
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

// ---------------------------------------
// Meteor Methods
// ---------------------------------------

Meteor.methods({
  createTicket: createTicket,
  claimTicket: claimTicket,
  completeTicket: completeTicket
});

function createTicket(topic, location, contact) {
  // Must be logged in
  if (authorized.user()) {
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
      name: user.profile.name,
      topic: topic,
      location: location,
      contact: contact,
      timestamp: Date.now(),
      status: "OPEN"
    });

    console.log("[", new Date().toLocaleString(), "]", "Ticket Created:", user.profile.name, topic, location);
  }
}

function claimTicket(id){
  // Mentor only
  if (authorized.mentor()){
    var user = _getUser(id);
    Tickets.update({
      _id: id
    },{
      $set: {
        status: "CLAIMED",
        claimId: user._id,
        claimName: user.profile.name
      }
    });

    console.log("[", new Date().toLocaleString(), "]", "Ticket Claimed by", user.profile.name);
    return true;
  }

}

function completeTicket(id){
  // Mentor only
  if (authorized.mentor()){
    var user = _getUser(id);
    Tickets.update({
      _id: id
    },{
      $set: {
        status: "COMPLETE",
        claimId: user._id,
        claimName: user.profile.name
      }
    });

    console.log("[", new Date().toLocaleString(), "]", "Ticket Completed by", user.profile.name);
    return true;
  }
}

// ---------------------------------------
// Publish Data
// ---------------------------------------

Meteor.publish("userData", getUserData);
Meteor.publish("allActiveTickets", getActiveTickets);
Meteor.publish("allTickets", getAllTickets);

// Get user data on yourself
function getUserData(){
  if (this.userId) {
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
  if (this.userId) {
    return Tickets.find({'active': true},
        {
          sort: {
            date: 1
          },

          fields: {
            'services': 1,
            'profile': 1
          }
        }
    )
  } else {
    this.ready();
  }
}

function getAllTickets(){
  if (this.userId){
    return Tickets.find({});
  }
}

// ---------------------------------------
// Helper Functions
// ---------------------------------------

function _getUser(id){
  return Meteor.users.findOne({_id: id});
}
