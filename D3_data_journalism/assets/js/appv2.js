// 1. SET UP SVG
// ======================================

// 1.1 Set size, margins width & height
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// 1.2 Create up SVG wrapper.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// 1.3 Set up chart group.
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// 1.4 Setp initial chosen axes.
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// 2. HELPER FUNCTIONS
// ======================================
 
// 2.1 functionS used for updating the x-scale and y-scale variables
//     upon click on axis labels

function xScale(econData, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(econData, d => d[chosenXAxis]) * 0.95,
      d3.max(econData, d => d[chosenXAxis]) * 1.05])
    .range([0, width]);

  return xLinearScale;
}

function yScale(econData, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(econData, d => d[chosenYAxis]) * 0.8,
      d3.max(econData, d => d[chosenYAxis]) * 1.05])
    .range([height, 0]);

  return yLinearScale;
}

// 2.2 Function used for updating xAxis and yAxis variables 
//     upon click on labels
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// 2.3 functions used for updating circles group with a transition to
//     new circles

    // 2.3.1 Change of X axis
function renderCirclesChangeX(circlesGroup, statesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
  
  statesGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))


  return circlesGroup, statesGroup;
}

    // 2.3.2 Change of y axis
function renderCirclesChangeY(circlesGroup, statesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  statesGroup.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis]));

  return circlesGroup, statesGroup;
}

// 2.4 Function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, statesGroup) {

  // Determine xLabel
  var xLabel;

  if (chosenXAxis === "poverty") {
    xLabel = "Poverty %:";
  }
  else if (chosenXAxis === "age") {
    xLabel = "Median Age:";
  }
  else {
    xLabel = "MHI:";
  }
  // Determine yLabel
  var yLabel;

  if (chosenYAxis === "healthcare") {
    yLabel = "Lacks HC %:";
  }
  else if (chosenYAxis === "smokes") {
    yLabel = "Smokes %:";
  }
  else {
    yLabel = "Obese %:";
  }

  // Insert toolTip into the HTML
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([-10, 0])
    .html(function(d) {
      return (`<h6>${d.state}</h6>${xLabel} ${d[chosenXAxis]}
      <br>${yLabel} ${d[chosenYAxis]}`);
    });

  statesGroup.call(toolTip);

    // mouseover event
  statesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return statesGroup;
}

// 3. IMPORT DATA & EXECUTE
// ======================================

// 3.1 Promise and fullfill.
d3.csv("assets/data/data.csv").then(function(econData) {

  // 3.2 Parse Data/Cast as numbers
  econData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });

  // 3.3 Create initial LinearScales by calling x and yScale
  var xLinearScale = xScale(econData, chosenXAxis);
  var yLinearScale = yScale(econData, chosenYAxis);

  // 3.4 Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // 3.5 Append initial axes
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  var yAxis = chartGroup.append("g")
    .call(leftAxis);


  // 3.6 Create Initial Circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(econData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 12)
    .attr("fill", "#00BFFF")
    .attr("opacity", "1");
    
  // 3.7 Create initial text labels for to circles
  var statesGroup = chartGroup.append("g").selectAll("text")
    .data(econData)
    .enter()
    .append("text")
    .text(d => d.abbr)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("dy", ".4em")
    .attr("fill", "#ffffff")
    .attr("text-anchor", "middle")  
    .style("font-size", "10px")
    .style("font-weight", "bold");

  // 3.8 Create label groups for x and y axis

  // 3.8.1 X Axis label group
  var xLabelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

      var incomeLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");
    
  // 3.8.2 Y Axis label group
  var yLabelsGroup = chartGroup.append("g")

    var healthcareLabel = yLabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left+40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "healthcare") // value to grab for event listener
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left +20)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .text("Smokes (%)");

    var obesityLabel = yLabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "obesity") // value to grab for event listener
      .classed("inactive", true)
      .text("Obese (%)");
 
  // 3.9 Execute initial updateToolTip function
  var statesGroup = updateToolTip(chosenXAxis, chosenYAxis, statesGroup);
 
  // 3.10 X axis labels event listener

 xLabelsGroup.selectAll("text")
  .on("click", function() {
    // 3.10.1 Get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

    // 3.10.2 Replaces chosenXAxis with value
    chosenXAxis = value;

    // 3.10.3 Update LinearScale & xAxis
    xLinearScale = xScale(econData, chosenXAxis);
    xAxis = renderXAxes(xLinearScale, xAxis);

    // 3.10.4 Update circles and circle labels with new x values
     circlesGroup, statesGroup = renderCirclesChangeX(circlesGroup, statesGroup, xLinearScale, chosenXAxis);
   
    // 3.10.5 Update tooltips with new info
    statesGroup = updateToolTip(chosenXAxis, chosenYAxis, statesGroup);

    // 3.10.6 Update classes to change bold text
    if (chosenXAxis === "poverty") {
      povertyLabel
        .classed("active", true)
        .classed("inactive", false);
      ageLabel
        .classed("active", false)
        .classed("inactive", true);
      incomeLabel
      .classed("active", false)
      .classed("inactive", true);
     }
     
    else if (chosenXAxis === "age") {
      povertyLabel
        .classed("active", false)
        .classed("inactive", true);
      ageLabel
        .classed("active", true)
        .classed("inactive", false);
      incomeLabel
      .classed("active", false)
      .classed("inactive", true);
    }
     
    else {
      povertyLabel
        .classed("active", false)
        .classed("inactive", true);
      ageLabel
      .classed("active", false)
      .classed("inactive", true);
      incomeLabel
      .classed("active", true)
      .classed("inactive", false);
    }
  }
});

    // 3.10 Y axis labels event listener
 yLabelsGroup.selectAll("text")
 .on("click", function() {
    // 3.10.1 Get value of selection
   var value = d3.select(this).attr("value");
   if (value !== chosenYAxis) {

    // 3.10.2 Replaces chosenYAxis with value
     chosenYAxis = value;

    // 3.10.3 Update LinearScale & yAxis
     yLinearScale = yScale(econData, chosenYAxis);
     yAxis = renderYAxes(yLinearScale, yAxis);

    // 3.10.4 Update circles and circle labels with new x values
     circlesGroup, statesGroup = renderCirclesChangeY(circlesGroup, statesGroup, yLinearScale, chosenYAxis);

    // 3.10.5 Update tooltips with new info
     statesGroup = updateToolTip(chosenXAxis, chosenYAxis, statesGroup);

    // 3.10.6 Update classes to change bold text
     if (chosenYAxis === "healthcare") {
      healthcareLabel
        .classed("active", true)
        .classed("inactive", false);
      smokesLabel
        .classed("active", false)
        .classed("inactive", true);
      obesityLabel
        .classed("active", false)
        .classed("inactive", true);
      }
     
    else if (chosenYAxis === "smokes") {
      healthcareLabel
        .classed("active", false)
        .classed("inactive", true);
      smokesLabel
        .classed("active", true)
        .classed("inactive", false);
      obesityLabel
        .classed("active", false)
        .classed("inactive", true);
      }
     
     else {
      healthcareLabel
        .classed("active", false)
        .classed("inactive", true);
      smokesLabel
        .classed("active", false)
        .classed("inactive", true);
      obesityLabel
        .classed("active", true)
        .classed("inactive", false);
      }
    }
  });
  
}).catch(function(error) {
    console.log(error);
  });
