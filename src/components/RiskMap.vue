<template>
  <div id="map"></div>
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
import lineSliceAlong from "@turf/line-slice-along";
import greatCircle from "@turf/great-circle";
import { point } from "@turf/helpers";

export default {
  name: "Map",
  async mounted() {
    const result = await d3.json("./data/ne_50m_admin_0_countries_lakes.json");
    const world = topojson.feature(
      result,
      result.objects["ne_50m_admin_0_countries_lakes"]
    );

    const svg = d3
      .select("#map")
      .append("svg")
      .attr("viewBox", [0, 0, 950, 750]);

    svg.append("rect").attr("id", "sea");

    const italy = {
      geometry: point([12.5674, 41.8719]),
      name: "義大利",
      value: 0
    };
    const greece = {
      geometry: point([21.8243, 39.0742]),
      name: "希臘",
      value: 76
    };
    const france = {
      geometry: point([2.2137, 46.2276]),
      name: "法國",
      value: 64
    };
    const spain = {
      geometry: point([-3.7492, 40.4637]),
      name: "西班牙",
      value: 44
    };
    const germany = {
      geometry: point([10.4515, 51.1657]),
      name: "德國",
      value: 35
    };
    const romania = {
      geometry: point([24.9668, 45.9432]),
      name: "羅馬尼亞",
      value: 23
    };

    const dotGapScale = d3
      .scaleLinear()
      .range([8, 20])
      .domain(
        d3
          .extent([greece, france, spain, germany, romania], d => d.value)
          .reverse()
      );

    const points = [italy, greece, france, spain, germany, romania];

    const greatCircles = [
      lineSliceAlong(greatCircle(italy.geometry, greece.geometry), 100, 10000),
      lineSliceAlong(greatCircle(italy.geometry, france.geometry), 100, 10000),
      lineSliceAlong(greatCircle(italy.geometry, spain.geometry), 120, 10000),
      lineSliceAlong(greatCircle(italy.geometry, germany.geometry), 50, 10000),
      lineSliceAlong(greatCircle(italy.geometry, romania.geometry), 100, 10000)
    ];
    const projection = d3
      .geoConicEquidistant()
      .rotate([-19.0, 0.0])
      .center([-10.0, 48.5])
      .parallels([-0.0, 55.0])
      .scale(2000)
      .precision(0.1);

    const path = d3.geoPath().projection(projection);

    svg
      .append("g")
      .selectAll("path")
      .data(world.features)
      .join("path")
      .attr("class", "polygon")
      .classed("affected", d =>
        ["Italy", "Germany", "Greece", "France", "Romania", "Spain"].includes(
          d.properties.NAME
        )
      )
      .attr("d", path);

    svg.selectAll(".affected").raise();

    svg
      .append("g")
      .selectAll(".line")
      .data(greatCircles)
      .join("path")
      .attr("class", (d, i) => `line${i + 1}`)
      .classed("line", true)
      .attr("d", d => `${path(d)} h0`)
      .style(
        "stroke-dasharray",
        (d, i) => `1 ${dotGapScale(points[i + 1].value)}`
      );

    svg
      .append("g")
      .selectAll("text")
      .data(points)
      .join("text")
      .attr("class", "locationLabel")
      .attr(
        "transform",
        d =>
          `translate(${projection(d.geometry.geometry.coordinates)[0]}, ${
            projection(d.geometry.geometry.coordinates)[1]
          })`
      )
      .text(d => `${d.name} ${d.value || ""}`);
  }
};
</script>

<style>
#map {
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
  stroke: black;
  stroke-width: 10px;
  fill: none;
  animation: dash 30s linear infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: -1000;
  }
}

.location {
  stroke: black;
  fill: white;
  stroke-width: 2px;
}
.locationLabel {
  text-anchor: middle;
  alignment-baseline: middle;
  font-size: 1.25rem;
  fill-opacity: 0.8;
}
</style>
