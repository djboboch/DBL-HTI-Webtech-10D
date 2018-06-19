var express = require('express');
var router = express.Router();




var getT = require('../modules/getTrees');

router.use(function (req, res, next) {
    getT.addTrees();
    next();
});


/* GET home page. */
router.get('/', function (req, res, next) {


    res.render('visual', {
        trees: getT.getTrees()
    });

    getT.clearTrees();
    //res.end();

});

module.exports = router;
