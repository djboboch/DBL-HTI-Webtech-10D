var d3 = require('d3');
var d3v4 = require('d3v4');
var d3v3 = require('d3v3');



var sunburstVizualization = module.exports = function () {

    var data = [];

    //default values for input parameters
    var width = 500;
    var height = 500;
    var margin = {
        top: 10,
        right: 10,
        bottom: 40,
        left: 40,
    };


    var sun = function (container) {

        const marginSunburst = {top: 400, right: 300, bottom: 400, left: 300},
            radiusSunburst = Math.min(marginSunburst.top, marginSunburst.right, marginSunburst.bottom, marginSunburst.left) - 10,
            colorSunburst = d3v4.scaleOrdinal(d3v4.schemeCategory20),
            circleRadians = Math.PI,

            sunburstSvg = d3.select("#sunburstVisualDiv").append("svg")
                .attr("id", 'sunburstVisual')
                .attr("width", marginSunburst.left + marginSunburst.right)
                .attr("height", marginSunburst.top + marginSunburst.bottom)
                .append("g")
                .attr("transform", "translate(" + 0 + "," + marginSunburst.top + ")"),

            partition = d3.layout.partition()
                .sort(function (f, g) {
                    return d3v4.ascending(f.name, g.name);
                })
                .size([circleRadians, radiusSunburst]),

            arc = d3.svg.arc()
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

        var centerSunburst,
            pathSunburst,
            sunburstRoot;

        d3.json("treeconverted.json", function (error, data) {
            if (error) throw error;
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
        });

// Assign zoom functions
        function zoomIn(f) {
            if (f.depth > 1) f = f.parent;
            if (!f.children) return;
            zoom(f, f);
        }

        function zoomOut(p) {
            if (!p.parent) return;
            zoom(p.parent, p);
        }

// Zoom to new root.
        function zoom(root, p) {
            if (document.documentElement.__transition__) return;

            // Resize outside angles
            var enterArc,
                exitArc,
                outsideAngle = d3v4.scaleLinear().domain([0, circleRadians]);

            function insideArc(f) {
                return p.key > f.key
                    ? {depth: f.depth - 1, x: 0, dx: 0} : p.key < f.key
                        ? {depth: f.depth - 1, x: circleRadians, dx: 0}
                        : {depth: 0, x: 0, dx: circleRadians};
            }

            function outsideArc(d) {
                return {depth: d.depth + 1, x: outsideAngle(d.x), dx: outsideAngle(d.x + d.dx) - outsideAngle(d.x)};
            }

            centerSunburst.datum(root);

            // Transistion stuff
            if (root === p) enterArc = outsideArc, exitArc = insideArc, outsideAngle.range([p.x, p.x + p.dx]);

            pathSunburst = pathSunburst.data(partition.nodes(root).slice(1), function (d) {
                return d.key;
            });

            if (root !== p) enterArc = insideArc, exitArc = outsideArc, outsideAngle.range([p.x, p.x + p.dx]);

            d3.transition().duration(750).each(function () {
                pathSunburst.exit().transition()
                    .style("fill-opacity", function (f) {
                        return f.depth === 1 + (root === p) ? 1 : 0;
                    })
                    .attrTween("d", function (f) {
                        return arcTween.call(this, exitArc(f));
                    })
                    .remove();

                pathSunburst.enter().append("path")
                    .style("fill-opacity", function (f) {
                        return f.depth === 2 - (root === p) ? 1 : 0;
                    })
                    .attr('class', 'sunburstPath')
                    .style("fill", function (f) {
                        return f.fill;
                    })
                    .on("click", function (f) {
                        zoomIn(f);
                        clickTree(getTreeObject(f));
                    })
                    .on("mouseover", function (f) {
                        mouseoverSunburst(f);
                        mouseoverTree(getTreeObject(f));
                    })
                    .each(function (f) {
                        this._current = enterArc(f);
                    });

                pathSunburst.transition()
                    .style("fill-opacity", 1)
                    .attrTween("d", function (f) {
                        return arcTween.call(this, updateArc(f));
                    });

            });

            // Resetting hover effect
            mouseleaveSunburst(p);
        }

// Adding mouseleave function
        d3.select("sunburstVisual").on("mouseleave", mouseleaveSunburst);


// Hover function
        function mouseoverSunburst(f) {
            d3.selectAll(".sunburstPath")
                .style("opacity", 0.3);

            d3.selectAll(".sunburstPath")
                .filter(function (node) {
                    return (nodeAncestors(f).indexOf(node) >= 0);
                })
                .style("opacity", 1);


            d3.select("#nodePath")
                .style("visibility", "");


            d3.select("#nodePath").html("");
            do {
                d3.select("#nodePath")
                    .append('div')
                    .datum(f)
                    .attr('class', 'parent')
                    .style('background-color', function (d) {
                        return colorSunburst(f.parent ? f.parent.name : f.name)
                    })
                    .style('display', 'inline-block')
                    .on('click', function () {
                        var object = d3.select(this).datum();
                        if (object == f) {
                            zoomIn(object);
                        }
                        else {
                            zoomOut(object);
                        }
                        clickTree(getTreeObject(object));
                        mouseoverSunburst(object);
                        mouseoverTree(getTreeObject(object));
                    })
                    .style('margin', '3px')
                    .style('padding', '3px')
                    .style('float', 'right')
                    .text(function (d) {
                        return f.name;
                    })
                    .style('color', 'white');
                f = f.parent;
            } while (f.parent);
        }

// mouseleaveSunburst function
        function mouseleaveSunburst(f) {

            d3v4.selectAll(".sunburstPath")
                .transition()
                .duration(500)
                .style("opacity", 1)
                .on("end", function () {
                    d3.select(this).on("mouseover", mouseoverSunburst);
                });
        }


        function key(f) {
            var k = [];
            while (f.depth) k.push(f.name), f = f.parent;
            return k.reverse().join(".");
        }

        function arcTween(f) {
            var i = d3.interpolate(this._current, f);
            this._current = i(0);
            return function (t) {
                return arc(i(t));
            };
        }

        function updateArc(f) {
            return {depth: f.depth, x: f.x, dx: f.dx};
        }

        d3v4.select(self.frameElement).style("height", marginSunburst.top + marginSunburst.bottom + "px");

    };

    sun.data = function(value){
        if(!arguments.length) return data;
        data = value;
        return sun;
    }





    return sun;
};