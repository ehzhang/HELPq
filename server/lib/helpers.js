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

_slackSettings = function(){
  return SlackSettings.findOne({});
};

_log = function(message){
  console.log("[", new Date().toLocaleString(), "]", message);
};

/**
 * Creates a ticket and sends a webhook to Slack.
 *
 * @param String name The name to assign to the ticket.
 * @param String topic The topic of the ticket.
 * @param String location The location of the user.
 * @param String contact How to contact the user.
 * @param String|undefined userId The ID of the user.
 * @return Ticket|Boolean The newly created ticket (or false if ticket was unable to be created.)
 */
_createTicket = function(name, topic, location, contact, userId){
  if (!_settings().queueEnabled) {
    return false;
  }

  // Check if the topic is empty.
  if (topic === "") {
    return false;
  }

  // Set default value for userId.
  userId = (typeof userId !== 'undefined') ? userId : 'Slack';

  var ticket = Tickets.insert({
    userId: userId,
    name: name,
    topic: topic,
    location: location,
    contact: contact,
    timestamp: Date.now(),
    status: "OPEN",
    expiresAt: _settings().expirationDelay > 0 ? Date.now() + _settings().expirationDelay : Infinity,
    rating: null
  });

  if (!ticket) {
    return false;
  }

  _log("Ticket Created by " + name);

  if (_slackSettings().slackEnabled) {
    // Slack payload...
    var payload = {
      "attachments": [
        {
          "fallback": "New ticket from " + name + ": " + topic,
          "pretext": "New ticket created!",
          "title": "Help requested by " + name,
          "title_link": Meteor.absoluteUrl() + "mentor",
          "fields": [
            {
              "title": "Topic",
              "value": topic,
              "short": false,
            },
            {
              "title": "Location",
              "value": location,
              "short": true
            },
            {
              "title": "Contact",
              "value": contact,
              "short": true
            }
          ],
          "color": "#3C6EB6"
        }
      ]
    };

    _sendWebhookToSlack(payload);
  }

  return ticket;
};

/**
 * Cancels a ticket and sends a webhook to Slack.
 *
 * @param Ticket ticket The ticket to cancel.
 * @return Boolean Whether the ticket was deleted or not. This currently only returns true.
 */
_cancelTicket = function(ticket){
  Tickets.update({
    _id: ticket._id
  },{
    $set: {
      status: "CANCELLED"
    }
  });

  _log("Ticket Cancelled by " + ticket.name);

  if (_slackSettings().slackEnabled) {
    // Slack webhook, yo.
    var payload = {
      "attachments": [
        {
          "fallback": "Ticket cancelled by " + ticket.name,
          "pretext": "Ticket cancelled.",
          "title": "Ticket cancelled by " + ticket.name,
          "color": "#F15340"
        }
      ]
    };

    _sendWebhookToSlack(payload);
  }

  return true;
}

/**
 * Sends a webhook to Slack as the HELPqbot.
 *
 * IMPORTANT: So we don't hit the DB twice, there is no check if Slack is enabled.
 *            Please check whether Slack is enabled before using this function.
 *            It WILL throw an error if your Slack settings are not configured.
 *
 * @param Object payload The payload to send to Slack.
 * @return ???
 */
_sendWebhookToSlack = function(payload){
  payload.username = "HELPqbot";
  payload.icon_emoji = ":raising_hand:";
  return Meteor.http.call("POST", _slackSettings().slackWebhookUrl, { data: payload });
};
