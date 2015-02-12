Template.userTable.helpers({
  users: function(){
    return Meteor.users.find({},{
      sort: {
        createdAt: 1
      }
    })
  }
});