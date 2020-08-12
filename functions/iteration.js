
const puppeteer = require('puppeteer');
const pageURL = process.env.SEARCH_URL;
const cookies = require('../cookie.json');
let getData = require('../functions/getData');
let cars = [];
let refreshedCars = [];

const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => ctx.reply('Welcomedsdss !'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => {
  console.log(ctx.message.chat.id)
  ctx.reply('Hi')
})
bot.launch();

let userParams = {
    maxPrice: process.env.MAX_PRICE,
    runDrive: process.env.RUN_N_DRIVE,
    odoFilter: process.env.ODO_FILTER
}

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
    await browser.close();
    refreshedCars = getData.parseData(data);

    newCars = getData.newCars(cars, refreshedCars);
    soldCars = getData.soldCars(cars, refreshedCars);
    if (soldCars) {
        soldCars.forEach(item => {
            bot.telegram.sendPhoto(323049174, { url: item.img }, { caption: `${item.make} ${item.model} ${item.year} ----  ${item.price} $ ${item.url} ` })
        })
    }
    if (refreshedCars.length > 0) cars = refreshedCars;
    
    filteredCars = getData.userFilter(userParams, newCars);
    if (filteredCars.length < 20 && filteredCars.length > 0) {
        console.log(filteredCars)
        filteredCars.forEach(item => {
            bot.telegram.sendPhoto(-411753414, { url: item.img }, { caption: `${item.make} ${item.model} ${item.year} ----  ${item.price} $ ${item.url} ` })
        })
    }
    else {
        console.log('nothing to show or results incorrect')
    }
}), 60000);