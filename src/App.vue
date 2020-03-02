<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <ChinaMap :csv="csv"/>
    <WorldMap :csv="csv"/>
    <TaiwanMap :csv="csv"/>
  </div>
</template>

<script>
import ChinaMap from './components/ChinaMap.vue'
import WorldMap from './components/WorldMap.vue'
import TaiwanMap from './components/TaiwanMap.vue'

const d3 = Object.assign({}, require('d3-request'))

export default {
  name: 'App',
  data () {
    return {
      csv: false
    }
  },
  mounted () {
      d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/03-01-2020.csv", d => {
        this.csv = d
      })
  },
  components: {
    ChinaMap,
    WorldMap,
    TaiwanMap,
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
