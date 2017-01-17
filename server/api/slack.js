/**
 * This is a file with some helpers to integrate with Slack's slash commands.
 *
 * Please see the README for more information on how to get this working.
 */

/**
 * GET /ticket
 *
 * Accepts a GET request from Slack in order to manage tickets.
 */
WebApp.connectHandlers.use("/ticket", function(req, res, next) {
  var responseMsg = "";

  if (!_slackSettings().slackEnabled) {
    responseMsg = "Page not found.";
    return respondToRequest(res, 404, responseMsg);
  }

  // Verify token sent from Slack is correct before proceeding.
  var token = req.query.token;
  if (token !== _slackSettings().token) {
    responseMsg = "Incorrect token provided.";
    return respondToRequest(res, 401, responseMsg);
  }

  // We need a username to proceed. This should never happen!
  var name = req.query.user_name;
  if (name === undefined) {
    responseMsg = "Username not provided. If you're seeing this message, please contact an admin!";
    _log("WARNING: Username was not provided via the Slack webhook.");
    return respondToRequest(res, 400, responseMsg);
  }

  // See if the user already has a ticket open.
  var openTicket = getOpenTicketGivenName(name);

  // Determine the command.
  var text = req.query.text;

  // Match on creation first...
  if (text.match(/(^create)(.*)/)) {
    // Check if user has an open ticket.
    if (openTicket) {
      responseMsg = "You already have a ticket open! Please close it before creating another one.";
      return respondToRequest(res, 400, responseMsg);
    }

    // Strip out create to get the topic. Check if it's empty.
    var topic = text.replace("create ", "");
    if (topic === "") {
      responseMsg = "Please provide a topic for your ticket!";
      return respondToRequest(res, 400, responseMsg);
    }

    // !! Don't change these !!
    // Currently how we check for Slack created tickets.
    var contact = "On Slack: " + name;
    var location = "Slack created.";

    // Attempt to create the ticket. Check if it was successfully created.
    var ticket = _createTicket(name, topic, location, contact);
    if (ticket === false) {
      return respondWithServerError(res);
    }

    var responseMsg = "Your ticket was created! We'll let you know when the status has been updated.";
    return respondToRequest(res, 200, responseMsg);
  }

  // Then, match on literal command.
  switch(text) {
    case 'get':
      // Check for an open ticket.
      if (!openTicket) {
        responseMsg = "You do not currently have a ticket open! Please create one first.";
        return respondToRequest(res, 400, responseMsg);
      }

      responseMsg = "Hi " + name + "! Your ticket with the topic \"" + openTicket.topic + "\" is currently " + openTicket.status + ".";
      return respondToRequest(res, 200, responseMsg);
    case 'cancel':
      // Check for an open ticket.
      if (!openTicket) {
        responseMsg = "You do not currently have a ticket open! Please create one first.";
        return respondToRequest(res, 400, responseMsg);
      }

      // Attempt to cancel the ticket. Check if it was successfully cancelled.
      status = _cancelTicket(openTicket);
      if (!status) {
        return respondWithServerError(res);
      }

      responseMsg = "Your ticket has been successfully cancelled.";
      return respondToRequest(res, 200, responseMsg);
    default:
      // Check for an open ticket.
      if (!openTicket) {
        responseMsg = "You do not currently have a ticket open! Please create one using `/ticket create <topic>`.";
        return respondToRequest(res, 200, responseMsg);
      } else {
        responseMsg = "Hi " + name + "! Your ticket with the topic \"" + openTicket.topic + "\" is currently " + openTicket.status + ". Please use `/ticket cancel` to cancel it.";
        return respondToRequest(res, 200, responseMsg);
      }
  }
});

/**
 * Responds with a server error.
 *
 * @param HTTPResponse res The response object.
 * @return HTTPResponse The response object.
 */
function respondWithServerError(res) {
  var responseMsg = "Oops, there was an error! Please try again. If error persists, please contact an admin."
  return respondToRequest(res, 500, responseMsg);
}

/**
 * Responds to Slack given a status and message.
 *
 * @param HTTPResponse res The response object.
 * @param Integer status The HTTP status code to send back to the client.
 * @param String responseMsg The message to send back to the client.
 * @return HTTPResponse The response object.
 */
function respondToRequest(res, status, responseMsg) {
  res.writeHead(status);
  return res.end(responseMsg);
}

/**
 * Fetches the open ticket given a name, if one exists.
 *
 * @param String name The name of the requestor.
 * @return Ticket|undefined The open ticket given a name.
 */
function getOpenTicketGivenName(name) {
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
