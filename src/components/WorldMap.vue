<template>
  <div id="world"></div>
</template>

<script>
const d3 = Object.assign(
  {},
  require("d3-selection"),
  require("d3-geo"),
  require("d3-scale"),
  require("d3-array"),
  require("d3-axis")
);

export default {
  name: "WorldMap",
  props: {
    csv: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  watch: {
    csv: function() {
      const WorldData = this.csv.filter(
        d => d["Country/Region"] !== "" && d["Country/Region"] !== "China"
      );

      const CountryCases = d3
        .groups(WorldData, d => d["ChineseNameCountry"])
        .map(d => ({
          key: d[0],
          value: d3.sum(d[1].map(j => +j["Confirmed"])),
          area: WorldData.filter(j => j.ChineseNameCountry === d[0])[0].area
        }))
        .sort((a, b) => b.value - a.value)
        .filter(d => d.value >= 10);

      const width = document.getElementById("world").offsetWidth;
      const margin = { top: 60, right: 60, bottom: 30, left: 110 };
      const tableWidth = width - margin.left - margin.right;
      const maxX = CountryCases[0].value;

      function drawTable(tableData, target) {
        const areaName = tableData[0].area;
        const barHeight = 25;
        const unitLength = barHeight / 0.7;
        const tableHeight = tableData.length * unitLength;

        d3.select(target)
          .append("svg")
          .attr("id", areaName)
          .attr("height", tableHeight + margin.top)
          .attr("width", "100%");

        d3.select(target)
          .select("#" + areaName)
          .append("text")
          .attr("class", "tableTitle")
          .attr("x", 0)
          .attr("y", margin.top / 2 + 12)
          .text(areaName);

        const svg2 = d3
          .select(target)
          .select("#" + areaName)
          .append("g")
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
          );

        const y = d3
          .scaleBand()
          .range([0, tableHeight])
          .padding(0);

        const x = d3.scaleLinear().range([0, tableWidth]);

        x.domain([0, maxX]);
        y.domain(tableData.map(d => d.key));

        const bars = svg2
          .selectAll("g")
          .data(tableData)
          .join("g");

        bars
          .append("rect")
          .attr("class", "bar")
          .attr("width", d => x(d.value))
          .attr("y", d => y(d["key"]))
          .attr("height", barHeight);

        bars
          .append("text")
          .attr("class", "tableLabel")
          .attr("y", d => y(d.key) + y.bandwidth() / 2)
          .attr("x", d => x(d.value) + 3)
          .text(d => d.value);

        svg2
          .append("g")
          .call(d3.axisLeft(y))
          .call(g => g.select(".domain").remove())
          .call(g => g.selectAll("line").remove())
          .classed("tableText", true)
          .attr("transform", "translate(0 , -" + (barHeight / 2 - 7) + ")");
      }

      const uniqueItems = d3
        .groups(CountryCases, d => d["area"])
        .map(d => ({
          key: d[0],
          value: d3.sum(d[1].map(j => +j["value"]))
        }))
        .sort((a, b) => b.value - a.value)
        .map(d => d.key);

      uniqueItems.forEach(d =>
        drawTable(
          CountryCases.filter(j => j.area === d),
          this.$el
        )
      );

      d3.selectAll(".tableText")
        .filter(function() {
          return d3.select(this).text() === "台灣";
        })
        .attr("id", "TaiwanBar");

      this.$nextTick(function() {
        this.$emit("ready");
      });
    }
  }
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style>
.bar {
  fill: FireBrick;
}

.tableText {
  font-size: 20px;
}

.tableLabel {
  font-size: 20px;
  fill: black;
}

.tableTitle {
  font-size: 24px;
}

#TaiwanBar {
  font-weight: bold;
}

@media (max-width: 480px) {
  .tableText {
    font-size: 12px;
  }

  .tableLabel {
    font-size: 12px;
  }

  .tableTitle {
    font-size: 16px;
  }
}
</style>
