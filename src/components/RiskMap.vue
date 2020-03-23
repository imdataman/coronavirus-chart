<template>
  <div id="risk"></div>
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
import * as topojson from "topojson-client";
import greatCircle from "@turf/great-circle";
import { point } from "@turf/helpers";

export default {
  name: "RiskMap",
  async mounted() {
    const result = await d3.json("./data/ne_50m_admin_0_countries_lakes.json");
    const riskData = await d3.csv("./data/risk-data.csv");
    const world = topojson.feature(
      result,
      result.objects["ne_50m_admin_0_countries_lakes"]
    );

    const locations = riskData.map(d => ({
      ...d,
      geometry_ori: point([d.ori_long, d.ori_lat]),
      geometry_tar: point([d.tar_long, d.tar_lat])
    }));

    locations.forEach(d => (d.value = +d.value));

    const locationNames = [
      ...new Set([
        ...locations.map(d => d.tar_en),
        ...locations.map(d => d.ori_en)
      ])
    ];

    const dotGapScale = d3
      .scaleLinear()
      .range([8, 40])
      .domain([200, 20])
      .clamp(true);

    const dotColorScale = d3
      .scaleLinear()
      .range(["#fdcc8a", "#d7301f"])
      .domain(d3.extent(locations, d => d.value))
      .clamp(true);

    const greatCircles = locations.map(d => ({
      ...d,
      path: greatCircle(d.geometry_ori, d.geometry_tar)
    }));

    function renderMap(geoInfo) {
      const projection = d3
        .geoConicEquidistant()
        .rotate(geoInfo.rotate)
        .center(geoInfo.center)
        .parallels(geoInfo.parallels)
        .scale(geoInfo.scale)
        .precision(0.1);

      const path = d3.geoPath().projection(projection);

      const svg = d3
        .select("#risk")
        .append("svg")
        .attr("id", `riskMap${geoInfo.id}`)
        .attr("viewBox", [0, 0, 950, 750]);

      svg.append("rect").attr("id", "sea");

      svg
        .append("g")
        .selectAll("path")
        .data(world.features)
        .join("path")
        .attr("class", "polygon")
        .classed("affected", d => locationNames.includes(d.properties.NAME))
        .attr("d", path);

      svg.selectAll(".affected").raise();

      svg
        .selectAll(".line")
        .data(greatCircles)
        .join("path")
        .attr("class", (d, i) => `line${i + 1}`)
        .classed("line", true)
        .attr("d", d => `${path(d.path)} h0`)
        .style("stroke-dasharray", d => `0.25 ${dotGapScale(d.value)}`)
        .style("stroke", d => `${dotColorScale(d.value)}`);

      svg
        .selectAll(".targetLabel")
        .data(greatCircles)
        .join("text")
        .attr("class", d => `${d.tar_en} locationLabel`)
        .classed("targetLabel", true)
        .attr("transform", d =>
          d.target === "安哥拉" && geoInfo.id === 0
            ? "translate(325, 740)"
            : `translate(${projection([d.tar_long, d.tar_lat])[0]}, ${
                projection([d.tar_long, d.tar_lat])[1]
              })`
        )
        .text(d => d.target);

      svg
        .selectAll(".originLabel")
        .data(greatCircles)
        .join("text")
        .attr("class", d => `${d.ori_en} locationLabel`)
        .classed("originLabel", true)
        .attr(
          "transform",
          d =>
            `translate(${projection([d.ori_long, d.ori_lat])[0]}, ${
              projection([d.ori_long, d.ori_lat])[1]
            })`
        )
        .text(d => d.origin);

      locationNames.forEach(d =>
        d3.select(`#riskMap${geoInfo.id} .${d}`).attr("class", "displayedLabel")
      );
    }

    const mapLayout = [
      {
        id: 0,
        rotate: [-22.0, 0.0],
        center: [-10.0, 48.5],
        parallels: [-0.0, 55.0],
        scale: 1500
      },
      {
        id: 1,
        rotate: [-63.0, 0.0],
        center: [-10.0, 37],
        parallels: [30, 70],
        scale: 1800
      },
      {
        id: 2,
        rotate: [-132.0, 0.0],
        center: [-10.0, 32],
        parallels: [100, 140],
        scale: 1400
      }
    ];

    mapLayout.forEach(d => renderMap(d));
  }
};
</script>

<style>
#risk {
  max-width: 950px;
}

#sea {
  width: 100%;
  height: 100%;
  fill: Azure;
}

.polygon {
  fill: WhiteSmoke;
  stroke: Gainsboro;
  stroke-width: 1px;
}

.affected {
  fill: lightyellow;
  stroke: darkgrey;
}

.line {
  stroke-width: 6px;
  stroke-linecap: round;
  fill: none;
  animation: dash 30s linear infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: -1000;
  }
}

.locationLabel {
  fill-opacity: 0;
}

.displayedLabel {
  fill-opacity: 0.8;
  text-anchor: middle;
  alignment-baseline: middle;
  font-size: 24px;
  z-index: 2;
}
</style>
