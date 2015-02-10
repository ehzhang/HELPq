var authorize = {
  user: function(){
    return Meteor.userId() ? true : false;
  },
  mentor: function(){
    return Meteor.user() && Meteor.user().profile.mentor;
  },
  admin: function(){
    return Meteor.user() && Meteor.user().profile.admin;
  }
};

Router.onBeforeAction(function() {
  if (! Meteor.userId()) {
    this.render('login');
  } else {
    this.next();
  }
});

Router.route('/', function(){
  this.render('user');
});

Router.route('/mentor', function(){
  if (authorize.mentor()){
    this.render('tickets');
  } else {
    this.render('error', { data: { msg: "You're not a mentor!" }});
  }
});

Router.route('/admin', function(){
  if (authorize.admin()){
    this.render('admin');
  } else {
    this.render('error', { data: { msg: "You're not an admin!" }});
  }
});