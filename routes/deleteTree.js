var express = require('express');
var router = express.Router();

const fs = require('fs');

const dirLocation = './convertedTrees/';

router.post('/:treeName', function(req,res){

    fs.unlink(dirLocation + req.params.treeName +'.json', (err) => {
        if (err) throw err;

        console.log(req.params.treeName + " was deleted from convertedTrees directory.");
    });

    res.end();
});


module.exports = router;
