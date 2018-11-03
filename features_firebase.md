# Features
these would be the features we would want if we would rewrite helpq

## login page
- lcs login
- get user data

## hacker view
- form to submit tickets
- retract tickets
- estimated wait
- see how many mentors are online and available with websocket/window.isFocused (wishlist) (websock)

## mentor view
- see live feed of tickets (websocket)
- claim a ticket 
- unclaim a ticket 
- complete a ticket 
- mark yourself as offline (wishlist) 

## stats/admin view
- most of what helpq provides for
- word frequency thing to see what people are asking for help with.
- how many tickets get answered
- hacker and mentor count
- promote user to mentor
- create user (local non lcs)

## new
### volunteer view
- see how many tickets are in the queue
- see all tickets
- set q status

# api
### HTTP login
- POST /login {username:"", password:""}
  + {ok: true, user: {isMentor, name: ""}, token} if login was valid
  + {ok: false, err: ""} if invalid login
  token will be given to firebase for login
### HTTP tickets
Tickets will be done through client talking to firebase
- mentees should only be able to see their ticket and only have one ticket
- mentees shouldn't be able to submit tickets to a closed queue
- mentors shoul be able to see all tickets
- mentees should not delete tickets but can mark it as resolved
- mentors can mark any ticket as resolved
### HTTP status
- GET /qstatus
/qstatus contains one document {mentorsOnline, mentorsOnShift, qOpen, avgResponseTime}

##js api
- login(username, pass): promise<{token, user: {isMentor: bool, name: ""}> throws BadLogin
- loginToken(token): promise<token, isMentor: bool> throws BadLogin
  + login in puts token in local storage
- logOut()
  + removes token from local storage

### websock
- start(token): promise<ok> opens websoc
- onNewTicket: (ticket)=>unit
- onNewQStatus: (qStatus)=>unit

### user
- newTicket(ticketData): promise<unit> throws AlreadyDone, BadTicket
- getTicket(): promise<ticket>
- retractTicket(): promise<ticket> throws NoTicket gives the retracted ticket
  + for user to potentialy update
- getQStatus(): promise<qStatus>

### mentor
- claimTicket(ticketId): promise<unit> thows AlreadyDone, NoTicket
- unClaimTicket(): promise<unit> throws NoTicket
- getTickets(alsoCompletedOnes): promise<array<ticket>>
- mentorStatus(here) tell help queue you're here or away.
  + could be hooked into window.onfocus and window.onblur
- complete(ticketId): promise<unit> throws NoTicket, AlreadyDone

### exceptions
- BadLogin
- NoTicket
- BadTicket
- AlreadyDone

### vars
- user
- token
- webSocket





