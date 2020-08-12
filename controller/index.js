const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const pageURL = process.env.SEARCH_URL;
const cookies = require('../cookie.json');
let getData = require('../functions/getData');
let cars = [];
let refreshedCars = [];
let viewResult;
let userParams = {
  maxPrice: process.env.MAX_PRICE,
  runDrive: process.env.RUN_N_DRIVE,
  odoFilter: process.env.ODO_FILTER
}
module.exports = {
  getAll: function (req, res, next) {
    (async () => {
      const browser = await puppeteer.launch({
        args: ['--enable-features=NetworkService'],
        ignoreHTTPSErrors: true
      });
      const page = await browser.newPage();
      await page.setCookie(...cookies);
      try {
        await page.goto(pageURL, { waitUntil: 'networkidle0', timeout: 0 });
        await page.setCacheEnabled(false);
      } catch (error) {
        console.log(`Не удалось открыть страницу из-за ошибки: ${error}`);
      }
      let data = await page.evaluate(() => document.body.innerHTML);
      await browser.close();
      cars = getData.parseData(data);
      filteredCars = getData.userFilter(userParams, cars);
      filteredCars.sort(function (a, b) { return b.price - a.price });
      viewResult = filteredCars
      res.render('index', { title: "All buynow cars", viewResult });
    })()
  },
  getNewItems: function (req, res, next) {
    (async () => {
      const browser = await puppeteer.launch({
        args: ['--enable-features=NetworkService'],
        ignoreHTTPSErrors: true
      });
      const page = await browser.newPage();
      await page.setCookie(...cookies);
      try {
        await page.goto(pageURL, { waitUntil: 'networkidle0', timeout: 0 });
        await page.setCacheEnabled(false);
      } catch (error) {
        console.log(`Не удалось открыть страницу из-за ошибки: ${error}`);
      }
      let data = await page.evaluate(() => document.body.innerHTML);
      var $ = cheerio.load(data);
      refreshedCars = []
      $('#serverSideDataTable').find('tbody tr')
        .each(function (index, element) {
          let car = {};
          let price = $(element).find('td:nth-child(14) > ul > li > ul > li:nth-child(4)').text();
          let odometer = $(element).find('td:nth-child(10) > span').text();
          let url = $(element).find('a.search-results').attr('href');
          let num = /\d+/;
          car.id = $(element).find('a.search-results').text()
          car.make = $(element).find('td:nth-child(5) span').text();
          car.model = $(element).find('td:nth-child(6) span').text();
          car.year = $(element).find('td:nth-child(4) span').text();
          car.odometer = parseFloat(odometer.slice(0, -1).replace(',', ''));
          car.url = 'https://www.copart.com' + url.substring(1);
          car.img = $(element).find('td.sorting_1 > div.imgpath.cursor-pointer > a > img').attr('lazy-src');
          car.price = parseFloat(price.slice(21, -4).replace(',', '').match(num)[0]);
          refreshedCars.push(car);
        });

      await browser.close();
      let lotNumbers = []
      refreshedCars.forEach(e => { lotNumbers.push(e.id) })
      let newCarsIds = [];
      lotNumbers.forEach(lot => {
        if (!cars.find(car => car.id === lot)) newCarsIds.push(lot)
      })
      let finalNewCars = []
      newCarsIds.forEach(id => {
        finalNewCars.push(refreshedCars.find(car => car.id === id))
      })
      viewResult = finalNewCars;
      if (refreshedCars.length > 10) {
        cars = refreshedCars;
      }

      res.render('index', { title: "New cars", viewResult });
    })()
  },
  getItemsByPrice: function (req, res, next) {
    let min = req.body.minPrice;
    let max = req.body.maxPrice;
    let filteredCars = cars.filter(x => x.price <= max)
    let final = filteredCars.filter(x => x.price > min);
    final.sort(function (a, b) {
      return b.price - a.price
    })
    viewResult = final
    res.render('index', { title: `Max - ${max} ; Min - ${min}`, viewResult });




  },
  getItemsByOdometer: function (req, res, next) {
    let min = req.body.minOdo;
    let max = req.body.maxOdo;
    let filteredCars = cars.filter(x => x.odometer <= max)
    let final = filteredCars.filter(x => x.odometer > min);
    final.sort(function (a, b) {
      return b.price - a.price
    })
    viewResult = final
    res.render('index', { title: `Max Odometer- ${max} ; Min Odometer - ${min}`, viewResult });
  }
}