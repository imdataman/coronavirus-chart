<template>
  <div id='china'>
  </div>
</template>

<script>
const d3 = Object.assign({}, require('d3-request'), require('d3-selection'), require('d3-geo'), require('d3-scale'), require('d3-array'))

export default {
  name: 'ChinaMap',
  props: ['csv'],
  watch: {
    csv: function () {
      const ChinaData = this.csv
        .filter(d => d['Country/Region'] === 'Mainland China')
        .sort((a, b) => b.Confirmed - a.Confirmed)

      const TopTen = ChinaData.slice(0, 10)

      const svg = d3.select('#china')
        .append('svg')
        .attr('viewBox', [0, 0, 950, 650])

      const projection = d3.geoMercator()
        .center([105, 42])
        .scale(800)

      const path = d3.geoPath().projection(projection)

      const radius = d3.scaleSqrt([0, d3.max(ChinaData, d => d.Confirmed)], [0, 10])
      
      d3.json('./data/china.json', d => {
        svg.append('g')
          .append('path')
          .classed('mapLayer', true)
          .datum(d)
          .attr('d', path)

        svg.append('g')
          .selectAll('text')
          .data(TopTen)
          .enter()
          .append('text')
          .classed('ChinaLabel', true)
          .attr('transform', d => {
            const nudge = radius(d.Confirmed)
            const coord = projection([+d.Longitude, +d.Latitude])
            return d['ChineseNameProvince'] === '湖北' ? 'translate(' + (coord[0]) + ', ' + (coord[1] + 5) + ')' : 'translate(' + (coord[0] + nudge + 2) + ', ' + (coord[1] + 5) + ')'
          })
          .text(d => d['ChineseNameProvince'])
        
        svg.append('g')
          .selectAll('circle')
          .data(ChinaData)
          .enter()
          .append('circle')
          .classed('CircleLayer', true)
          .attr('r', function(d) {
            return radius(d.Confirmed)
          })
          .attr('transform', d => {
            const coord = projection([+d.Longitude, +d.Latitude])
            return 'translate(' + coord[0] + ', ' + coord[1] + ')'
          })

        svg.append('g')
          .selectAll('circle')
          .data([100, 1000, 10000, 50000])
          .enter()
          .append('circle')
          .classed('CircleLegend', true)
          .attr('r', function(d) {
            return radius(d)
          })
          .attr('transform', d => {
            return 'translate(' + 850 + ', ' + (600 - radius(d)) + ')'
          })

        svg.append('g')
          .selectAll('text')
          .data([100, 1000, 10000, 50000])
          .enter()
          .append('text')
          .classed('CircleLegendText', true)
          .attr('transform', d => {
            const nudge = d === 100 ? -(radius(d) * 2 + 12) : (radius(d) * 2 + 5)
            return 'translate(' + 850 + ', ' + (600 - nudge) + ')'
          })
          .text(d => d)
      })
    }
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style>
#china {
  padding: 10%;
}

.mapLayer {
  fill: WhiteSmoke;
  stroke: white;
}

.CircleLayer {
  fill: Chocolate;
  fill-opacity: 0.5;
  stroke-width: 1.5px;
  stroke: Chocolate;
}

.CircleLegend {
  fill: Chocolate;
  fill-opacity: 0.5;
  stroke-width: 1.5px;
  stroke: Chocolate;
}

.CircleLegendText {
  text-anchor: middle;
}

.ChinaLabel {
  text-anchor: start;
  /* fill-opacity: 0.5; */
  font-size: 16px;
}

@media (max-width: 400px) {
  #china {
    padding: 0;
  }
  .CircleLegendText  {
    font-size: 20px;
  }
  .ChinaLabel {
    font-size: 20px;
  }
}
</style>
