window.ReactiveNow = new ReactiveVar(Date.now());

setInterval(function(){
  ReactiveNow.set(Date.now());
}, 30000);

window.InstantReactiveNow = new ReactiveVar(Date.now());

setInterval(function(){
    InstantReactiveNow.set(Date.now());
}, 500);