const fs = require('fs');

exports.checkDirectory = function () {

    if (fs.existsSync('./convertedTrees')){
        console.log("Directory, convertedTrees exist.")
    } else {
        fs.mkdir('./convertedTrees');
        console.log("Directory, convertedTrees has been created.")
    }

    if (fs.existsSync('./uploads')){
        console.log("Directory, uploads exist.")
    } else {
        fs.mkdir('./uploads');
        console.log("Directory, uploads has been created.")
    }

};
