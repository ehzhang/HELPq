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
## volunteer view
- manually add mentors
- see how many tickets are in the queue


## api
### HTTP login
- POST /login {username:"", password:""}
  + {ok: true, user: {isMentor, name: ""}} if login was valid
  + {ok: false, err: ""} if invalid login
### HTTP tickets
all routes below require ?token= or will give {ok: false, err: "unauthorized"} 403
- POST /tickets ticketData
  + response with {id: "", ok: true} for new ticket
  + or with {err: "", ok: false, code: 000} if user has ticket 409 or ticket is bad 400
- DELETE /ticket
  + {ok: true}  hacker mark as retracted
  + {ok: false, err: "", code: 000} 404 if ticket doesn't exist, 410 if already retracted
- DELETE /tickets/:id
  + {ok: true} mentor mark as complete 
  + {ok: false, err: "", code: 000} 404 if ticket doesn't exist, 410 if already complete
- GET /ticket
  + responds with {ok: true, ticket: data} with users ticket
  + or {err: "", ok: false, code: 000} 404 if ticket doesn't exist
- GET /tickets [?alsocompletedones=bool]
  + {ok: true, tickets: []}
- PUT /tickets/:id?claimed=bool
  + claims a ticket 200 if successful
  + 404 if ticket doesn't exist
  + 409 if ticket already claimed
### HTTP status
- GET /qstatus
  + {ok: true, mentorsOnline: 0, hackersInQ: 0}
- PUT /mentorStatus?here=bool
  + marks mentor as here or away

### WS
- {start: token}
  + responds {ok: true} if token is invalid
- {newQStatus}
- {newTicket} only sent if mentor

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





