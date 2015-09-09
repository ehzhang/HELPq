// ---------------------------------------
// Publish Data
// ---------------------------------------

Meteor.publish("userData", getUserData);
Meteor.publish("allUsers", getAllUsers);
Meteor.publish("allMentors", getAllMentors);
Meteor.publish("mentorsOnline", getMentorsOnline);

Meteor.publish("activeTickets", getActiveTickets);
Meteor.publish("allTickets", getAllTickets);
Meteor.publish("ticketData", getTicketData);
Meteor.publish("userTickets", getUserTickets);

Meteor.publish("allAnnouncements", getAllAnnouncements);

Meteor.publish("settings", getSettings);

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

// Get all users
function getAllUsers(){
  if (authorized.admin(this.userId)) {
    return Meteor.users.find({},
        {
          fields: {
            'createdAt': 1,
            'username': 1,
            'services': 1,
            'profile': 1
          }
        });
  }
}

// Mentors are able to see each other.
function getAllMentors(){
  if (authorized.mentor(this.userId)){
    return Meteor.users.find({
      'profile.mentor': true
    },{
      fields: {
        'profile.name': 1,
        'profile.mentor': 1,
        'profile.company': 1,
        'profile.skills': 1,
        'services.facebook.id': 1
      }
    });
  }
}

// All users can see any mentor that is currently online
function getMentorsOnline(){
  if (authorized.user(this.userId)) {
    return Meteor.users.find({
      'profile.mentor': true,
      'status.online': true
    }, {
      fields: {
        'profile.name': 1,
        'profile.email': 1,
        'profile.phone': 1,
        'profile.admin': 1,
        'profile.mentor': 1,
        'profile.skills': 1,
        'status.idle': 1,
        'status.online': 1
      }
    });
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

function getTicketData(){
  if (authorized.user(this.userId)){
    return Tickets.find({},
        {
          fields: {
            timestamp: 1,
            claimId: 1,
            claimTime: 1,
            completeTime: 1,
            status: 1,
            rating: 1
          }
        });
  }
}

// Get all of the tickets
function getAllTickets(){
  if (authorized.admin(this.userId)){
    return Tickets.find({});
  } else {
    // If not admin, have limited fields
    if (authorized.user(this.userId)){
      return Tickets.find({},
          {
            fields: {
              timestamp: 1,
              claimId: 1,
              claimTime: 1,
              completeTime: 1,
              status: 1,
              rating: 1
            }
          });
    }
  }
}

// Get the tickets for the current user
function getUserTickets(){
  if (authorized.user(this.userId)){
    return Tickets.find({
      userId: this.userId
    });
  }
}

// Get all of the announcements
function getAllAnnouncements(){
  if (authorized.user(this.userId)){
    return Announcements.find({});
  }
}

function getSettings(){
  if (authorized.user(this.userId)){
    return Settings.find({});
  }
}