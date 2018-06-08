var express = require('express');
var router = express.Router();

const script = require('public/javascripts/visual1');


/* GET visualizations page */
router.get('/', function(req, res, next) {

    res.render('visualization');


});

module.exports = router;
