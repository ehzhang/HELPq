Template.ticketCharts.rendered = function(){
  var t = this;
  var query = Tickets.find({status: 'COMPLETE'});

  this.subscribe("ticketData", {
    onReady: function(){
      createCharts(t, query);
      query.observeChanges({
        added: function(){
          createCharts(t, query);
        }
      });
    }
  });

  window.t = t;
};

function createCharts(t, query){
  var ctxResponse = $(t.findAll("#ticketResponseChart")).get(0).getContext("2d");
  var ctxComplete = $(t.findAll("#ticketCompleteChart")).get(0).getContext("2d");
  t.chartResponse = renderChart(ctxResponse, query
      .fetch()
      .map(function(t){
        return (t.claimTime - t.timestamp) / 1000;
      }), t);
  t.chartComplete = renderChart(ctxComplete, query
      .fetch()
      .map(function(t){
        return (t.completeTime - t.claimTime) / 1000;
      }), t);
}

function renderChart(ctx, tickets){

  var data = {
    labels: getLabels(),
    datasets: [
      {
        label: "Tickets Completed",
        fillColor: "rgba(59,131,192,0.5)",
        strokeColor: "rgba(59,131,192,0.8)",
        highlightFill: "rgba(59,131,192,0.75)",
        highlightStroke: "rgba(59,131,192,1)",
        data: getData(tickets)
      }
    ]
  };

  var options = {
    responsive: true,
    //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
    scaleBeginAtZero : true,

    //Boolean - Whether grid lines are shown across the chart
    scaleShowGridLines : false,

    //String - Colour of the grid lines
    scaleGridLineColor : "rgba(0,0,0,.05)",

    //Number - Width of the grid lines
    scaleGridLineWidth : 1,

    //Boolean - If there is a stroke on each bar
    barShowStroke : true,

    //Number - Pixel width of the bar stroke
    barStrokeWidth : 1,

    //Number - Spacing between each of the X value sets
    barValueSpacing : 5,

    //Number - Spacing between data sets within X values
    barDatasetSpacing : 1,

    //String - A legend template
    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
  };

  return new Chart(ctx).Bar(data, options);
}

function getLabels(){
  return [
      "0 - 30 sec",
      "30 - 60 sec",
      "1 - 5 min",
      "5 - 15 min",
      "15 - 30 min",
      "30 - 60 min",
      "1 or more hours"
  ];
}

function getData(tickets){
  var labels = [
      30,
      60,
      300,
      900,
      1800,
      3600,
      Infinity
  ];
  var count = [0];

  var labelIdx = 0;

  tickets
      .sort(function(a, b){return a - b})
      .forEach(function(t){
        if (t >= labels[labelIdx]){
          labelIdx++;
          count.push(0);
        }
        count[count.length - 1]++;
      });

  return count;
}