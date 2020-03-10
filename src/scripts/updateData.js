const fs = require("fs");
const request = require("request");
const csv = require("csvtojson");
const path = require("path");

function requestAsync(url) {
  return new Promise((resolve, reject) => {
    request(url, (err, response, body) => {
      if (err) return reject(err, response, body);
      resolve(body);
    });
  });
}

const urls = [
  "https://script.google.com/macros/s/AKfycbzlwh5YaMCP6JQcCO_hzZKQSFTJQT65UvBp5AHDojAD-AjhSJ3D/exec",
  "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv",
  "https://od.cdc.gov.tw/eic/Age_County_Gender_19Cov.json"
];

/* Works as of Node 7.6 */
Promise.all(urls.map(requestAsync)).then(data => {
  fs.writeFileSync(
    path.resolve(__dirname, "../../public/data/JHU-latest.json"),
    JSON.stringify(JSON.parse(data[0]).user)
  );

  csv()
    .fromString(data[1])
    .then(csvRow => {
      fs.writeFileSync(
        path.resolve(__dirname, "../../public/data/JHU-series.json"),
        JSON.stringify(csvRow)
      );
    });

  fs.writeFileSync(
    path.resolve(__dirname, "../../public/data/taiwan-cases.json"),
    JSON.stringify(JSON.parse(data[2]))
  );
});
