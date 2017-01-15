/**
 * START API METHODS.
 */

/**
 * GET /getTicket
 *
 * Fetches a user's ticket given an API Key and a name.
 */
 WebApp.connectHandlers.use("/getTicket", function(req, res, next) {
  // Let's grab the API Key from the settings.
  // @TODO: Figure out why I can't load it from _settings().
  // This is an awful way to load an apiKey. Too much disk reads; need to throw it in memory.
  var apiKey = JSON.parse(Assets.getText('config.json')).settings.apiKey;

  // We're going to be returning JSON.
  res.setHeader('Content-Type', 'application/json');
  var response_obj = {
  };

  // Check if the API Key is correct.
  if (req.query.apiKey !== apiKey) {
    res.writeHead(401);
    response_obj.error = "incorrect_api_key";
    response_obj.msg = "Incorrect API key.";
    res.end(JSON.stringify(response_obj));
    return;
  }

  // We need a name to proceed.
  var name = req.query.name;
  if (name === undefined) {
    res.writeHead(400);
    response_obj.error = "missing_param";
    response_obj.msg = "Missing name.";
    res.end(JSON.stringify(response_obj));
    return;
  }

  // Fetch ticket given a name.
  ticket = getOpenTicketGivenName(name);
  if (ticket === undefined) {
    res.writeHead(404);
    response_obj.error = "no_ticket";
    response_obj.msg = "User does not have an open ticket.";
    res.end(JSON.stringify(response_obj));
    return;
  }

  // We want to hide the _id for reasons.
  delete ticket._id;

  // Return the ticket.
  response_obj.ticket = ticket;
  response_obj.msg = "Ticket found!";
  res.writeHead(200);
  res.end(JSON.stringify(response_obj));
});

/**
 * GET /createTicket
 *
 * Creates a ticket given an API key, a name, and a topic.
 *
 */
WebApp.connectHandlers.use("/createTicket", function(req, res, next) {
  // Let's grab the API Key from the settings.
  // @TODO: Figure out why I can't load it from _settings().
  // This is an awful way to load an apiKey. Too much disk reads; need to throw it in memory.
  var apiKey = JSON.parse(Assets.getText('config.json')).settings.apiKey;

  // We're going to be returning JSON.
  res.setHeader('Content-Type', 'application/json');
  var response_obj = {
    created: false
  };

  // Check if the API Key is correct.
  if (req.query.apiKey !== apiKey) {
    res.writeHead(401);
    response_obj.error = "incorrect_api_key";
    response_obj.msg = "Incorrect API key.";
    res.end(JSON.stringify(response_obj));
    return;
  }

  var name = req.query.name;
  var topic = req.query.topic;

  // We need a name and a topic to proceed.
  if (name === undefined || topic === undefined) {
    res.writeHead(400);
    response_obj.error = "missing_param";
    response_obj.msg = "Missing name or topic.";
    res.end(JSON.stringify(response_obj));
    return;
  }

  // If the user already has a ticket open, let them know.
  if (doesGivenNameHaveTicketOpen(name)) {
    res.writeHead(400);
    response_obj.error = "open_ticket";
    response_obj.msg = "User already has a ticket open.";
    res.end(JSON.stringify(response_obj));
    return;
  }

  // Verify ticket was created successfully!
  if (createTicketGivenNameAndTopic(name, topic) === undefined) {
    res.writeHead(500);
    response_obj.error = "server_error";
    response_obj.msg = "There was an error. Please let an admin know!";
    res.end(JSON.stringify(response_obj));
    return;
  }


  // Return 200 OK!
  response_obj.created = true;
  response_obj.msg = "Ticket created!";
  res.writeHead(200);
  res.end(JSON.stringify(response_obj));
});

/**
 * GET /deleteTicket
 *
 * Deletes a user's ticket given an API key and a name.
 */
 WebApp.connectHandlers.use("/deleteTicket", function(req, res, next) {
  // Let's grab the API Key from the settings.
  // @TODO: Figure out why I can't load it from _settings().
  // This is an awful way to load an apiKey. Too much disk reads; need to throw it in memory.
  var apiKey = JSON.parse(Assets.getText('config.json')).settings.apiKey;

  // We're going to be returning JSON.
  res.setHeader('Content-Type', 'application/json');
  var response_obj = {
    deleted: false
  };

  // Check if the API Key is correct.
  if (req.query.apiKey !== apiKey) {
    res.writeHead(401);
    response_obj.error = "incorrect_api_key";
    response_obj.msg = "Incorrect API key.";
    res.end(JSON.stringify(response_obj));
    return;
  }

  // We need a name to proceed.
  var name = req.query.name;
  if (name === undefined) {
    res.writeHead(400);
    response_obj.error = "missing_param";
    response_obj.msg = "Missing name.";
    res.end(JSON.stringify(response_obj));
    return;
  }

  // Fetch ticket given a name.
  ticket = getOpenTicketGivenName(name);
  if (ticket === undefined) {
    res.writeHead(404);
    response_obj.error = "no_ticket";
    response_obj.msg = "User does not have an open ticket.";
    res.end(JSON.stringify(response_obj));
    return;
  }

  // Delete the ticket.
  ticket_id = ticket._id;
  Tickets.remove({
    _id: ticket_id
  });

  _log("Ticket Deleted via API for " + name);

  // Return the ticket.
  response_obj.deleted = true;
  response_obj.msg = "Ticket deleted!";
  res.writeHead(200);
  res.end(JSON.stringify(response_obj));
});

/**
 * START HELPERS
 */

/**
 * Creates a ticket on the behalf of a user from the API.
 *
 * @param String name The name of the requestor.
 * @param String topic The topic of the ticket.
 * @return String|undefined The created ticket or undefined if a ticket could not be created.
 */
function createTicketGivenNameAndTopic(name, topic){
  var contact = "On Slack: " + name;  // We're going to assume name === Slack username for now.
  var location = "Slack created.";    // We're also going to assume the ticket was Slack created.

  // Create the ticket!
  if (_settings().queueEnabled) {
    var ticket = Tickets.insert({
      userId: null,
      name: name,
      topic: topic,
      location: location,
      contact: contact,
      timestamp: Date.now(),
      status: "OPEN",
      expiresAt: _settings().expirationDelay > 0 ? Date.now() + _settings().expirationDelay : Infinity,
      rating: null
    });

    _log("Ticket Created via API for " + name);

      // Slack webhook, yo.
    var payload = {
      "attachments": [
        {
          "fallback": "New ticket from @" + name + ": " + topic,
          "pretext": "New ticket created via Slack",
          "title": "Help requested by @" + name,
          "text": topic,
          "title_link": Meteor.absoluteUrl() + "mentor",
          "color": "#3C6EB6"
        }
      ],
      "username": "HELPqbot",
      "icon_emoji": ":raising_hand:"
    };

    var slackWebhookUrl = JSON.parse(Assets.getText('config.json')).settings.slackWebhookUrl;
    Meteor.http.call("POST", slackWebhookUrl, { data: payload });

    return ticket;
  }

  return undefined;
}

/**
 * Fetches the open ticket given a name, if one exists.
 *
 * @param String name The name of the requestor.
 * @return Ticket|undefined The open ticket given a name.
 */
function getOpenTicketGivenName(name){
  tickets = Tickets.find({
    status: {
      $in: ["OPEN", "CLAIMED"]
    },
    name: name
  }).fetch();

  if (tickets.length === 0) {
    return;
  }

  return tickets[0];
}

/**
 * Does the given name have an open ticket?
 *
 * @param String name The name of the requestor.
 * @return Boolean Does the given name have an open ticket?
 */
function doesGivenNameHaveTicketOpen(name){
  return getOpenTicketGivenName(name) !== undefined;
}
