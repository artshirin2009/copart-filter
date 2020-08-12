
let newData = require('./new-data'); //- for tests
let oldData = require('./old-data'); //- for tests

let cars = [];
let refreshedCars = [];


console.log('function starts')
refreshedCars = newData;
cars = oldData;

/**
 * Sold cars finder
 */
let oldLotNumbers = []
let soldCarsIds = [];
let soldCars = [];
new Promise(function (resolve, reject) {
    console.log('Sold cars search start')
    resolve(oldLotNumbers)
    reject('Params not found')
})
    .then(() => {
        cars.forEach(e => { oldLotNumbers.push(e.id) })
        return oldLotNumbers
    })
    .then(oldLotNumbers => {
        oldLotNumbers.forEach(lot => {
            if (!refreshedCars.find(car => car.id === lot)) soldCarsIds.push(lot)
        })
        return soldCarsIds
    }).then(soldCarsIds => {
        soldCarsIds.forEach(id => {
            soldCars.push(cars.find(car => car.id === id))
        })
        console.log('Sold cars search finished', soldCars)
    })
/**
 * 
 */





//console.log('BuyNow cars on auction -   ', refreshedCars.length)
let lotNumbers = []
refreshedCars.forEach(e => { lotNumbers.push(e.id) })
let newCarsIds = [];
lotNumbers.forEach(lot => {
    if (!cars.find(car => car.id === lot)) newCarsIds.push(lot)
})
let newCars = []
newCarsIds.forEach(id => {
    newCars.push(refreshedCars.find(car => car.id === id))
})
if (refreshedCars.length > 5) {
    cars = refreshedCars;
}


let userParams = {
    runDrive: true,
    odoFilter: 61000
}
new Promise(function (resolve, reject) {
    resolve(userParams)
    reject('Params not found')
})
    .then(userParams => {
        if (userParams.runDrive) { return newCars.filter(car => car.run === 'lotIcon-CERT-D') }
        else
            return newCars
    })
    .then(result => {
        if (!userParams.odoFilter) {
            return result
        } else {
            return result.filter(car => car.odometer <= userParams.odoFilter)
        }
    })
    .then(result => {
        if (result.length < 200) {
            if (result.length > 0) {
                //console.log(result)
            }
        }
        else {
            console.log('over 200 results')
        }
    })

    .catch(error => console.log(error))

