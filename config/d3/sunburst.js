var d3 = require('d3');
var d3v4 = require('d3v4');

module.exports = function (document, wrapper, data) {
    // EDITING STARTS HERE



    /*
     * Use this variable instead of d3.select("body").append("svg")
     * */
    // var svg = d3.select("body").append("svg")
    const marginSunburst = {top: 400, right: 300, bottom: 400, left: 300},
        radiusSunburst = Math.min(marginSunburst.top, marginSunburst.right, marginSunburst.bottom, marginSunburst.left) - 10,
        colorSunburst = d3v4.scaleOrdinal(d3v4.schemeCategory20),
        circleRadians = Math.PI;

    var sunburstSvg = wrapper
            .attr("id", 'sunburstVisual')
            .attr("width", marginSunburst.left + marginSunburst.right)
            .attr("height", marginSunburst.top + marginSunburst.bottom)
            .append("g")
            .attr("transform", "translate(" + 0 + "," + marginSunburst.top + ")");


    var partition = d3.layout.partition()
        .sort(function (f, g) {
            return d3v4.ascending(f.name, g.name);
        })
        .size([circleRadians, radiusSunburst]);

    var arc = d3.svg.arc()
            .startAngle(function (f) {
                return f.x;
            })
            .endAngle(function (f) {
                return f.x + f.dx;
            })
            .padAngle(.02)
            .padRadius(radiusSunburst / 3)
            .innerRadius(function (f) {
                return radiusSunburst / 3 * f.depth;
            })
            .outerRadius(function (f) {
                return radiusSunburst / 3 * (f.depth + 1) - 1;
            });

    /*
     * You don't need to require the json file with data
     * */
    // d3.json("flare.json", function (error, root) {
    //     if (error) throw error;

    /*
     * Define the variable "root" with the data argument of the module
     * */
    var centerSunburst,
        pathSunburst,
        sunburstRoot;


    sunburstRoot = data;
    // Determine variables (could not be done with v4 version of partition
    partition
        .value(function (f) {
            return f.size;
        })
        .nodes(sunburstRoot)
        .forEach(function (f) {
            f._children = f.children;
            f.sum = f.value;
            f.key = key(f);
            f.fill = colorSunburst(f.parent ? f.parent.name : f.name);
        });

    // Redefine the value function to use the previously-computed sum.
    partition
        .children(function (f, depth) {
            return depth < 2 ? f._children : null;
        })
        .value(function (f) {
            return f.sum;
        });

    // Design center circle for zoomout.
    centerSunburst = sunburstSvg.append("circle")
        .attr("r", radiusSunburst / 3)
        .on("click", zoomOut);

    // Append hover text
    centerSunburst.append("title")
        .text("zoom out");

    // Make sunburst paths
    pathSunburst = sunburstSvg.selectAll("path")
        .data(partition.nodes(sunburstRoot).slice(1))
        .enter().append("path")
        .attr("class", 'sunburstPath')
        .attr("d", arc)
        .style("fill", function (f) {
            return f.fill;
        })
        .each(function (f) {
            this._current = updateArc(f);
        })
        .on("click", function (f) {
            zoomIn(f);
            clickTree(getTreeObject(f));
        })
        .on("mouseover", function (f) {
            mouseoverSunburst(f);
            mouseoverTree(getTreeObject(f));
        });


    // EDITING ENDS HERE
    return wrapper[0][0];
};