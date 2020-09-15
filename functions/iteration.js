
const puppeteer = require('puppeteer');
const pageURLCopart = process.env.COPART_SEARCH_URL;
const pageURLIaaI = [process.env.IAAI_SEARCH_URL_1, process.env.IAAI_SEARCH_URL_2];
const cookies = require('../cookie.json');
let getData = require('../functions/getData');
let copartCars = [];
let copartRefreshedCars = [];
let iaaiCars = [];
let iaaiRefreshedCars = [];
var fs = require('fs');



const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN)

let config = {
    "admin": 323049174 // id владельца бота
};
let isAdmin = (userId) => {
    return userId == config.admin;
};
let replyText = {
    "helloAdmin": "Привет админ, ждем сообщения от пользователей",
    "helloUser": "Приветствую, отправьте мне сообщение. Постараюсь ответить в ближайшее время.",
    "replyWrong": "Для ответа пользователю используйте функцию Ответить/Reply."
};

bot.command('start', (ctx) => {
    ctx.reply(isAdmin(ctx.message.from.id)
        ? replyText.helloAdmin
        : replyText.helloUser);
});
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

copartIteration()
setInterval(copartIteration, 600000);

// iaaiIteration()
// setInterval(iaaiIteration, 60000);

async function copartIteration() {
    console.log('Starts Copart Parsing')
    const browser = await puppeteer.launch({
        args: ['--enable-features=NetworkService'],
        ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();
    await page.setCookie(...cookies);
    try {
        await page.goto(pageURLCopart, { waitUntil: 'networkidle0', timeout: 0 });
        await page.setCacheEnabled(false);
        console.log('Copart page opened')
    } catch (error) {
        console.log(`Не удалось открыть страницу из-за ошибки: ${error}`);
    }
    let data = await page.evaluate(() => document.body.innerHTML);
    await browser.close()
    let currentTime = '  ---  ' + new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds();
    copartRefreshedCars = getData.parseDataCopart(data);
    console.log('BuyNow cars on auction Copart-   ', copartRefreshedCars.length, currentTime)
    newCars = getData.newCars(copartCars, copartRefreshedCars);
    soldCars = getData.soldCars(copartCars, copartRefreshedCars);
    if (soldCars) {
        soldCars.forEach(item => {
            bot.telegram.sendPhoto(323049174, { url: item.img }, { caption: `${item.make} ${item.model} ${item.year} ----  ${item.price} $ ${item.url} ` })
        })
    }
    if (copartRefreshedCars.length > 0) copartCars = copartRefreshedCars;

    if (newCars) {
        filteredCars = getData.userFilter(userParams, newCars);
        if (filteredCars.length < 20 && filteredCars.length > 0) {
            console.log(filteredCars)
            filteredCars.forEach(item => {
                bot.telegram.sendPhoto(-411753414, { url: item.img }, { caption: `${item.make} ${item.model} ${item.year} ----  ${item.price} $ ${item.url} ` })
            })
        }
    }


}


async function iaaiIteration() {
    console.log('Starts IAAI Parsing')
    const browser = await puppeteer.launch({
        args: ['--enable-features=NetworkService'],
        ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();
    try {
        await page.goto(pageURLIaaI[0], { waitUntil: 'networkidle0', timeout: 0 });
        await page.setCacheEnabled(false);
    } catch (error) {
        console.log(`Не удалось открыть страницу из-за ошибки: ${error}`);
    }
    let data = await page.evaluate(() => document.body.innerHTML);
    iaaiRefreshedCars = getData.parseDataIaai(data)


    try {
        await page.goto(pageURLIaaI[1], { waitUntil: 'networkidle0', timeout: 0 });
        await page.setCacheEnabled(false);
        console.log('IAAI page opened')
    } catch (error) {
        console.log(`Не удалось открыть страницу из-за ошибки: ${error}`);
    }
    data = await page.evaluate(() => document.body.innerHTML);
    iaaiRefreshedCars = iaaiRefreshedCars.concat(getData.parseDataIaai(data))  // данные с сайта
    await browser.close();
    let currentTime = '  ---  ' + new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds()
    console.log('BuyNow cars on auction IaaI-   ', iaaiRefreshedCars.length, currentTime)
    let path = 'iaai-data.json';
    let filteredCars;

    newCars = getData.newCars(iaaiCars, iaaiRefreshedCars);
    if (iaaiRefreshedCars.length > 0) iaaiCars = iaaiRefreshedCars;
    if (newCars) {
        filteredCars = getData.userFilter(userParams, newCars);
    }


    if (filteredCars === true && filteredCars.length > 0) {
        console.log('filteredCars IAAI', filteredCars);
        let file;
        if (fs.existsSync(path)) {
            file = fs.readFileSync(path);
            fs.unlinkSync(path)
        }
        let fileData = JSON.parse(file);
        fs.writeFileSync(path, JSON.stringify([...fileData, ...filteredCars]));
        bot.telegram.sendMessage(323049174, 'Новые машины добавлены');

    }

}