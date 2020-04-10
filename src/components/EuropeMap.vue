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

import * as topojson from "topojson-client";

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
  computed: {
    yScale() {
      return d3.scaleSqrt([0, 100000], [0, 200]);
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

      let EuropeMap = await d3.json(
        "./data/ne_50m_admin_0_countries_lakes.json"
      );
      EuropeMap = topojson.feature(
        EuropeMap,
        EuropeMap.objects["ne_50m_admin_0_countries_lakes"]
      );
      svg
        .append("g")
        .append("path")
        .classed("mapLayer", true)
        .datum(EuropeMap)
        .attr("d", path);

      // svg
      //   .append("g")
      //   .selectAll("circle")
      //   .data(EuropeData)
      //   .join("circle")
      //   .classed("CircleLayer", true)
      //   .attr("r", d => radius(d.Confirmed))
      //   .attr("transform", d => {
      //     const coord = projection([+d.Longitude, +d.Latitude]);
      //     return "translate(" + coord[0] + ", " + coord[1] + ")";
      //   });

      console.log(EuropeData);

      svg
        .append("g")
        .selectAll("polyline")
        .data(EuropeData)
        .join("polyline")
        .attr("id", d => d.id)
        .attr("points", d => {
          const coord = projection([+d.Longitude, +d.Latitude]);
          const h = this.yScale(d.Confirmed);
          const x = coord[0];
          const y = coord[1];
          return `${x - 4},${y} ${x},${y - h} ${x + 4},${y}`;
        })
        .attr("stroke", "#cc0000")
        .attr("fill", "url(#gradient)");

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

      // const mapLabel = svg
      //   .selectAll(".EuropeLabel")
      //   .data(TopTen)
      //   .join("g")
      //   .classed("EuropeLabel", true)
      //   .classed("SpecialLabel", d =>
      //     ["法國", "荷蘭", "瑞士"].includes(d["ChineseNameCountry"])
      //   )
      //   .attr("transform", d => {
      //     const nudge = radius(d.Confirmed);
      //     const coord = projection([+d.Longitude, +d.Latitude]);
      //     return ["法國", "荷蘭", "瑞士"].includes(d["ChineseNameCountry"])
      //       ? "translate(" + coord[0] + ", " + (coord[1] - nudge - 5) + ")"
      //       : `translate(${coord[0] + nudge + 2}, ${coord[1] + 8})`;
      //   });

      const mapLabel = svg
        .selectAll(".EuropeLabel")
        .data(TopTen)
        .join("g")
        .classed("EuropeLabel", true)
        .classed("SpecialLabel", d =>
          ["葡萄牙"].includes(d["ChineseNameCountry"])
        )
        .attr("transform", d => {
          const coord = projection([+d.Longitude, +d.Latitude]);
          return `translate(${coord[0]}, ${coord[1] -
            this.yScale(d.Confirmed) -
            5})`;
        });

      mapLabel
        .append("text")
        .text(d => `${d["ChineseNameCountry"]} ${d["Confirmed"]}`);

      const colors = d3.scaleOrdinal([100, 0], ["#f3f3f3", "#cc0000"]);

      svg
        .append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%")
        .selectAll("stop")
        .data([0, 100])
        .join("stop")
        .attr("offset", d => `${d}%`)
        .attr("stop-color", d => colors(d));
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
  text-anchor: middle;
  fill-opacity: 0.8;
  font-size: 24px;
}

.SpecialLabel {
  text-anchor: start;
}
</style>
