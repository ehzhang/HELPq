window.ReactiveNow = new ReactiveVar(Date.now());

setInterval(function(){
  ReactiveNow.set(Date.now());
}, 30000);
