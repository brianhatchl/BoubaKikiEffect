function poll() {
    d3.json("results/overall", function(error, results) {
        if (error)
            console.error(error);

        var data = [].concat(
            d3.range(results.false).map(maker("refutes")),
            d3.range(results.true).map(maker("supports"))
        );

        update(data);
    });
}

var color = d3.scale.ordinal()
  .domain(["refutes", "supports"])
  .range(["#bc1919", "#428bca"]);


var padding = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  },
  docEl = document.documentElement,
  width = docEl.clientWidth - padding.left - padding.right,
  height = docEl.clientHeight - padding.top - padding.bottom,
  iconSize = 16;

var icon;

var grid = d3.layout.grid()
  .bands()
  .size([width, height]);


//["overall", "by_halfage", "by_halftime"]
var svg = d3.select("body").append("div").append("svg")
  .attr({
    width: width + padding.left + padding.right,
    height: height + padding.top + padding.bottom
  })
.append("g")
  .attr({
    transform: "translate(" + padding.left + " " + padding.top +")"
  });

function update(data){

  data.sort(function(a, b){
    return a.state.localeCompare(b.state) ||  a.id - b.id;
  });

  grid(data);

  var dot = svg.selectAll(".icon")
    .data(data, function(d){ return d.id; });

  dot.enter().append(icon)
    .attr({
      "class": "icon",
      transform: tx_xy
    })
    .style({opacity: 1})
    .each(colorize);

  // dot.transition()
  //   .delay(function(d, i){ return i / 10; })
  //   .attr({
  //     transform: tx_xy
  //   })
  //   .style({opacity: 1})
  //   .each(colorize);

  dot.exit().transition()
    .style({opacity: 1e-6})
    .remove();
}

function colorize(d){
  d3.select(this).selectAll("*")
    .style({fill: function(){return color(d.state);}});
}

function tx_xy(d){
  var scale = Math.min.apply(null,
    grid.nodeSize().map(function(d){ return d/iconSize; }));
  var tx = "translate(" + d.x + "," + d.y + ")" + " scale(" + scale + ") ";
  return tx;
}

function maker(state){
  maker._ID = maker._ID ? maker._ID : 1;
  return function(){
    return {state: state, id: maker._ID++};
  }
}

d3.xml("img/person2.svg",  "image/svg+xml", function(error, frag) {
  var node = frag.getElementsByTagName("g")[0];
  icon = function(){
    return node.cloneNode(true);
  }
  //use plain Javascript to extract the node
    poll();
});

setInterval(poll, 2000);

