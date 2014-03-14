var margin = {top: 20, right: 20, bottom: 30, left: 50};
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis().scale(x).orient("bottom");
var yAxis = d3.svg.axis().scale(y).orient("left");

var line = d3.svg.line()
  .x(function(d) { return x(d.date); })
  .y(function(d) { return y(d.val); });

var svg = d3.select("div#chart").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.select("a#go").on("click", function() {
  d3.select("span#placeholder").style("display", null);
  d3.select("span#placeholder h2").text("Loading...");
  var pv = d3.select("input#pv").property("value");
  var start = d3.select("input#startDate").property("value");
  var end = d3.select("input#endDate").property("value");
  update(generateUrl(pv, start, end));
})

function update(url) {
  svg.selectAll("g").remove();
  svg.selectAll("path").remove();
  d3.json(url, function(error, data) {
    pv = data[0]["meta"]["name"];
    data[0]["data"].forEach(function(d) {
      var milliseconds = Math.round(d.secs*1000 + d.nanos*1e-6);
      d.date = new Date(milliseconds);
      d.val = +d.val;
    });
  
    x.domain(d3.extent(data[0]["data"], function(d) { return d.date; }));
    y.domain(d3.extent(data[0]["data"], function(d) { return d.val; }));
    
    d3.select("span#placeholder").style("display", "none");
    svg.append("path")
      .datum(data[0]["data"])
      .attr("class", "line")
      .attr("d", line);
  
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height +")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left+6)
        .attr("x", -(height/2) + margin.bottom + margin.top)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(pv);
  });
}

function generateUrl(pv, startDateString, endDateString) {
  var arch_app_base = "http://lcls-archapp.slac.stanford.edu/retrieval/data/getData.json";
  var inputDateFormat = d3.time.format("%d-%b-%Y %X");
  var startDate = inputDateFormat.parse(startDateString);
  var endDate = inputDateFormat.parse(endDateString);
  var isoStart = d3.time.format.iso(startDate);
  var isoEnd = d3.time.format.iso(endDate);
  return arch_app_base + "?pv=" + pv + "&from=" + isoStart + "&to=" + isoEnd;
}
