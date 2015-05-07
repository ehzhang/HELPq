Template.userStats.onCreated(function(){
  this.subscribe("allUsers");
  this.subscribe("allTickets");
});

Template.userStats.helpers({
  users: function(){
    return users();
  },
  mentors: function(){
    return Meteor.users.find({
      'profile.mentor': true
    }).fetch();
  },
  ticketCount: function(){
    return tickets().length;
  },
  activeMentors: function(){
    return uniqueProp('claimId');
  },
  activeUsers: function(){
    return uniqueProp('userId');
  },
  countStatus: function(status){
    return countStatus(status);
  },
  percentStatus: function(status){
    return ticketPercent(countStatus(status));
  },
  wordFreqs: function(){
    var text = tickets().reduce(function(prev, next){
      return prev + " " + next.topic;
    }, "");
    return wordFreqs(text);
  }
});

function tickets(){
  return Tickets.find({}).fetch();
}

function users(){
  return Meteor.users.find({}).fetch();
}

// Aggregate the number of types of tickets each user submit;
function uniqueProp(key){
  var users = {};
  var count = 0;
  tickets().forEach(function(t){
    if (t[key] && !users[t[key]]) {
      users[t[key]] = true;
      count += 1;
    }
  });
  return count;
}

function countStatus(status){
  return tickets().filter(function(t){return t.status === status}).length;
}

function ticketPercent(n){
  return ((n / tickets().length) * 100).toFixed(0);
}

function wordFreqs(text){
  var cleaned = text.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
  var words = cleaned.split(" ");
  var freq = {};
  var ignore = ['',' ', 'and','the','to','a','of','for','as','i','with','it','is','on','that','this','can','in','be','has','if'];

  for (var i = 0; i < words.length; i++){
    var word = words[i].toLowerCase();
    if (!ignore.indexOf(word) > -1){
      freq[word] = freq[word] || 0;
      freq[word] += 1;
    }
  }

  var keys = Object.keys(freq);
  var freqs = [];
  keys.forEach(function(key){
    freqs.push({
      word: key,
      count: freq[key]
    });
  });
  return freqs.sort(function(a, b){
    return b.count - a.count;
  }).slice(0, 50);
}