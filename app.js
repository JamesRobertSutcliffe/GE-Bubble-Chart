// Fetch data and create bubble chart
async function fetchDataAndCreateBubbleChart() {
    try {
        const response = await fetch('./data.json');
        const data = await response.json();
        createBubbleChart(data);
    } catch (error) {
        console.error('Error fetching or processing data:', error);
    }
}

// Function to create bubble chart
function createBubbleChart(data) {
    const svg = d3.select("svg"),
        margin = { top: 120, right: 20, bottom: 30, left: 20 },
        width = 1400 - margin.left - margin.right,
        bubbleDiameter = 80,
        bubbleMargin = 25,
        numColumns = Math.floor(width / (bubbleDiameter + bubbleMargin)),
        color = {
            "Conservatives": "#0072CE",
            "Labour": "#E4003B",
            "Lib Dems": "#F0C300",
            "Reform": "#6D28D9",
            "Green": "#008837",
            "SNP": "#FDF1A5",
            "Plaid": "#CDEBC5",
            "Others": "grey"
        };

    const regions = Array.from(new Set(data.map(d => d.region)));
    const regionHeights = {};

    regions.forEach(region => {
        const numBubbles = data.filter(d => d.region === region).length;
        const numRows = Math.ceil(numBubbles / numColumns);
        regionHeights[region] = numRows * (bubbleDiameter + bubbleMargin) + 50;
    });

    const height = d3.sum(regions.map(region => regionHeights[region])) + margin.top + margin.bottom;

    svg.attr("width", width + margin.left + margin.right)
       .attr("height", height);

    let yOffset = margin.top + 50;

    regions.forEach(region => {
        let regionData = data.filter(d => d.region === region);

        const numRows = Math.ceil(regionData.length / numColumns);
        const regionWidth = numColumns * (bubbleDiameter + bubbleMargin) - bubbleMargin;
        const xOffset = (width - regionWidth) / 2;

        svg.append("text")
            .attr("x", width / 2 + margin.left)
            .attr("y", yOffset - 60)
            .attr("text-anchor", "middle")
            .style("font-size", "1rem")
            .style("font-weight", "bold")
            .text(region);

        const node = svg.selectAll(`.node-${region}`)
            .data(regionData)
            .enter().append("g")
            .attr("class", `node-${region}`)
            .attr("transform", (d, i) => {
                const x = (i % numColumns) * (bubbleDiameter + bubbleMargin) + xOffset;
                const y = Math.floor(i / numColumns) * (bubbleDiameter + bubbleMargin);
                return `translate(${x},${yOffset + y})`;
            })
            .on("mouseover", (event, d) => {
                d3.select("#tooltip")
                    .style("opacity", 1)
                    .style("left", `${event.pageX}px`)
                    .style("top", `${event.pageY - 28}px`)
                    .html(`Area: ${d.area}<br>Winner: ${d.WinnerGE2024}<br>Win Margin: ${d["Winner margin"]}`);
            })
            .on("mouseout", () => {
                d3.select("#tooltip").style("opacity", 0);
            });

        node.append("circle")
            .attr("r", d => getBubbleRadius(parseFloat(d["Winner margin"].replace('%', ''))))
            .style("fill", d => color[d.WinnerGE2024] || color["Others"])
            .style("stroke", "black")
            .style("stroke-width", "1px");

        node.append("title")
            .text(d => `${d.area}: ${d.WinnerGE2024}`);

        node.append("text")
            .attr("dy", "-0.5em")
            .style("text-anchor", "middle")
            .style("font-size", "0.8rem")
            .text(d => {
                const radius = getBubbleRadius(parseFloat(d["Winner margin"].replace('%', '')));
                return d.area.length > (radius / 3) ? d.area.substring(0, (radius / 3)) : d.area;
            });

        node.append("text")
            .attr("dy", "0.6em")
            .style("text-anchor", "middle")
            .style("font-size", "0.8rem")
            .text(d => d.WinnerGE2024);

        yOffset += regionHeights[region];
    });
}

// Function to convert winner margin to bubble radius
function getBubbleRadius(margin) {
    const maxMargin = 50;
    const minRadius = 30;
    const maxRadius = 60;
    const normalizedMargin = Math.min(margin, maxMargin) / maxMargin;
    return minRadius + normalizedMargin * (maxRadius - minRadius);
}

fetchDataAndCreateBubbleChart();
