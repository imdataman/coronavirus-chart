<template>
  <div id="china"></div>
</template>

<script>
const d3 = Object.assign(
  {},
  require("d3-fetch"),
  require("d3-selection"),
  require("d3-geo"),
  require("d3-scale")
);

export default {
  name: "ChinaMap",
  props: {
    csv: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  watch: {
    csv: async function() {
      const ChinaData = this.csv
        .filter(d => d["Country/Region"] === "China")
        .sort((a, b) => b.Confirmed - a.Confirmed);

      const TopTen = ChinaData.slice(0, 10);

      const FixLocation = [
        {
          name: "Xinjiang",
          Latitude: 42.85083,
          Longitude: 95.234485
        },
        {
          name: "Tibet",
          Latitude: 30.485535,
          Longitude: 95.989658
        }
      ];

      const FixLocationList = FixLocation.map(j => j.name);

      ChinaData.forEach(d => {
        d.Latitude = FixLocationList.includes(d["Province/State"])
          ? FixLocation.filter(k => k.name === d["Province/State"])[0].Latitude
          : d.Latitude;
        d.Longitude = FixLocationList.includes(d["Province/State"])
          ? FixLocation.filter(k => k.name === d["Province/State"])[0].Longitude
          : d.Longitude;
      });

      const svg = d3
        .select("#china")
        .append("svg")
        .attr("viewBox", [0, 0, 950, 1000]);

      const projection = d3
        .geoMercator()
        .center([112, 42])
        .scale(1500);

      const path = d3.geoPath().projection(projection);

      const radius = d3.scaleSqrt([0, 10000], [0, 40]);

      const ChinaMap = await d3.json("./data/china.json");
      svg
        .append("g")
        .append("path")
        .classed("mapLayer", true)
        .datum(ChinaMap)
        .attr("d", path);

      svg
        .append("g")
        .selectAll("circle")
        .data(ChinaData)
        .join("circle")
        .classed("CircleLayer", true)
        .attr("r", d => radius(d.Confirmed))
        .attr("transform", d => {
          const coord = projection([+d.Longitude, +d.Latitude]);
          return "translate(" + coord[0] + ", " + coord[1] + ")";
        });

      svg
        .append("g")
        .selectAll("circle")
        .data([100, 1000, 10000, 50000])
        .join("circle")
        .classed("CircleLegend", true)
        .attr("r", d => radius(d))
        .attr("transform", d => {
          return "translate(" + 850 + ", " + (950 - radius(d)) + ")";
        });

      svg
        .append("g")
        .selectAll("text")
        .data([100, 1000, 10000, 50000])
        .join("text")
        .classed("CircleLegendText", true)
        .attr("transform", d => {
          const nudge = d === 100 ? -(radius(d) * 2 + 12) : radius(d) * 2 + 5;
          return "translate(" + 850 + ", " + (950 - nudge) + ")";
        })
        .text(d => d);

      const mapLabel = svg
        .selectAll(".ChinaLabel")
        .data(TopTen)
        .join("g")
        .classed("ChinaLabel", true)
        .classed(
          "HubeiLabel",
          d =>
            d["ChineseNameProvince"] === "湖北" ||
            d["ChineseNameProvince"] === "湖南"
        )
        .attr("transform", d => {
          const nudge = radius(d.Confirmed);
          const coord = projection([+d.Longitude, +d.Latitude]);
          return d["ChineseNameProvince"] === "湖北" ||
            d["ChineseNameProvince"] === "湖南"
            ? "translate(" + coord[0] + ", " + (coord[1] - nudge - 5) + ")"
            : `translate(${coord[0] + nudge + 2}, ${coord[1] + 8})`;
        });

      mapLabel
        .append("text")
        .text(d => `${d["ChineseNameProvince"]} ${d["Confirmed"]}`);
    }
  }
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
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

.ChinaLabel {
  text-anchor: start;
  fill-opacity: 0.8;
  font-size: 24px;
}

.HubeiLabel {
  text-anchor: middle;
}
</style>
