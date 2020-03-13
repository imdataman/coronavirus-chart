<template>
  <div id="taiwan"></div>
</template>

<script>
const d3 = Object.assign(
  {},
  require("d3-fetch"),
  require("d3-selection"),
  require("d3-geo"),
  require("d3-scale"),
  require("d3-array")
);

export default {
  name: "TaiwanMap",
  mounted() {
    Promise.all([
      d3.json("./data/taiwan-cases.json"),
      d3.json("./data/taiwan.json")
    ]).then(results => {
      const TaiwanCases = results[0];
      const TaiwanMap = results[1];

      const ModifyPosition = [{ name: "台北市", position: "top" }];

      const CountyConfirmed = d3
        .groups(TaiwanCases, d => d["縣市"])
        .map(d => ({
          key: d[0],
          value: d3.sum(d[1].map(j => +j["確定病例數"]))
        }));

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
        .attr("viewBox", [0, 0, 950, 1200]);

      const projection = d3
        .geoMercator()
        .center([120.7, 24.7])
        .scale(18000);

      const path = d3.geoPath().projection(projection);

      const radius = d3.scaleSqrt(
        [0, d3.max(CountyConfirmed, d => d.value)],
        [0, 20]
      );

      svg
        .append("g")
        .selectAll("path")
        .data(TaiwanMap.features)
        .join("path")
        .classed("mapLayer", true)
        .attr("d", path);

      svg
        .append("g")
        .selectAll("circle")
        .data(TaiwanMap.features)
        .join("circle")
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
        .join("circle")
        .classed("CircleLegend", true)
        .attr("r", d => radius(d))
        .attr("transform", d => {
          return "translate(" + 850 + ", " + (1000 - radius(d)) + ")";
        });

      svg
        .append("g")
        .selectAll("text")
        .data([1, 5, 20])
        .join("text")
        .classed("CircleLegendText", true)
        .attr("transform", d => {
          const nudge = d === 1 ? -(radius(d) * 2 + 10) : radius(d) * 2 + 5;
          return "translate(" + 850 + ", " + (1000 - nudge) + ")";
        })
        .text(d => d);

      const mapLabel = svg
        .selectAll(".taiwanLabel")
        .data(Infected)
        .join("g")
        .classed("taiwanLabel", true)
        .classed("taipeiLabel", d => d.properties.COUNTYNAME === "台北市")
        .attr("transform", d => {
          const nudge = radius(d.properties.CONFIRMED);
          const coord = path.centroid(d);
          if (
            ModifyPosition.map(j => j.name).includes(d.properties.COUNTYNAME)
          ) {
            coord[1] = coord[1] - nudge - 5;
          } else {
            coord[0] = coord[0] + nudge + 2;
            coord[1] = coord[1] + 8;
          }
          return `translate(${coord[0]}, ${coord[1]})`;
        });

      mapLabel.append("text").text(d => {
        const re = /[縣市]/gi;
        const label = d.properties.COUNTYNAME.replace(re, "");
        return `${label} ${d.properties.CONFIRMED}`;
      });
    });
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
  font-size: 24px;
}

.taipeiLabel {
  text-anchor: middle;
}
</style>
