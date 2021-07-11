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

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial ChosenAxes
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(econData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(econData, d => d[chosenXAxis]) * 0.95,
      d3.max(econData, d => d[chosenXAxis]) * 1.05])
    .range([0, width]);

  return xLinearScale;
}

function yScale(econData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(econData, d => d[chosenYAxis]) * 0.8,
      d3.max(econData, d => d[chosenYAxis]) * 1.05])
    .range([height, 0]);

  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
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

// function used for updating circles group with a transition to
// new circles
function renderCirclesChangeX(circlesGroup, statesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
  
  statesGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))


  return circlesGroup, statesGroup;
}

function renderCirclesChangeY(circlesGroup, statesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  statesGroup.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis]));

  return circlesGroup, statesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var xLabel;

  if (chosenXAxis === "poverty") {
    xLabel = "Poverty Rate:";
  }
  else if (chosenXAxis === "age") {
    xLabel = "Median Age:";
  }
  else {
    xLabel = "MHI:";
  }

  var yLabel;

  if (chosenYAxis === "healthcare") {
    yLabel = "% Lacks Healthcare:";
  }
  else if (chosenYAxis === "smokes") {
    yLabel = "Smokes %:";
  }
  else {
    yLabel = "Obese %:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    // .offset([-100, 0])
    .html(function(d) {
      return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}
      <br>${yLabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Import Data
d3.csv("assets/data/data.csv").then(function(econData) {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    econData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.age = +data.age;
      data.income = +data.income;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
    });

// Create initial LinearScales
var xLinearScale = xScale(econData, chosenXAxis);
var yLinearScale = yScale(econData, chosenYAxis);

// Create initial axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

// append initial axes
var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);

var yAxis = chartGroup.append("g")
  .call(leftAxis);


    // Step 5: Create Initial Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
    .data(econData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 12)
    .attr("fill", "#00BFFF")
    .attr("opacity", "1");
    
    // Add text to circles
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

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenXAxis, circlesGroup);


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
    
          // Create group for y-axis labels
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
      
 // x axis labels event listener
 xLabelsGroup.selectAll("text")
 .on("click", function() {
   // get value of selection
   var value = d3.select(this).attr("value");
   if (value !== chosenXAxis) {

     // replaces chosenXAxis with value
     chosenXAxis = value;

    //  console.log(chosenXAxis)

     // functions here found above csv import
     // updates x scale for new data
     xLinearScale = xScale(econData, chosenXAxis);

     // updates x axis with transition
     xAxis = renderXAxes(xLinearScale, xAxis);

     // updates circles with new x values
     circlesGroup, statesGroup = renderCirclesChangeX(circlesGroup, statesGroup, xLinearScale, chosenXAxis);
     console.log(circlesGroup)

     // updates tooltips with new info
     circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

     // changes classes to change bold text
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

   // y axis labels event listener
 yLabelsGroup.selectAll("text")
 .on("click", function() {
   // get value of selection
   var value = d3.select(this).attr("value");
   if (value !== chosenYAxis) {

     // replaces chosenXAxis with value
     chosenYAxis = value;

     // console.log(chosenXAxis)

     // functions here found above csv import
     // updates scales for new data
     yLinearScale = yScale(econData, chosenYAxis);

     // updates x axis with transition
     yAxis = renderYAxes(yLinearScale, yAxis);

     // updates circles with new x values
     circlesGroup, statesGroup = renderCirclesChangeY(circlesGroup, statesGroup, yLinearScale, chosenYAxis);

     // updates tooltips with new info
     circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

     // changes classes to change bold text
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
