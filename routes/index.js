var express = require('express');
var router = express.Router();
const controller = require('../controller/')

/* GET home page. */
router.get('/', controller.getAll);
router.get('/new-cars', controller.getNewItems);
router.post('/price', controller.getItemsByPrice);
router.post('/odometer', controller.getItemsByOdometer);


module.exports = router;