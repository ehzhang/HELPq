window.stats = {};

stats.sum = function(x){
  return x.reduce(function(prev, next){
    return prev + next;
  },0)
};

stats.mean = function(x){
  return stats.sum(x) / x.length;
};

stats.min = function(x){
  var min;
  for (var i =0; i < x.length; i++){
    if (x[i] < min || min === undefined) min = x[i];
  }
  return min;
};

stats.max = function(x){
  var max;
  for (var i =0; i < x.length; i++){
    if (x[i] > max || max === undefined) max = x[i];
  }
  return max;
};

stats.median = function(x){
  x.sort(function(a,b) {return a - b;} );
  var mid = Math.floor(x.length/2);
  if(x.length % 2)
    return x[mid];
  else
    return (x[mid-1] + x[mid]) / 2.0;
};

stats.stdDev = function(x){
  var mean = stats.mean(x);
  return Math.sqrt(stats.sum(x.map(function(n){
    return (n - mean) * (n - mean);
  })) / x.length);
};

