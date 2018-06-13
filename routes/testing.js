var express = require('express');
var router = express.Router();




var getT = require('../modules/getTrees');

router.use(function(req,res,next){
    getT.addTrees();
    interval
    next();
});



/* On get request */
router.get('/' ,function(req,res) {

    res.send(getT.getTrees());

    getT.clearTrees();
    res.end();
});


// router.post('/d3/:chartType.svg', function(req, res){
//     req.on('data', function (chunk) {
//         var content = {};
//         var output = "";
//
//         try {
//             // Validate request content as JSON
//             content = JSON.parse(chunk.toString());
//             output = require('../modules/d3')(req.params.chartType, content.data);
//         }
//         catch (e) {
//             // If not a valid JSON, returns an error 400
//             response.headers['Content-Type'] = 'text/plain';
//             response.status = 400;
//             output = "400 Bad request " + e;
//         }
//
//         res.writeHead(response.status, response.headers);
//
//         res.end(JSON.stringify(output));
//     });
// });

module.exports = router;
