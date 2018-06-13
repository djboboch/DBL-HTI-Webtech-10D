var express = require('express');
var router = express.Router();


var getT = require('../modules/getTrees');



/* GET home page. */
router.get('/', function(req, res, next) {
    getT.addTrees();


    res.render('index', {
        trees: getT.getTrees()
    });

  getT.clearTrees();

});

module.exports = router;
