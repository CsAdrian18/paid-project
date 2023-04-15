// Load data from files
Promise.all([
    d3.json("streets.json"),
    d3.csv("pumps.csv"),
    d3.csv("deathdays.csv"),
    d3.csv("deaths_age_sex.csv"),
  ]).then(([streetsData, pumpsData, deathdaysData, deathsData]) => {
    // Process data if necessary
  
    // Create map visualization
    function createMapVisualization(streetsData, pumpsData, deathsData) {
        const width = 800;
        const height = 600;
      
        // Create the SVG container
        const svg = d3.select("body")
          .append("svg")
          .attr("width", width)
          .attr("height", height);
      
        // Draw the streets
        const streets = svg.append("g")
          .selectAll("line")
          .data(streetsData)
          .join("line")
          .attr("x1", d => d[0][0])
          .attr("y1", d => d[0][1])
          .attr("x2", d => d[1][0])
          .attr("y2", d => d[1][1])
          .attr("stroke", "black")
          .attr("stroke-width", 1);
      
        // Draw the pumps
        const pumps = svg.append("g")
          .selectAll("circle.pump")
          .data(pumpsData)
          .join("circle")
          .attr("class", "pump")
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
          .attr("r", 5)
          .attr("fill", "blue");
      
        // Draw the deaths
        const deaths = svg.append("g")
          .selectAll("circle.death")
          .data(deathsData)
          .join("circle")
          .attr("class", "death")
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
          .attr("r", 2)
          .attr("fill", d => d.sex === "0" ? "red" : "purple")
          .attr("opacity", 0.5);
      }
      
  
    // Create additional charts and interface elements
    createBarChart(deathdaysData);
    createPieChart(deathsData);
  
    // Add event listeners for interactivity and filtering
    addFilterEventListeners();
  });
  
  function createMapVisualization(streetsData, pumpsData, deathsData) {
    // Create the map visualization using D3.js
  }
  
  function createBarChart(deathdaysData) {
    const margin = { top: 30, right: 30, bottom: 70, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    const x = d3.scaleBand()
      .domain(deathdaysData.map(d => d.day))
      .range([0, width])
      .padding(0.1);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(deathdaysData, d => +d.deaths)])
      .range([height, 0]);
  
    const svg = d3.select("body")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");
  
    svg.append("g")
      .call(d3.axisLeft(y));
  
    svg.selectAll("rect")
      .data(deathdaysData)
      .join("rect")
      .attr("x", d => x(d.day))
      .attr("y", d => y(d.deaths))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.deaths))
      .attr("fill", "steelblue");
  }
  
  
  function createPieChart(deathsData) {
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;
  
    const color = d3.scaleOrdinal(d3.schemeCategory10);
  
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);
  
    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);
  
    const svg = d3.select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);
  
    const ageGroups = d3.rollups(
      deathsData,
      v => v.length,
      d => d.age_group
    );
  
    const data_ready = pie(ageGroups);
  
    svg.selectAll("path")
      .data(data_ready)
      .join("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data[0]))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.7);
  }
  
  function addFilterEventListeners() {
    const ageFilter = document.getElementById("age-filter");
    const sexFilter = document.getElementById("sex-filter");
    const dateFilter = document.getElementById("date-filter");
    const dateDisplay = document.getElementById("date-display");
  
    ageFilter.addEventListener("change", updateFilters);
    sexFilter.addEventListener("change", updateFilters);
    dateFilter.addEventListener("input", () => {
      dateDisplay.textContent = dateFilter.value < 31 ? `1-${dateFilter.value}` : "All";
      updateFilters();
    });
  
    function updateFilters() {
        const age = ageFilter.value;
        const sex = sexFilter.value;
        const date = dateFilter.value;
      
        // Update the visualizations based on the filter values.
        // Filter the deaths data:
        const filteredDeathsData = deathsData.filter(d => {
          return (age === "" || d.age_group === age) &&
                 (sex === "" || d.sex === sex) &&
                 (+d.day <= date);
        });
      
        // Update the map visualization:
        updateMap(filteredDeathsData);
      
        // Update the bar chart visualization:
        updateBarChart(filteredDeathsData);
      
        // Update the pie chart visualization:
        updatePieChart(filteredDeathsData);

        function updateMap(filteredDeathsData) {
            const circles = mapSvg.selectAll("circle.death")
              .data(filteredDeathsData, d => d.id);
          
            circles.join(
              enter => enter.append("circle")
                .attr("class", "death")
                .attr("r", 3)
                .attr("cx", d => projection([d.lng, d.lat])[0])
                .attr("cy", d => projection([d.lng, d.lat])[1])
                .attr("fill", "red"),
              update => update,
              exit => exit.remove()
            );
          }
          function updateBarChart(filteredDeathsData) {
            const deathsByDay = d3.rollups(
              filteredDeathsData,
              v => v.length,
              d => d.day
            );
          
            const updatedDeathdaysData = deathdaysData.map(d => {
              const deaths = deathsByDay.find(([day]) => day === d.day);
              return { day: d.day, deaths: deaths ? deaths[1] : 0 };
            });
          
            const y = d3.scaleLinear()
              .domain([0, d3.max(updatedDeathdaysData, d => +d.deaths)])
              .range([barChartHeight, 0]);
          
            barChartSvg.select("g.y-axis")
              .transition()
              .duration(1000)
              .call(d3.axisLeft(y));
          
            const bars = barChartSvg.selectAll("rect")
              .data(updatedDeathdaysData);
          
            bars.join(
              enter => enter.append("rect")
                .attr("x", d => barChartX(d.day))
                .attr("y", d => barChartY(d.deaths))
                .attr("width", barChartX.bandwidth())
                .attr("height", d => barChartHeight - barChartY(d.deaths))
                .attr("fill", "steelblue"),
              update => update.transition()
                .duration(1000)
                .attr("y", d => barChartY(d.deaths))
                .attr("height", d => barChartHeight - barChartY(d.deaths)),
              exit => exit.remove()
            );
          }

          function updatePieChart(filteredDeathsData) {
            const deathsByAgeGroup = d3.rollups(
              filteredDeathsData,
              v => v.length,
              d => d.age_group
            );
          
            const updatedAgeDistributionData = ageDistributionData.map(d => {
              const deaths = deathsByAgeGroup.find(([ageGroup]) => ageGroup === d.age_group);
              return { age_group: d.age_group, deaths: deaths ? deaths[1] : 0 };
            });
          
            const pie = d3.pie()
              .value(d => d.deaths)
              .sort(null);
          
            const pieData = pie(updatedAgeDistributionData);
          
            const arcs = pieChartSvg.selectAll("path")
              .data(pieData);
          
            arcs.join(
              enter => enter.append("path")
                .attr("d", arc)
                .attr("fill", (d, i) => pieChartColors(i)),
              update => update.transition()
                .duration(1000)
                .attrTween("d", function(d) {
                  const interpolate = d3.interpolate(this._current, d);
                  this._current = interpolate(0);
                  return function(t) {
                    return arc(interpolate(t));
                  };
                }),
              exit => exit.remove()
            );
          }
          
          
          
      }
      
  }
  