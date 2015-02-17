Router.onBeforeAction(function() {
  if (!Meteor.userId()) {
    this.render('splash');
  } else {
    this.next();
  }
});

Router.route('/', function(){
  this.layout('bannerLayout');
  this.render('home');
});

Router.route('/profile', function(){
  this.layout('bannerLayout');
  this.render('profile');
});

Router.route('/mentor', function(){
  this.layout('bannerLayout');
  if (authorized.mentor()){
    this.render('mentor');
  } else {
    this.render('error', { data: { msg: "You're not a mentor!" }});
  }
});

Router.route('/admin', function(){
  this.layout('bannerLayout');
  if (authorized.admin()){
    this.render('admin');
  } else {
    this.render('error', { data: { msg: "You're not an admin!" }});
  }
});