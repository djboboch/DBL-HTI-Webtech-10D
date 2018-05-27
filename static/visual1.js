$("#file-picker").change(function () {
    var input = document.getElementById('file-picker');
    for (var i = 0; i < input.files.length; i++) {
        var ext = input.files[i].name.substring(input.files[i].name.lastIndexOf('.') + 1).toLowerCase()
        if (ext == 'tre') {
            $("#msg").text("File is supported")
        }
        else {
            $("#msg").text("File is NOT supported")
            document.getElementById("file-picker").value = "";
        }
    }
});

d3.select("#container")
    .style("height", "89%") 	//#body should be renamed to id of parent object (document.getElementById("#visualisation").offsetHeight)
    .style("width", "100%")		//#body should be renamed to id of parent (object document.getElementById("#visualisation").offsetWidth)
    .style("position", "relative")
    .style("bottom", 0);


var width = 1000,
    height = 600,
    radius = (Math.min(width, height) / 1.5);


var color = d3.scaleOrdinal(d3.schemeCategory20b);

const circle = Math.PI;

var g = d3.select('#sunburstsvg')
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("id", "groupg")
    .attr("transform", "translate(" + width / 2 + "," + 0 + ")rotate(90)");

var partitioning = d3.partition();

var x = d3.scaleLinear()
    .range([0, circle]);

var y = d3.scaleSqrt()
    .range([0, radius]);


var arc = d3.arc()
    .startAngle(function (f) {
        return Math.max(0, Math.min(circle, x(f.x0)));
    })
    .endAngle(function (f) {
        return Math.max(0, Math.min(circle, x(f.x1)));
    })
    .innerRadius(function (f) {
        return Math.max(0, y(f.y0));
    })
    .outerRadius(function (f) {
        return Math.max(0, y(f.y1));
    })
    .padAngle(.01)

d3.json("/static/treeconverted.json", function (error, nodeData) {


    rootsunburst = d3.hierarchy(nodeData);

    rootsunburst.sum(function (f) {
        return f.size
    });

    g.selectAll('g')
        .data(partitioning(rootsunburst).descendants())
        .enter().append('g').attr("class", "node")
        .append('path')
        .attr("d", arc)
        .attr("display", null)
        .style('stroke', '#fff')
        .style("fill", function (f) {
            return color((f.children ? f : f.parent).data.name);
        }) //color(f.parent ? f.parent.data.name : f.data.name)
        .style("opacity", 1)
        .on("click", onclick)
        .on("mouseover", mouseover);

    /*
    g.selectAll(".node")
        .append("text")
        .attr("transform", function(f) {
                return ((f.depth == 0) ? "translate(" + arc.centroid(f) + ")" : "translate(" + arc.centroid(f) + ")rotate(" + textRotation(f) + ")" )})
        .attr("dx", "-20")
        .attr("dy", ".5em")
        .text(function(f) {
            if(f.depth <= 2) {
                if(f.data.name.length < 10) {
                    return f.data.name
                } else {
                    return ""
                }
            } else {
                return ""
            }
        });
    */
    d3.select("svg").on("mouseleave", mouseleave);

});

function mouseover(f) {
    var ancestorSequence = nodeAncestors(f);

    d3.selectAll("path")
        .style("opacity", 0.3);

    g.selectAll("path")
        .filter(function (node) {
            return (ancestorSequence.indexOf(node) >= 0);
        })
        .style("opacity", 1);


    d3.select("#root")
        .style("visibility", "");

    d3.select("#root").each(function (d, i) {
        d3.select(this).text(function (h) {
            var ancestorStringReverse = "";
            while (true) {
                ancestorStringReverse += f.data.name + " ";
                if (f.parent) {
                    f = f.parent;
                } else {
                    break;
                }
            }
            var ancestorString = ancestorStringReverse.split(' ').reverse().join(' - ').substr(2);
            return ancestorString;
        });
    });
};

function nodeAncestors(node) {
    var pathNode2Root = [];
    while (node.parent) {
        pathNode2Root.unshift(node);
        node = node.parent;
    }
    pathNode2Root.unshift(node);
    return pathNode2Root;
};

function mouseleave(f) {
    d3.selectAll("path").on("mouseover", null);

    d3.selectAll("path")
        .transition()
        .duration(500)
        .style("opacity", 1)
        .on("end", function () {
            d3.select(this).on("mouseover", mouseover);
        });

    d3.select("#root")
        .style("visibility", "hidden");
};

function onclick(f) {
    g.transition()
        .duration(500)
        .tween("scale", function () {
            var xd = d3.interpolate(x.domain(), [f.x0, f.x1]),
                yd = d3.interpolate(y.domain(), [f.y0, 1]),
                yr = d3.interpolate(y.range(), [f.y0 ? 20 : 0, radius]);
            return function (t) {
                x.domain(xd(t));
                y.domain(yd(t)).range(yr(t));
            };
        })
        .selectAll("path")
        .attrTween("d", function (f) {
            return function () {
                return arc(f);
            };
        });
};