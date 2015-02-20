// Title Notification
var intervalId;
var timeoutId;
Tracker.autorun(function(){
  clearInterval(intervalId);

  setDocumentTitle(Q_NAME);

  if (authorized.mentor()){
    var activeCount = Tickets.find({
      status: 'OPEN'
    }).count();
    setDocumentTitle("\u0020(" + activeCount + ") " + Q_NAME);
  }

  if (authorized.user()){
    var claimedTicket = Tickets.findOne({
      userId: Meteor.userId(),
      status: 'CLAIMED'
    });
    if (claimedTicket){
      intervalId = setInterval(function(){
        setDocumentTitle("\u0020(\u2713) " + Q_NAME);
        timeoutId = setTimeout(function(){
          setDocumentTitle(claimedTicket.claimName + " claimed your ticket!");
        },1500)
      },3000);
    }
  }
});

function setDocumentTitle(text){
  document.title = text;
}
