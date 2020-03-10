<template>
  <div id="joy"></div>
</template>

<script>
const d3 = Object.assign(
  {},
  require("d3-request"),
  require("d3-selection"),
  require("d3-scale"),
  require("d3-array"),
  require("d3-collection"),
  require("d3-axis"),
  require("d3-time-format"),
  require("d3-shape"),
  require("d3-time")
);

export default {
  name: "Joyplot",
  mounted() {
    d3.json("./data/JHU-series.json", ready);

    function ready(error, result) {
      if (error) throw error;

      const CountryDictionary = [
        { en: "Iran", zh: "伊朗" },
        { en: "South Korea", zh: "南韓" },
        { en: "Taiwan", zh: "台灣" },
        { en: "Italy", zh: "義大利" },
        { en: "US", zh: "美國" },
        { en: "Mainland China", zh: "中國大陸" },
        { en: "France", zh: "法國" },
        { en: "Germany", zh: "德國" },
        { en: "Japan", zh: "日本" },
        { en: "Spain", zh: "西班牙" },
        { en: "UK", zh: "英國" }
      ];

      function addvector(a, b) {
        return a.map((e, i) => e + b[i]);
      }

      const CountryList = [
        "Mainland China",
        "South Korea",
        "Italy",
        "Iran",
        "Germany",
        "France",
        "UK",
        "Japan",
        "Spain",
        "US",
        "Taiwan"
      ];

      let SelectedCountries = result.filter(d =>
        CountryList.includes(d["Country/Region"])
      );

      SelectedCountries.forEach(d => {
        d.Confirmed = Object.entries(d)
          .map(j => +j[1])
          .slice(4)
          .map((d, i, arr) =>
            i > 0 ? (arr[i] - arr[i - 1] > 0 ? arr[i] - arr[i - 1] : 0) : d
          );
      });

      const ProblematicCountries = d3
        .nest()
        .key(d => d["Country/Region"])
        .rollup(d => d.length)
        .entries(SelectedCountries)
        .filter(d => d.value > 1)
        .map(d => d.key);

      function AggregateCountry(country) {
        const CountryTotal = SelectedCountries.filter(
          d => d["Country/Region"] === country
        );

        SelectedCountries = SelectedCountries.filter(
          d => d["Country/Region"] !== country
        );

        const CountryTotalCleaned = {};

        CountryTotalCleaned["Country/Region"] = country;
        CountryTotalCleaned["Confirmed"] = CountryTotal.map(
          d => d.Confirmed
        ).reduce((a, b) => addvector(a, b));

        SelectedCountries.push(CountryTotalCleaned);
      }

      ProblematicCountries.forEach(AggregateCountry);

      SelectedCountries.forEach(d => {
        const MaxX = 15000;
        d.Confirmed = d.Confirmed.map(d => d / MaxX);
        d.order = CountryList.findIndex(j => j === d["Country/Region"]);
      });

      SelectedCountries = SelectedCountries.sort((a, b) => b.order - a.order);

      const parseTime = d3.timeParse("%m/%d/%y");

      const dates = Object.entries(SelectedCountries[0])
        .map(j => j[0])
        .slice(4)
        .map(j => parseTime(j));

      const width = document.getElementById("joy").offsetWidth;
      const margin = { top: 0, right: 10, bottom: 30, left: 80 };
      const chartWidth = width - margin.left - margin.right;

      const lineHeight = 100;
      const unitLength = lineHeight * 6;
      const chartHeight = SelectedCountries.length * lineHeight;

      const ProximityParameter = 0.4;

      const y = d3
        .scaleBand()
        .range([0, chartHeight])
        .padding(0);

      const x = d3.scaleTime().range([0, chartWidth]);

      x.domain(d3.extent(dates));
      y.domain(SelectedCountries.map(d => d["Country/Region"]));

      var YLine = d3
        .scaleLinear()
        .range([unitLength, 0])
        .domain([0, 1]);

      const SVGHeight =
        y(SelectedCountries[CountryList.length - 1]["Country/Region"]) *
          ProximityParameter +
        y.bandwidth();

      d3.select("#joy")
        .append("svg")
        .attr("id", "joyplot")
        .attr("height", SVGHeight + margin.bottom)
        .attr("width", "100%");

      const joyplot = d3.select("#joyplot").append("g");

      const lines = joyplot
        .selectAll("path")
        .data(SelectedCountries)
        .enter()
        .append("g");

      lines
        .append("path")
        .attr("transform", function(d) {
          return (
            "translate(" +
            margin.left +
            "," +
            (y(d["Country/Region"]) * ProximityParameter -
              unitLength +
              lineHeight) +
            ")"
          );
        })
        .datum(function(d) {
          return d.Confirmed;
        })
        .classed("joys", true)
        .attr(
          "d",
          d3
            .area()
            .curve(d3.curveBasis)
            .x(function(d, i) {
              return x(dates[i]);
            })
            .y1(function(d) {
              return YLine(d);
            })
            .y0(YLine(0))
        );

      lines
        .append("text")
        .attr("class", "lineLabel")
        .attr(
          "y",
          d => y(d["Country/Region"]) * ProximityParameter + y.bandwidth() - 12
        )
        .attr("x", margin.left - 10)
        .text(
          d => CountryDictionary.filter(j => j.en === d["Country/Region"])[0].zh
        );

      joyplot
        .append("g")
        .attr("class", "lineAxis")
        .attr("transform", "translate(" + margin.left + "," + SVGHeight + ")")
        .call(
          d3
            .axisBottom(x)
            .ticks(d3.timeMonth)
            .tickFormat(d3.timeFormat("%-m"))
        )
        .call(g => g.select(".domain").remove())
        .selectAll("text")
        .style("text-anchor", "middle");
    }
  }
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style>
.lineLabel {
  font-size: 16px;
  text-anchor: end;
}

.joys {
  fill-opacity: 0.7;
  stroke: black;
  stroke-width: 1;
  fill: FireBrick;
}

.lineAxis {
  font-size: 16px;
}

.lineAxis line {
  stroke: none;
}
</style>
