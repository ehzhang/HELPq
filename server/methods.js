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
  rateTicket: rateTicket,
  expireTicket: expireTicket,

  createAnnouncement: createAnnouncement,
  deleteAnnouncement: deleteAnnouncement,

  toggleRole: toggleRole,
  updateUser: updateUser,
  createAccount: createAccount,

  setSetting : setSetting
});

function createTicket(topic, location, contact) {
  // Must be logged in and queue must be open
  if (authorized.user(this.userId) && _settings().queueEnabled) {
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
      status: "OPEN",
      expiresAt: _settings().expirationDelay > 0 ? Date.now() + _settings().expirationDelay : Infinity,
      rating: null
    });

    _log("Ticket Created by " + this.userId);
  }
}

function claimTicket(id){

  // You can't complete your own ticket!
  var ticket = Tickets.findOne({_id: id});
  if (ticket.userId == this.userId) return;

  // Mentor Only
  if (authorized.mentor(this.userId)){
    var user = _getUser(this.userId);
    // Mentors can only claim one ticket at a time.
    var currentClaim = Tickets.find({
      status: "CLAIMED",
      claimId: this.userId
    }).fetch();

    if (currentClaim.length === 0){
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
  }
  return false;
}

function completeTicket(id){
  // You can't complete your own ticket!
  var ticket = Tickets.findOne({_id: id});
  if (ticket.userId == this.userId) return;

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
        expiresAt: _settings().expirationDelay > 0 ? Date.now() + _settings().expirationDelay : Infinity,
        claimId: null,
        claimName: null
      }
    });
    _log("Ticket Reopened: " + id);
    return true;
  }
  return false;
}

function rateTicket(id, rating, comments){
  // Ticket owner only
  var ticket = Tickets.findOne({_id: id});

  // Limit rating between 1 and 5
  var score = Math.max(Math.min(rating, 5), 1);

  if(ticket.userId === this.userId){
    Tickets.update({
      _id: id
    }, {
      $set: {
        rating: score,
        comments: comments
      }
    });
    _log("Ticket " + id + ", Rating: " + rating);
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

function expireTicket(id){
  var ticket = Tickets.findOne({_id: id, status: 'OPEN'});

  if (ticket && ticket.userId == this.userId && ticket.expiresAt < Date.now()){
    Tickets.update({
      _id: id
    }, {
      $set: {
        status: "EXPIRED"
      }
    });
    _log("Ticket Expired " + this.userId);
  }
}

function createAnnouncement(header, content, type){
  if (authorized.admin(this.userId)){
    var user = _getUser(this.userId);
    Announcements.insert({
      userId: user._id,
      name: _getUserName(user),
      timestamp: Date.now(),
      header: header,
      content: content,
      type: type
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
// Name, Email. Phone, Skills, Company
function updateUser(id, profile){
  var user = _getUser(id);

  if (authorized.admin(this.userId) || user._id === this.userId){
    var validFields = [
      'name',
      'email',
      'phone',
      'company'
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
  // TODO: validate username, password
  check(username, String);
  check(password, String);

  if (authorized.admin(this.userId)){
    return Accounts.createUser({
      username: username,
      password: password,
      profile: profile ? profile : {}
    });
  }
  return false;
}

function setSetting(setting, value){
  if (authorized.admin(this.userId)){
    var toSet = {};
    toSet[setting] = value;
    Settings.update({}, {$set: toSet});
  }
}