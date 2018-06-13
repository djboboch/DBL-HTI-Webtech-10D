const fs = require('fs');
const treeFolder = 'convertedTrees';

var trees = [];

exports.addTrees = function()
{
    fs.readdir(treeFolder, function (err, files) {
        if(err) throw err;
        files.forEach(function (file) {
            trees.push(file);
        });
    });
};

exports.clearTrees = function(){
    trees = [];
};

exports.getTrees = function(){
    return trees;
};




