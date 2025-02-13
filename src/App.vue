<template>
  <div id="app">
    <transition>
      <div v-show="isShow" id="loading">
        <img id="loadingIcon" src="3.gif" />
      </div>
    </transition>
    <div id="content">
      <h1>六個表一次抓住新冠肺炎疫情重點</h1>
      <h2>
        隨著新冠肺炎疫情爆發，相關資訊越來越雜亂，《天下》整理國內外疫情現況、各國病例數趨勢以及台灣旅遊警示國家，讓你六個圖表一次掌握疫情最新資訊。
      </h2>
      <RiskMap />
      <h3>世界各國確診案例數飆升，中東與歐洲確診案例激增</h3>
      <p>
        全世界總感染人數已超過9萬人，全球已超過60個國家與地區淪陷，除了東亞疫情逐漸嚴峻外，歐洲與中東各自出現疫情爆發的狀況。
      </p>
      <b>世界各國確診病例數</b>
      <WorldMap :csv="csv" @ready="toggle" />
      <h3>疫情從亞洲開始延燒，南韓、日本公主號接連大爆發大型感染</h3>
      <p>
        中國境外第一起確診案例發生在泰國，接著香港、日本、台灣等地陸續出現確診個案，疫情於1月31日開始爆發，新加坡於2月初首傳人傳人案例，接著停靠日本橫濱的鑽石公主號傳出一天新增41個病例，成為僅次中國的感染區，公主號內部感染者已超過700例，船隻停靠的日本國內確診案例也急劇上升。2月中南韓因大邱教會感染事件，已超越公主號成為第二大感染國，疫情持續升溫中。
      </p>
      <Joyplot />
      <h3>武漢封鎖已超過一個月，中國境內疫情以湖北、廣東、浙江較為嚴重</h3>
      <p>
        新冠肺炎源頭武漢市自1月23日封城以來已超過一個月，世界衛生組織（WHO）於日前記者會表示，中國的疫情已達高峰，本月將逐漸趨緩，但中國確診人數仍每日增加，以湖北、廣東、浙江地區人數最多。
      </p>
      <b>中國各省份確診病例數</b>
      <ChinaMap :csv="csv" />
      <p>
        歐洲新冠肺炎疫情自2月底逐漸失控，以義大利確診人數上升最快速，已突破7000例，義大利政府已下令封鎖米蘭、威尼斯等大城。由於歐洲大陸交通便捷，病毒迅速蔓延，歐洲各國確診人數越來越多，每日出現確診病例的國家也持續增加。
      </p>
      <b>歐洲各國確診病例數</b>
      <EuropeMap :csv="csv" />
      <h3>台灣境內確診個案已超過30例</h3>
      <p>
        中央流行疫情指揮中心應變官莊人祥表示，因為初期確診新冠肺炎的個案人數較少，如果公布所在地有被指認的風險，但隨確診數目增加，較不會有疑慮。
      </p>
      <b>台灣境內確診病例數</b>
      <TaiwanMap />
      <h3>台灣確診病例關係圖，已發生三起家庭群聚</h3>
      <p>
        目前發生的三起家庭群聚案件包含：病例19白牌司機、病例24兩年無出國史老婦、病例27無出國史80歲老翁，後兩起家庭群聚接還在追蹤感染源中。
      </p>
      <h3>各國旅遊警示與返國措施</h3>
      <p>
        鄰近台灣的亞洲國家目前以中國、南韓、日本為疫情較嚴重的地區，中國地區與南韓為第三級旅遊警戒地區，中國地區與自2月27日後自南韓回國的國人需要居家檢疫14天。
      </p>
      <div
        ref="flourishTable"
        class="flourish-embed flourish-table"
        data-src="visualisation/1497079"
      ></div>
      <iframe
        id="datawrapper-chart-SxQG7"
        title="採購經理人指數變化"
        aria-label="Arrow Plot"
        src="//datawrapper.dwcdn.net/SxQG7/5/"
        scrolling="no"
        frameborder="0"
        style="width: 0; min-width: 100% !important; border: none;"
        height="414"
      ></iframe>
    </div>
  </div>
</template>

<script>
import ChinaMap from "./components/ChinaMap.vue";
import EuropeMap from "./components/EuropeMap.vue";
import WorldMap from "./components/WorldMap.vue";
import TaiwanMap from "./components/TaiwanMap.vue";
import Joyplot from "./components/Joyplot.vue";
import RiskMap from "./components/RiskMap.vue";

const d3 = Object.assign({}, require("d3-fetch"));

export default {
  name: "App",
  components: {
    ChinaMap,
    EuropeMap,
    WorldMap,
    TaiwanMap,
    Joyplot,
    RiskMap
  },
  data() {
    return {
      csv: [],
      isShow: true
    };
  },
  mounted() {
    d3.json("./data/JHU-latest.json").then(d => {
      this.csv = d;
    });

    let foo = document.createElement("script");
    foo.setAttribute(
      "src",
      "https://public.flourish.studio/resources/embed.js"
    );
    this.$refs.flourishTable.appendChild(foo);

    window.addEventListener("message", function(a) {
      if (void 0 !== a.data["datawrapper-height"])
        for (var e in a.data["datawrapper-height"]) {
          var t =
            document.getElementById("datawrapper-chart-" + e) ||
            document.querySelector("iframe[src*='" + e + "']");
          t && (t.style.height = a.data["datawrapper-height"][e] + "px");
        }
    });
  },
  methods: {
    toggle: function() {
      this.isShow = !this.isShow;
    }
  }
};
</script>

<style>
#content {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  padding: 0 10%;
  overflow: auto;
}

#loadingIcon {
  position: fixed; /* change this to fixed */
  top: 50%;
  left: 50%;
}

#loading {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  background-color: white;
  padding: 0;
}

.v-leave {
  opacity: 1;
}
.v-leave-active {
  transition: opacity 0.5s;
}
.v-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  #content {
    padding: 0;
  }
}
</style>
