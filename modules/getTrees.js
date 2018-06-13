const fs = require('fs');
const treeFolder = 'convertedTrees';

var trees;

exports.addTrees = function()
{
    trees = fs.readdirSync(treeFolder)


};

exports.clearTrees = function(){
    trees = [];
};

exports.getTrees = function(){
    return trees;
};




