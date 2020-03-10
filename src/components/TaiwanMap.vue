<template>
  <div id="taiwan"></div>
</template>

<script>
const d3 = Object.assign(
  {},
  require("d3-request"),
  require("d3-selection"),
  require("d3-geo"),
  require("d3-scale"),
  require("d3-array"),
  require("d3-collection"),
  require("d3-queue")
);

export default {
  name: "TaiwanMap",
  mounted() {
    d3.queue(2)
      .defer(d3.json, "./data/taiwan-cases.json")
      .defer(d3.json, "./data/taiwan.json")
      .awaitAll(ready);
    function ready(error, results) {
      if (error) throw error;
      const TaiwanCases = results[0];
      const TaiwanMap = results[1];

      const CountyConfirmed = d3
        .nest()
        .key(d => d["縣市"])
        .rollup(v => d3.sum(v, d => d["確定病例數"]))
        .entries(TaiwanCases);

      TaiwanMap.features.forEach(d => {
        const re = /臺/gi;
        d.properties.COUNTYNAME = d.properties.COUNTYNAME.replace(re, "台");
        const cases = CountyConfirmed.filter(
          j => j.key === d.properties.COUNTYNAME
        );
        d.properties.CONFIRMED = cases.length > 0 ? cases[0].value : 0;
      });

      const Infected = TaiwanMap.features.filter(
        d => d.properties.CONFIRMED > 0
      );

      const svg = d3
        .select("#taiwan")
        .append("svg")
        .attr("viewBox", [0, 0, 950, 650]);

      const projection = d3
        .geoMercator()
        .center([120.5, 24])
        .scale(10000);

      const path = d3.geoPath().projection(projection);

      const radius = d3.scaleSqrt(
        [0, d3.max(CountyConfirmed, d => d.value)],
        [0, 20]
      );

      svg
        .append("g")
        .selectAll("path")
        .data(TaiwanMap.features)
        .enter()
        .append("path")
        .classed("mapLayer", true)
        .attr("d", path);

      svg
        .append("g")
        .selectAll("circle")
        .data(TaiwanMap.features)
        .enter()
        .append("circle")
        .classed("CircleLayer", true)
        .attr("r", d => radius(d.properties.CONFIRMED))
        .attr("transform", d => {
          const coord = path.centroid(d);
          return `translate(${coord})`;
        });

      svg
        .append("g")
        .selectAll("circle")
        .data([1, 5, 20])
        .enter()
        .append("circle")
        .classed("CircleLegend", true)
        .attr("r", d => radius(d))
        .attr("transform", d => {
          return "translate(" + 850 + ", " + (600 - radius(d)) + ")";
        });

      svg
        .append("g")
        .selectAll("text")
        .data([1, 5, 20])
        .enter()
        .append("text")
        .classed("CircleLegendText", true)
        .attr("transform", d => {
          const nudge = d === 1 ? -(radius(d) * 2 + 10) : radius(d) * 2 + 5;
          return "translate(" + 850 + ", " + (600 - nudge) + ")";
        })
        .text(d => d);

      svg
        .append("g")
        .selectAll("text")
        .data(Infected)
        .enter()
        .append("text")
        .classed("taiwanLabel", true)
        .attr("transform", d => {
          const coord = path.centroid(d);
          const nudge = radius(d.properties.CONFIRMED);
          coord[0] = coord[0] + nudge + 2;
          coord[1] = coord[1] + 8;
          return `translate(${coord})`;
        })
        .text(d => {
          const re = /[縣市]/gi;
          const label = d.properties.COUNTYNAME.replace(re, "");
          return label;
        });

      svg
        .append("g")
        .selectAll("text")
        .data(Infected)
        .enter()
        .append("text")
        .classed("taiwanLabelNumbers", true)
        .attr("transform", d => {
          const coord = path.centroid(d);
          coord[1] = coord[1] + 1;
          return `translate(${coord})`;
        })
        .text(d => d.properties.CONFIRMED);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.mapLayer {
  fill: WhiteSmoke;
  stroke: Gainsboro;
  stroke-width: 0.5px;
}

.CircleLayer {
  fill: FireBrick;
  fill-opacity: 0;
  stroke-width: 1.5px;
  stroke: FireBrick;
}

.CircleLegend {
  fill: FireBrick;
  fill-opacity: 0;
  stroke-width: 1.5px;
  stroke: FireBrick;
}

.CircleLegendText {
  text-anchor: middle;
  fill-opacity: 0.8;
}

.taiwanLabel {
  text-anchor: start;
  fill-opacity: 0.8;
  font-size: 20px;
}

.taiwanLabelNumbers {
  text-anchor: middle;
  dominant-baseline: middle;
}

@media (max-width: 480px) {
  .taiwanLabel {
    font-size: 24px;
  }
}
</style>
