var express = require('express');
var router = express.Router();








/* GET home page. */
router.get('/', function (req, res, next) {


   res.send(req.params.name);
   res.end();



});

module.exports = router;
