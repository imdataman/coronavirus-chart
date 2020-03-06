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
    d3.csv(
      "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv",
      ready
    );

    function ready(error, result) {
      if (error) throw error;

      //   const CountryList = [
      //     { en: "Iran", zh: "伊朗" },
      //     { en: "South Korea", zh: "南韓" },
      //     { en: "Taiwan", zh: "台灣" },
      //     { en: "Italy", zh: "義大利" },
      //     { en: "US", zh: "美國" }
      //   ];

      function addvector(a, b) {
        return a.map((e, i) => e + b[i]);
      }

      const CountryList = ["Mainland China", "South Korea", "Italy", "Iran", "Germany", "France", "Japan", "Spain", "US", "Taiwan"];

      let SelectedCountries = result.filter(d =>
        CountryList.includes(d["Country/Region"])
      );

      SelectedCountries.forEach(d => {
        d.Confirmed = Object.entries(d)
          .map(j => +j[1])
          .slice(4)
          .map((d, i, arr) => i > 0 ? arr[i] - arr[i - 1] > 0 ? arr[i] - arr[i - 1] : 0 : d);
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
        const MaxX = d3.max(d.Confirmed);
        d.Confirmed = d.Confirmed.map(d => d / MaxX);
      });

      const parseTime = d3.timeParse("%m/%d/%y");

      const dates = Object.entries(SelectedCountries[0])
        .map(j => j[0])
        .slice(4)
        .map(j => parseTime(j));

      const style = window.getComputedStyle(
        document.getElementById("joy"),
        null
      );
      const width = +style.getPropertyValue("width").match(/[\d]+/)[0];
      const margin = { top: 0, right: 0, bottom: 30, left: 110 };
      const chartWidth = width - margin.left - margin.right;

      const lineHeight = 100;
      const unitLength = lineHeight * 0.9;
      const chartHeight = SelectedCountries.length * lineHeight;

      const ProximityParameter = 0.4

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

    const SVGHeight =y(SelectedCountries[CountryList.length - 1]["Country/Region"]) * ProximityParameter +
            y.bandwidth()

      d3.select("#joy")
        .append("svg")
        .attr("id", "joyplot")
        .attr(
          "height",
          SVGHeight + margin.bottom
        )
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
            y(d["Country/Region"]) * ProximityParameter +
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
        .attr("y", d => y(d["Country/Region"]) * ProximityParameter + y.bandwidth() - 12)
        .attr("x", margin.left - 10)
        .text(d => d["Country/Region"]);

      joyplot.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + margin.left + "," + SVGHeight + ")")
      .call(d3.axisBottom(x)
      .ticks(d3.timeMonth)
              .tickFormat(d3.timeFormat("%-m")))
      .selectAll("text")	
        .style("text-anchor", "middle")
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
    stroke-width: 2;
    fill: FireBrick;
}

.axis {
    font-size: 16px;
}
</style>
