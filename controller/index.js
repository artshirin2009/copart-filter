const puppeteer = require('puppeteer');
const pageURLCopart = process.env.COPART_SEARCH_URL;
const pageURLIaaI = [process.env.IAAI_SEARCH_URL_1, process.env.IAAI_SEARCH_URL_2];
const cookies = require('../cookie.json');
let getData = require('../functions/getData');
var fs = require('fs');

let viewResult, filteredCars;
let userParams = {
  maxPrice: 5000,
  runDrive: process.env.RUN_N_DRIVE,
  odoFilter: process.env.ODO_FILTER
}
module.exports = {
  getAllCopart: async function (req, res, next) {
    let cars = [];
    const browser = await puppeteer.launch({
      args: ['--enable-features=NetworkService'],
      ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();
    await page.setCookie(...cookies);
    try {
      await page.goto(pageURLCopart, { waitUntil: 'networkidle0', timeout: 0 });
      await page.setCacheEnabled(false);
    } catch (error) {
      console.log(`Не удалось открыть страницу из-за ошибки: ${error}`);
    }
    let data = await page.evaluate(() => document.body.innerHTML);

    cars = getData.parseDataCopart(data);
    await browser.close();
    console.log('Opening copart page under filtered cars')
    filteredCars = getData.userFilter(userParams, cars);
    filteredCars.sort(function (a, b) { return b.price - a.price });
    viewResult = filteredCars;
    res.render('index', { title: "All buynow cars", viewResult, siteImg: "images/logo.svg" });

  },
  getAllIaai: async function (req, res, next) {
    let cars = [];
    let rawdata = fs.readFileSync('iaai-data.json');
    cars = JSON.parse(rawdata);

    filteredCars = getData.userFilter(userParams, cars);
    filteredCars.sort(function (a, b) { return b.addDate - a.addDate });
    viewResult = filteredCars
    res.render('index', { title: "All buynow cars", viewResult, siteImg: "images/iaai.jpeg" });
  },
  getAllIaaiByPrice: async function (req, res, next) {
    let cars = [];
    let rawdata = fs.readFileSync('iaai-data.json');
    cars = JSON.parse(rawdata);

    filteredCars = getData.userFilter(userParams, cars);
    filteredCars.sort(function (a, b) { return b.price - a.price });
    viewResult = filteredCars
    res.render('index', { title: "All buynow cars", viewResult, siteImg: "images/iaai.jpeg" });
  },
  getItemsByPrice: function (req, res, next) {
    let min = req.body.minPrice;
    let max = req.body.maxPrice;
    let final = filteredCars.filter(x => x.price <= max).filter(x => x.price > min)
    final.sort(function (a, b) {
      return b.price - a.price
    })
    viewResult = final
    res.render('index', { title: `Max - ${max} ; Min - ${min}`, viewResult });




  },
  getItemsByOdometer: function (req, res, next) {
    let min = req.body.minOdo;
    let max = req.body.maxOdo;
    let final = filteredCars.filter(x => x.odometer <= max).filter(x => x.odometer > min)
    final.sort(function (a, b) {
      return b.price - a.price
    })
    viewResult = final
    res.render('index', { title: `Max Odometer- ${max} ; Min Odometer - ${min}`, viewResult });
  }
}