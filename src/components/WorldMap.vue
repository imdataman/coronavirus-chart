<template>
  <div id='world'>
  </div>
</template>

<script>
const d3 = Object.assign({}, require('d3-request'), require('d3-selection'), require('d3-geo'), require('d3-scale'), require('d3-array'), require('d3-collection'), require('d3-axis'))

export default {
  name: 'WorldMap',
  props: ['csv'],
  watch: {
    csv: function () {
      const WorldData = this.csv.filter(d => d['Country/Region'] !== '' && d['Country/Region'] !== 'Mainland China')

      const CountryCases = d3.nest()
          .key(d => d['ChineseNameCountry'])
          .rollup(v => d3.sum(v, d => d['Confirmed']))
          .entries(WorldData)
          .sort((a, b) => b.value - a.value)
        
      CountryCases.forEach(d => d.area = WorldData.filter(j => j.ChineseNameCountry === d.key)[0].area)

      const style = window.getComputedStyle(document.getElementById('world'), null)
      const width = +style.getPropertyValue('width').match(/[\d]+/)[0]
      const margin = {top: 60, right: 50, bottom: 30, left: 110}
      const tableWidth = width - margin.left - margin.right
      const maxX = CountryCases[0].value

      function drawTable (tableData, target) {
        const areaName = tableData[0].area
        const barHeight = 25
        const unitLength = barHeight / 0.7
        const tableHeight = tableData.length * unitLength

        d3.select(target).append('svg')
            .attr('id', areaName)
            .attr('height', tableHeight + margin.top)
            .attr('width', '100%')

        d3.select(target).select('#' + areaName)
            .append('text')
            .attr('class', 'tableTitle')
            .attr('x', 0)
            .attr('y', margin.top / 2 + 12)
            .text(areaName)

        const svg2 = d3.select(target).select('#' + areaName)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

        const y = d3.scaleBand()
            .range([0, tableHeight])
            .padding(0)

        const x = d3.scaleLinear().range([0, tableWidth])

        x.domain([0, maxX])
        y.domain(tableData.map(function (d) {
          return d.key
        }))

        const bars = svg2.selectAll('.bar')
              .data(tableData)
              .enter()
              .append('g')

        bars.append('rect')
              .attr('class', 'bar')
              .attr('width', function (d) { return x(d.value) })
              .attr('y', function (d) { return y(d['key'])})
              .attr('height', barHeight)

        bars.append('text')
              .attr('class', 'tableLabel')
              .attr('y', function (d) {
                return y(d.key) + y.bandwidth() / 2
              })
              .attr('x', function (d) {
                return x(d.value) + 3
              })
              .text(function (d) {
                return d.value
              })

        svg2.append('g')
              .call(d3.axisLeft(y))
              .call(g => g.select('.domain').remove())
              .call(g => g.selectAll('line').remove())
              .attr('transform', 'translate(0 , -' + (barHeight / 2 - 7) + ')')

        d3.selectAll('.tick text').attr('class', 'tableText')
      }

      const AreaCases = d3.nest()
          .key(d => d['area'])
          .rollup(v => d3.sum(v, d => d['value']))
          .entries(CountryCases)
          .sort((a, b) => b.value - a.value)
      const uniqueItems = AreaCases.map(d => d.key)

      uniqueItems.forEach(d => drawTable(CountryCases.filter(j => j.area === d), this.$el))

      d3.selectAll('.tableText')
          .filter(function () {
            return d3.select(this).text() === '台灣'
          })
          .attr('id', 'TaiwanBar')
    }
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style>
.bar {
  fill: FireBrick;
}

.tableText {
  font-size: 20px;
}

.tableLabel {
  font-size: 20px;
  fill: black;
}

.tableTitle {
  font-size: 24px;
}

#TaiwanBar {
  font-weight: bold;
}

@media (max-width: 480px) {
  .tableText {
    font-size: 12px;
  }

  .tableLabel {
    font-size: 12px;
  }

  .tableTitle {
    font-size: 16px;
  }
}
</style>
