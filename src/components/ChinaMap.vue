<template>
  <div id='china'>
  </div>
</template>

<script>
const d3 = Object.assign({}, require('d3-request'), require('d3-selection'), require('d3-format'), require('d3-geo'), require('d3-scale'), require('d3-array'), require('d3-transition'), require('d3-ease'), require('d3-axis'))

export default {
  name: 'ChinaMap',
  props: ['csv'],
  watch: {
    csv: function () {
      const ChinaData = this.csv.filter(d => d['Country/Region'] === 'Mainland China')
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
          .datum(d)
          .attr('d', path)
          .attr('fill', 'lightgray')
          .attr('stroke', 'white')
        
        svg.append('g')
          .selectAll('circle')
          .data(ChinaData)
          .enter()
          .append('circle')
          .attr('r', function(d) {
            return radius(d.Confirmed)
          })
          .attr('transform', d => {
            const coord = projection([+d.Longitude, +d.Latitude])
            return 'translate(' + coord[0] + ', ' + coord[1] + ')'
          })
          .attr('fill', 'darkgreen')
          .attr('opacity', 0.5)
      })
    }
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
svg {
  width: 100%;
  height: 100%;
}
</style>
