fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json')
  .then(response => response.json())
  .then(data => console.log(data));


  const w = 700,
        h = 300,
        padding = 50;

(async function() {
  try {
    let res = await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json'),
        json = await res.json(),
        dataset = json.data;
    
    if (!res.ok) throw { status: res.status, statusText: res.statusText };
    
    const svg = d3.select('#bar-chart-container')
                  .append('svg')
                  .attr('width', w + 75)
                  .attr('height', h + 50);
    
    const years = dataset.map(date => new Date(date[0]));
    let maxYear = d3.max(years);
    maxYear.setMonth(maxYear.getMonth() + 3);
    
    const yearsDate = dataset.map(function(date) {
      let quarter,
          month = date[0].substring(5, 7);
      
      if (month === '01') {
        quarter = 'Q1';
      } else if (month === '04') {
        quarter = 'Q2';
      } else if (month === '07') {
        quarter = 'Q3';
      } else {
        quarter = 'Q4';
      }
      
      return `${date[0].substr(0, 4)} ${quarter}`;
    });
    
    const xScale = d3.scaleTime()
                     .domain([d3.min(years), maxYear])
                     .range([0, w]);
    
    const axisX = d3.axisBottom(xScale);
    
    svg.append('g')
       .attr('id', 'x-axis')
       .attr('transform', `translate(50, ${h})`)
       .call(axisX);
    
    let GDP = dataset.map(gdp => gdp[1]);
    
    const yScale = d3.scaleLinear()
                     .domain([0, d3.max(GDP)])
                     .range([h - 25, 0]);
    
    const axisY = d3.axisLeft(yScale);
    
    svg.append('g')
       .attr('id', 'y-axis')
       .attr('transform', `translate(${padding}, 25)`)
       .call(axisY);
    
    const scaleGDP = d3.scaleLinear()
                         .domain([0, d3.max(GDP)])
                         .range([0, h - 25]);
    
    const GDPScaled = GDP.map(gdp => scaleGDP(gdp));
    
    const vTitle = d3.select('#bar-chart-container')
                      .append('p')
                      .attr('id', 'vTitle')
                      .text('Gross Domestic Product');
    
    const tooltip = d3.select('#bar-chart-container')
                       .append('div')
                       .attr('id', 'tooltip')
                       .style('opacity', 0);
    
    svg.selectAll('rect')
       .data(GDPScaled)
       .enter()
       .append('rect')
       .attr('index', (d, i) => i)
       .attr('class', 'bar')
       .attr('data-gdp', (d, i) => GDP[i])
       .attr('data-date', (d, i) => dataset[i][0])
       .style('fill', '#f1948a')
       .attr('width', w / dataset.length)
       .attr('height', d => d)
       .attr('y', d => h - d)
       .attr('x', (d, i) => xScale(years[i]) + padding - 1)
       .on('mouseover', function() {
        this.style.fill = '#7027A0';
        const i = this.getAttribute('index');
      
        tooltip.attr('data-date', this.getAttribute('data-date'))
                .html(function() {
                  let quantity = GDP[i].toFixed(1);
                  quantity = String(quantity);
          
                  if (/\d{5}\.\d$/.test(quantity)) {
                    quantity = quantity.split('');
                    quantity.splice(2, 0, ',');
                    quantity = quantity.join('');
                    
                  } else if (/\d{4}\.\d$/.test(quantity)) {
                    quantity = quantity.split('');
                    quantity.splice(1, 0, ',');
                    quantity = quantity.join('');
                  }
          
                  return `${yearsDate[i]}<br/>$${quantity} billions`;
                })
                .transition().duration(0)
                .style('left', `${i * (w / dataset.length) + 75}px`)
                .style('opacity', 1);
       })
       .on('mouseout', function() {
        this.style.fill = '#f1948a';
      
        tooltip.transition().duration(500)
                .style('opacity', 0);
       });
    
    document.querySelectorAll('g.tick text')[3].textContent = 1965;
    
  } catch(err) {
    console.log('Error', err);
  }
})();
