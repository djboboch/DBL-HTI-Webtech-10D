var express = require('express');
var router = express.Router();

//Nessecary modules
var fileUpload = require('express-fileupload');
var convToJSON = require('../modules/convertToJson');
var fs = require('fs');
var getT = require('../modules/getTrees');

router.use(fileUpload());


/* POST request for uploading files */
router.post('/', function (req, res, next) {

    //Saves the file path name into variables
    let file = req.files.file;
    let path = 'uploads/' + file.name;

    if (!req.files)
        return res.status(400).send("No files were uploaded.");

    file.mv(path, function (err) {
        if (err) {
            return res.status(500).send(err);
        }
    });

    //Call the converter module
    convToJSON.runConverter();
    console.log("Converting the " + req.files.file.name);

    //Waits 5 seconds before deleting the file from the server for the converter to finish
    setTimeout(function(){

        fs.unlink(path, function(err){
            if(err) throw err;
            console.log( req.files.file.name + " has been deleted from uploads!!")
        });

    },5000);


    getT.addTrees();
    res.redirect('/');


});

module.exports = router;
