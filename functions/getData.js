const cheerio = require('cheerio');



module.exports = {
    parseDataCopart: function (data) {
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
                car.run = $(element).find('td:nth-child(4) > span.highlighticon > a > span > img').attr('class')
                car.make = $(element).find('td:nth-child(5) span').text();
                car.model = $(element).find('td:nth-child(6) span').text();
                car.year = $(element).find('td:nth-child(4) span').text();
                car.odometer = parseFloat(odometer.slice(0, -1).replace(',', ''));
                car.url = 'https://www.copart.com' + url.substring(1);
                car.img = $(element).find('td.sorting_1 > div.imgpath.cursor-pointer > a > img').attr('lazy-src');
                console.log(parseFloat(price.slice(21, -4).replace(',', '').match(num)))
                if (parseFloat(price.slice(21, -4).replace(',', '').match(num)) !== NaN) {
                    car.price = parseFloat(price.slice(21, -4).replace(',', '').match(num)[0]);
                    refreshedCars.push(car);
                }
                else { refreshedCars.push([]); }
            });
        return refreshedCars
    },
    parseDataIaai: function (data) {
        var $ = cheerio.load(data);
        refreshedCars = []
        $('body > section > main > section.section.pt-0 > section > div > div.table.table-advanced.table--image-view > div').find('.table-row')
            .each(function (index, element) {
                let car = {};
                let price = $(element).find('div.table-cell.table-cell--actions > p.text-lg > span').text();
                let odometer = $(element).find('div.table-cell.table-cell--data > div > div:nth-child(3) > ul > li:nth-child(1) > span.data-list__value').text();
                let num = /\d+/;
                let fullCarName = $(element).find('div.table-cell.table-cell--data > h3 > a').text().split(" ")
                fullCarName.splice(0, 2)
                car.id = $(element).find('div.table-cell.table-cell--data > div > div:nth-child(1) > ul > li:nth-child(1) > span.data-list__value').text()
                car.run = $(element).find('div.table-cell.table-cell--data > div > div:nth-child(3) > ul > li:nth-child(2) > span').text()
                car.make = $(element).find('div.table-cell.table-cell--data > h3 > a').text().split(" ")[1]
                car.model = fullCarName.join(' ')
                car.year = $(element).find('div.table-cell.table-cell--data > h3 > a').text().slice(0, 4)
                car.odometer = parseFloat(odometer.slice(0, -4).replace(',', ''));
                car.url = $(element).find('div.table-cell.table-cell--data > h3 > a').attr('href');
                car.img = $(element).find('div.table-cell.table-cell-no-padding.table-cell--img > a > img').attr('data-original');
                car.addTime = Date.now();
                let priceNum = parseFloat(price.slice(10).replace(',', '').match(num))
                if (priceNum !== null) {
                    car.price = priceNum;
                    refreshedCars.push(car);
                }

            });

        return refreshedCars
    },
    newCars: function (cars, refreshedCars) {
        if (cars.length > 0) {
            let lotNumbers = []
            let newCarsIds = [];
            let newCars = [];
            refreshedCars.forEach(e => { lotNumbers.push(e.id) })
            lotNumbers.forEach(lot => { if (!cars.find(car => car.id === lot)) newCarsIds.push(lot) })
            if (newCarsIds) {
                newCarsIds.forEach(id => { newCars.push(refreshedCars.find(car => car.id === id)) })
                return newCars
            }
        }

    },
    soldCars: function (cars, refreshedCars) {
        let oldLotNumbers = []
        let soldCarsIds = [];
        let soldCars = [];
        cars.forEach(e => oldLotNumbers.push(e.id))
        oldLotNumbers.forEach(lot => { if (!refreshedCars.find(car => car.id === lot)) soldCarsIds.push(lot) })
        soldCarsIds.forEach(id => soldCars.push(cars.find(car => car.id === id)))
        if (soldCars.length > 0 && soldCars.length <= 10) {
            return soldCars
        }
    },
    userFilter: function (userParams, newCars) {
        let result;
        if (userParams.maxPrice) { result = newCars.filter(car => car.price <= userParams.maxPrice) } else { result = newCars };
        if (userParams.runDrive === 'true') { result = result.filter(car => car.run === 'lotIcon-CERT-D') } else { result }
        if (userParams.odoFilter) { result = result.filter(car => car.odometer <= userParams.odoFilter) } else { result }
        return result;
    }
}