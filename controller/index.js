const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const pageURL = process.env.SEARCH_URL;
const cookies = require('../cookie.json');
let carsData = require('../myjsonfile'); //- for tests
let cars = [];
let refreshedCars = [];
let viewResult;

const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => ctx.reply('Welcomedsdss !'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => {
  console.log(ctx)
  ctx.reply('Hey there fvsdfv')
})
bot.launch()


setInterval((async () => {
  console.log('function starts')
  const browser = await puppeteer.launch({
    args: ['--enable-features=NetworkService'],
    ignoreHTTPSErrors: true
  });

  const page = await browser.newPage();
  await page.setCookie(...cookies);
  try {
    await page.goto(pageURL, { waitUntil: 'networkidle0', timeout: 0 });
    await page.setCacheEnabled(false);
    console.log('Page opened')
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
  console.log('BuyNow cars on auction -   ', refreshedCars.length)

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
  if (finalNewCars.length < 200) {
    if (finalNewCars.length > 0) {
      console.log(finalNewCars)
      finalNewCars.forEach(item => {
        bot.telegram.sendPhoto(-411753414, { url: item.img }, { caption: `${item.make} ${item.model} ${item.year} ----  ${item.price} $ ${item.url} ` })
      })
    }
  }
  else {
    console.log('over 200 results')
  }

  // -411753414 323049174
  if (refreshedCars.length > 10) {
    cars = refreshedCars;
  }


}), 60000);




















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
      var $ = cheerio.load(data);
      cars = []
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
          cars.push(car);
        });

      await browser.close();
      cars.sort(function (a, b) { return b.price - a.price });
      viewResult = cars
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


/***
 *
 * Name: Arthur's Copart Search
 *
 * Bot creation
 *
 * username - arthurs_copart_bot
 *
 * url: t.me/arthurs_copart_bot
 *
 * token: 1212886084:AAE-0jm3-Q2VDTJmK1pQA-3zUPvQ92Gn2HM
 */