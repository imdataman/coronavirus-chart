<template>
  <div id="europe"></div>
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
  name: "EuropeMap",
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
      const FixLocation = [
        {
          name: "Finland",
          Latitude: 61.734776,
          Longitude: 24.344157
        },
        {
          name: "Sweden",
          Latitude: 58.012265,
          Longitude: 14.359394
        },
        {
          name: "Russia",
          Latitude: 57.328017,
          Longitude: 29.066706
        }
      ];

      const FixLocationList = FixLocation.map(j => j.name);

      const EuropeData = this.csv
        .filter(d => d["area"] === "歐洲")
        .sort((a, b) => b.Confirmed - a.Confirmed);

      EuropeData.forEach(d => {
        d.Latitude = FixLocationList.includes(d["Country/Region"])
          ? FixLocation.filter(k => k.name === d["Country/Region"])[0].Latitude
          : d.Latitude;
        d.Longitude = FixLocationList.includes(d["Country/Region"])
          ? FixLocation.filter(k => k.name === d["Country/Region"])[0].Longitude
          : d.Longitude;
      });

      const TopTen = EuropeData.slice(0, 10);

      const svg = d3
        .select("#europe")
        .append("svg")
        .attr("viewBox", [0, 0, 950, 800]);

      const projection = d3
        .geoConicEquidistant()
        .rotate([-19.0, 0.0])
        .center([-10.0, 55])
        .parallels([-0.0, 55.0])
        .scale(2000)
        .precision(0.1);

      const path = d3.geoPath().projection(projection);

      const radius = d3.scaleSqrt([0, 10000], [0, 40]);

      const EuropeMap = await d3.json("./data/europe.json");
      svg
        .append("g")
        .append("path")
        .classed("mapLayer", true)
        .datum(EuropeMap)
        .attr("d", path);

      const mapLabel = svg
        .selectAll(".EuropeLabel")
        .data(TopTen)
        .join("g")
        .classed("EuropeLabel", true)
        .attr("transform", d => {
          const nudge = radius(d.Confirmed);
          const coord = projection([+d.Longitude, +d.Latitude]);
          return `translate(${coord[0] + nudge + 2}, ${coord[1] + 9})`;
        });

      mapLabel
        .append("text")
        .text(d => `${d["ChineseNameCountry"]} ${d["Confirmed"]}`);

      svg
        .append("g")
        .selectAll("circle")
        .data(EuropeData)
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
        .data([100, 1000, 10000])
        .join("circle")
        .classed("CircleLegend", true)
        .attr("r", d => radius(d))
        .attr("transform", d => {
          return "translate(" + 850 + ", " + (770 - radius(d)) + ")";
        });

      svg
        .append("g")
        .selectAll("text")
        .data([100, 1000, 10000])
        .join("text")
        .classed("CircleLegendText", true)
        .attr("transform", d => {
          const nudge = d === 100 ? -(radius(d) * 2 + 12) : radius(d) * 2 + 5;
          return "translate(" + 850 + ", " + (770 - nudge) + ")";
        })
        .text(d => d);
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

.EuropeLabel {
  text-anchor: start;
  fill-opacity: 0.8;
  font-size: 24px;
}
</style>
