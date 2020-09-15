var express = require('express');
var router = express.Router();
const controller = require('../controller/')

/* GET home page. */
router.get('/copart', controller.getAllCopart);
router.get('/iaai', controller.getAllIaai);
router.get('/iaai-price', controller.getAllIaaiByPrice);
router.post('/price', controller.getItemsByPrice);
router.post('/odometer', controller.getItemsByOdometer);


module.exports = router;