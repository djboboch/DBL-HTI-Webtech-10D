const fs = require('fs');
const treeFolder = 'convertedTrees';

var trees = [];

exports.addTrees = function () {
        var files = fs.readdirSync(treeFolder);


        files.forEach(file => {
            var pos = file.indexOf('.');
            trees.push(file.slice(0, pos));
        });
};

exports.clearTrees = function () {
    trees = [];
};

exports.getTrees = function () {
    return trees;
};




