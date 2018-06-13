var d3 = require('d3');
var jsdom = require('jsdom');
var doc = jsdom.jsdom();
var sunburst = require('./sunburstVizualization');


var getSunburst = function (params) {

    var sunburst = sunburst()
        .data(params.data)
        .width(params.width)


}