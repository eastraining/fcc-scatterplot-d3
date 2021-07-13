const GRAPH_WIDTH = 1100;
const GRAPH_HEIGHT = 610;
const GRAPH_PADDING = 60;
const formatTime = d3.timeFormat('%M:%S');
const parseTime = d3.timeParse('%M:%S');


fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
.then(res => res.json())
.then(data => {return data.map(x => {
    let timeObj = new Date(1970, 0, 0, 0, x.Time.slice(0, 2), x.Time.slice(3, 5));
    return { TimeObj: timeObj, ...x }
})})
.then(raceTimeData => {
    const BAR_WIDTH = (GRAPH_WIDTH - GRAPH_PADDING * 2) / raceTimeData.length;
    const CIRCLE_RADIUS = 5;
    const MIN_YEAR = d3.min(raceTimeData, d => d.Year);
    const MAX_YEAR = d3.max(raceTimeData, d => d.Year);

    d3.select('.svgContainer')
    .append('div')
    .attr('id', 'subtitle')
    .html(`${raceTimeData.length} fastest times up the Alpe d'Huez between ${MIN_YEAR} and ${MAX_YEAR}`); 

    const raceTimesChart = d3.select('.svgContainer')
    .append('svg')
    .attr('width', GRAPH_WIDTH)
    .attr('height', GRAPH_HEIGHT);

    const tooltip = d3.select('.svgContainer')
    .append('div')
    .style('position', 'absolute')
    .attr('id', 'tooltip')
    .html('init')
    .style('opacity', 0);
    
    const xScale = d3.scaleLinear()
    .domain([MIN_YEAR, MAX_YEAR])
    .range([GRAPH_PADDING, GRAPH_WIDTH - GRAPH_PADDING]);

    const yScale = d3.scaleTime()
    .domain([d3.max(raceTimeData, d => d.TimeObj), d3.min(raceTimeData, d => d.TimeObj)])
    .range([GRAPH_HEIGHT - GRAPH_PADDING, 8]);

    raceTimesChart.selectAll('circle')
    .data(raceTimeData)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', d => xScale(d.Year))
    .attr('cy', d => yScale(d.TimeObj))
    .attr('r', CIRCLE_RADIUS)
    .attr('width', BAR_WIDTH)
    .attr('height', d => GRAPH_HEIGHT - GRAPH_PADDING - yScale(d.TimeObj))
    .attr('fill', d => d.Doping === '' ? 'green' : 'red')
    .attr('data-xvalue', d => d.Year)
    .attr('data-yvalue', d => d.TimeObj)
    .on('mouseover', function (e, d) {
        d3.select(this)
        .style('opacity', 0.3);
        tooltip.style('opacity', 1)
        .html(`${d.Year}: ${d.Name} (${d.Nationality}) completed ascent in ${formatTime(d.TimeObj)}<br>${d.Doping}`)
        .attr('data-year', d.Year)
        .style('left', e.clientX + 16 + 'px')
        .style('top', e.clientY - 16 + 'px')
        console.log(d);
    }).on('mouseout', function (d, i) {
        d3.select(this)
        .style('opacity', 1);
        tooltip.style('opacity', 0)
        .style('top', 0);
    });

    const legend = raceTimesChart.append('g')
    .attr('x', GRAPH_WIDTH - 4 * GRAPH_PADDING)
    .attr('y', GRAPH_PADDING)
    .attr('id', 'legend');

    const legendText = [ 'Suspected doping', 'No evidence of doping' ]

    legend.selectAll('text')
    .data(legendText)
    .enter()
    .append('text')
    .attr('x', GRAPH_WIDTH - 4 * GRAPH_PADDING)
    .attr('y', (d, i) => GRAPH_PADDING + i * 20)
    .text(d => d);

    legend.selectAll('rect')
    .data(legendText)
    .enter()
    .append('rect')
    .attr('x', GRAPH_WIDTH - 4 * GRAPH_PADDING - 3 * CIRCLE_RADIUS)
    .attr('y', (d, i) => GRAPH_PADDING + i * 20 - 2 * CIRCLE_RADIUS)
    .attr('width', CIRCLE_RADIUS * 2)
    .attr('height', CIRCLE_RADIUS * 2)
    .attr('fill', d => d === legendText[0] ? 'red' : 'green');

    const xAxis = d3.axisBottom(xScale).ticks(20, ".4");
    const yAxis = d3.axisLeft(yScale).ticks(10, formatTime);
    raceTimesChart.append('g')
    .attr('transform', `translate (0, ${GRAPH_HEIGHT - GRAPH_PADDING})`)
    .attr('id', 'x-axis')
    .call(xAxis);
    raceTimesChart.append('g')
    .attr('transform', `translate (${GRAPH_PADDING}, 0)`)
    .attr('id', 'y-axis')
    .call(yAxis);

    raceTimesChart.append('text')
    .attr('class', 'x axis-label')
    .attr('text-anchor', 'middle')
    .attr('x', GRAPH_WIDTH / 2)
    .attr('y', GRAPH_HEIGHT - GRAPH_PADDING / 3)
    .text('Year');
    
    raceTimesChart.append('text')
    .attr('class', 'y axis-label')
    .attr('text-anchor', 'middle')
    .attr('x', (GRAPH_PADDING - GRAPH_HEIGHT) / 2)
    .attr('y', GRAPH_PADDING / 3)
    .attr('transform', 'rotate(-90)')
    .text('Time in minutes : seconds');
})