var express = require('express');
var router = express.Router();

router.use('/visualization', express.static(__dirname + '/convertedTrees'));

var getT = require('../modules/getTrees');

router.use(function (req, res, next) {
    getT.addTrees();
    next();
});


/* GET home page. */
router.get('/', function (req, res, next) {


    res.render('selectScreen', {
        trees: getT.getTrees()
    });

    getT.clearTrees();
    res.end();

});

router.get('/:name', function(req,res,next){

    res.render('visualPage',{
        treeName: req.params.name
    });
    //res.end();

});

module.exports = router;
