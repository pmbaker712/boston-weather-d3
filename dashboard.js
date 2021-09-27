// API endpoints
const historyUrl = "https://boston-weather.phillipbaker.repl.co/history";
const forecastUrl = "https://boston-weather.phillipbaker.repl.co/forecast";
const currentUrl = "https://boston-weather.phillipbaker.repl.co/current";

// SVG dimensions
const w = 600;
const w2 = 400;
const h = 600;
const h2 = 300;
const xpad = 60;
const ypad = 25;
const msecToDay = 86400000;

// Function to parse date
function parseDate(dataset, field) {
    for (let i = 0; i < dataset.length; i++) {
        dataset[i][field] = new Date(dataset[i][field]);
        dataset[i][field] = new Date(dataset[i][field].getTime() + Math.abs(dataset[i][field].getTimezoneOffset()*60000));
    };
    return dataset;
};

// 90-Day History Chart, radial heatmap
d3.json(historyUrl, function(data) {

    const rowCount = data.days.length;
    
    // Stack Data to draw high and low arcs separately
    let stackedData = data.days.concat(data.days);

    parseDate(stackedData, "datetime");

    // Measure max and min
    const xmax = d3.max(stackedData, d => d.datetime);
    const xmin = d3.min(stackedData, d => d.datetime);
    const vmax = d3.max(stackedData, d => d.temp);
    const vmin = d3.min(stackedData, d => d.temp);

    // Set scales
    const xScale = d3.scaleLinear()
        .domain([new Date(xmin), new Date(xmax)])
        .range([xpad, w - xpad]);

    const vScale = d3.scaleLinear()
        .domain([vmin, vmax])
        .range([0, 90]);
  
    // Create SVG
    const svg = d3.select("#container-right")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    // Create div for tooltip
    d3.select("body")
        .append("div")
        .attr("id", "tooltip");

    // Draw radial heatmap
    svg.selectAll("path")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", "arc")
        .attr("transform", "translate(300,300)")
        .attr("d", d3.arc()
            .innerRadius(d => Math.floor((d.datetime - xmin) / msecToDay / 7) * 14 + 40)
            .outerRadius(d => Math.floor((d.datetime - xmin) / msecToDay / 7) * 14 + 54)
            .startAngle(function(d, i) {
                if (i < rowCount) {
                    return (d.datetime.getDay() + 1.3) * 2 * Math.PI / 7 + 3 * Math.PI / 2
                } else if (i >= rowCount) {
                    return (d.datetime.getDay() + 1.75) * 2 * Math.PI / 7 + 3 * Math.PI / 2
                };
            })
            .endAngle(function(d, i) {
                if (i < rowCount) {
                    return (d.datetime.getDay() + 1.25 + 0.5) * 2 * Math.PI / 7 + 3 * Math.PI / 2
                } else if (i >= rowCount) {
                    return (d.datetime.getDay() + 1.25 + 0.95) * 2 * Math.PI / 7 + 3 * Math.PI / 2
                };
            }))
        .attr("fill", function(d, i) {
            if (i < rowCount) {   
                if (vScale(d.tempmin) > 50) {
                    return "hsl(20, 100%, " + String(150 - vScale(d.tempmin)) + "%)"
                } else {
                    return "hsl(180, 100%, " + String(50 + vScale(d.tempmin)) + "%)"
                }
            } else if (i >= rowCount) {
                if (vScale(d.tempmax) > 50) {
                    return "hsl(20, 100%, " + String(150 - vScale(d.tempmax)) + "%)"
                } else {
                    return "hsl(180, 100%, " + String(50 + vScale(d.tempmax)) + "%)"
                }
            }
        })
        .attr("stroke", "#222244")
        .style("stroke-width", "2px")
  
        // Set tooltip behavior
        .on("mouseover", function(d, i) {
            d3.select('#tooltip')
                .html(d.datetime.toDateString() + "<br>" +
                    "High: " + d.tempmax + " F<br>" +
                    "Average: " + d.temp + " F<br>" +
                    "Low: " + d.tempmin + " F<br>" +
                    "Wind Speed: " + d.windspeed + " MPH<br>" +
                    "Relative Humidity: " + d.humidity + "%<br>" +
                    "Conditions: " + d.conditions)
                .transition()
                .duration(200)
                .style("opacity", 0.95)
        })
        .on("mouseout", function() {
            d3.select("#tooltip")
                .style("opacity", 0)
        })
        .on("mousemove", function() {
            d3.select("#tooltip")
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY + 10) + "px")
        });

    const weekMap = {
        0: "Sun",
        1: "Mon",
        2: "Tue",
        3: "Wed",
        4: "Thu",
        5: "Fri",
        6: "Sat"
    };
    
    // Draw labels
    function drawLabels(obj) {

        for (let key in obj) {

            svg.append("g")
                .attr("transform", "translate(" +
                    String(300 + 255 * Math.cos(key * 2 * Math.PI / 7 + 3 * Math.PI / 2)) + "," +
                    String(300 + 255 * Math.sin(key * 2 * Math.PI / 7 + 3 * Math.PI / 2)) + ")" +
                    "rotate(" + String(90 + 270 + key * 360 / 7) + ")")
                .append("text")
                .style("font-family", "Ubuntu")
                .style("font-weight", "bold")
                .attr("fill", "white")
                .attr("text-anchor", "middle")
                .text(obj[key]);

            svg.append("g")
                .attr("transform", "translate(" +
                    String(300 + 235 * Math.cos(key * 2 * Math.PI / 7 - 0.19 + 3 * Math.PI / 2)) + "," +
                    String(300 + 235 * Math.sin(key * 2 * Math.PI / 7 - 0.19 + 3 * Math.PI / 2)) + ")" +
                    "rotate(" + String(80 + 270 + key * 360 / 7) + ")")
                .append("text")
                .style("font-family", "Ubuntu")
                .attr("fill", "white")
                .attr("text-anchor", "middle")
                .text("Low");

            svg.append("g")
                .attr("transform", "translate(" +
                    String(300 + 235 * Math.cos(key * 2 * Math.PI / 7 + 0.19 + 3 * Math.PI / 2)) + "," +
                    String(300 + 235 * Math.sin(key * 2 * Math.PI / 7 + 0.19 + 3 * Math.PI / 2)) + ")" +
                    "rotate(" + String(100 + 270 + key * 360 / 7) + ")")
                .append("text")
                .style("font-family", "Ubuntu")
                .attr("fill", "white")
                .attr("text-anchor", "middle")
                .text("High");

        };

    };

    drawLabels(weekMap);

});

// 16-Day Forecast Chart
d3.json(forecastUrl, function(data) {

    parseDate(data.days, "datetime");

    // Measure max and min
    const xmax = new Date(d3.max(data.days, d => d.datetime));
    const xmin = d3.min(data.days, d => d.datetime);
    const ymax = d3.max(data.days, d => d.tempmax);
    const ymin = d3.min(data.days, d => d.tempmin);
 
    // Set scales
    const xScale = d3.scaleTime()
        .domain([xmin, xmax])
        .range([xpad, w2 - xpad]);

    const yScale = d3.scaleLinear()
        .domain([Number(ymin) - 5, Number(ymax) + 5])
        .range([h2 - ypad, ypad]);

    // Create SVG
    const svg = d3.select("#container-left2")
        .append("svg")
        .attr("width", w2)
        .attr("height", h2);

    // Average temperature path
    svg.append("path")
        .datum(data.days)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .curve(d3.curveMonotoneX)
            .x(d => xScale(d.datetime))
            .y(d => yScale(d.temp))
        );
    
    // Circles on average temperature path
    svg.selectAll("circle")
        .data(data.days)
        .enter()
        .append("circle")
        .attr("class", "circle")
        .attr("fill", "white")
        .attr("cx", d => xScale(d.datetime))
        .attr("cy", d => yScale(d.temp))
        .attr("r", 6)
  
        // Set tooltip behavior
        .on("mouseover", function(d, i) {
            d3.select('#tooltip')
                .html(d.datetime.toDateString() + "<br>" +
                    "High: " + d.tempmax + " F<br>" +
                    "Average: " + d.temp + " F<br>" +
                    "Low: " + d.tempmin + " F<br>" +
                    "Wind Speed: " + d.windspeed + " MPH<br>" +
                    "Relative Humidity: " + d.humidity + "%<br>" +
                    "Change of Precipitation: " + d.precipprob + "%<br>" +
                    "Conditions: " + d.conditions)
                .transition()
                .duration(200)
                .style("opacity", 0.95)
        })
        .on("mouseout", function() {
            d3.select("#tooltip")
                .style("opacity", 0)
        })
        .on("mousemove", function() {
            d3.select("#tooltip")
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY + 10) + "px")
        });

    // Max temperature path
    svg.append("path")
        .datum(data.days)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .curve(d3.curveMonotoneX)
            .x(d => xScale(d.datetime))
            .y(d => yScale(d.tempmax))
        );
    
    // Min temperature path
    svg.append("path")
        .datum(data.days)
        .attr("fill", "none")
        .attr("stroke", "cyan")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .curve(d3.curveMonotoneX)
            .x(d => xScale(d.datetime))
            .y(d => yScale(d.tempmin))
        );

    // Draw axes
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat("%d"));

    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", "translate(0," + (h2 - ypad) + ")")
        .attr("id", "x-axis")
        .attr("class", "axis")
        .call(xAxis);

    svg.append("g")
        .attr("transform", "translate(" + xpad + ",0)")
        .attr("id", "y-axis")
        .attr("class", "axis")
        .call(yAxis);

});

// Current Conditions KPI
d3.json(currentUrl, function(data) {

    data.location.currentConditions.datetime = new Date(data.location.currentConditions.datetime);

    document.getElementById("today").innerHTML = data.location.currentConditions.datetime.toDateString() + "<br>" +
        "Temperature: " + data.location.currentConditions.temp + " F<br>" +
        "Wind Speed: " + data.location.currentConditions.wspd + " MPH<br>" +
        "Relative Humidity: " + data.location.currentConditions.humidity + "%<br>";
});
