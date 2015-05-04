var Q_NAME = window["CONSTANTS"]["Q_NAME"];

// Title Notification
var intervalId;
var timeoutId;
Tracker.autorun(function(){

  clearInterval(intervalId);
  setDocumentTitle(Q_NAME);

  if (authorized.user()){
    var claimedTicket = Tickets.findOne({
      userId: Meteor.userId(),
      status: 'CLAIMED'
    });
    if (claimedTicket){
      var message = claimedTicket.claimName + " claimed your ticket!";

      // Desktop Notification
      notifyDesktop(message);

      intervalId = setInterval(function(){
        setDocumentTitle("(\u2713) " + Q_NAME);
        timeoutId = setTimeout(function(){
          setDocumentTitle(message);
        },1500)
      },3000);
    } else {
      setDocumentTitle(Q_NAME);
    }
  }

});

Tracker.autorun(function(){
  if (authorized.mentor()){
    var activeCount = Tickets.find({
      status: 'OPEN'
    }).count();
    setDocumentTitle("(" + activeCount + ") " + Q_NAME);
  }
});

function setDocumentTitle(text){
  document.title = text;
}


// Desktop Notifications
Tracker.autorun(function(){
  if (authorized.user()){
    // Check to see if the browser supports Notifications
    if (window["Notification"]){
      // Request permission
      Notification.requestPermission();
    }
  }
});

function notifyDesktop(body){
  if (window["Notification"]){
    if (Notification.permission == "granted"){
      var notification = new Notification(Q_NAME, {
        icon: CONSTANTS.NOTIFICATION_ICON,
        body: body
      });
    }
  }
}
