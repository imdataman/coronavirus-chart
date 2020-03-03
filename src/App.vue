<template>
  <div id="app">
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
      d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vSZgFQiqa_9ZCCs-jHbB98-9skKwHfKoEUv2jV4oJ6pHwMWSmFoFVpfolEdDQYhiZvsV0Y7u8jEE9Ue/pub?gid=0&single=true&output=csv", d => {
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
