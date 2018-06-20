
var treename = document.getElementById('treeName').textContent;


var treePath = "../" + treename + ".json";

// Constants
const marginSunburst = {top: 200, right: 100, bottom: 200, left: 100},
    radiusSunburst = Math.min(marginSunburst.top, marginSunburst.right, marginSunburst.bottom, marginSunburst.left) - 10,
    colorSunburst = d3v4.scaleOrdinal(d3v4.schemeCategory20),
    circleRadians = 2 * Math.PI,

    sunburstSvg = d3.select("#sunburstVisualDiv").append("svg")
        .attr("id", 'sunburstVisual')
        .attr("width", '100%')
        .attr("height", '400px')
        .append("g")
        .attr("transform", "translate(" + 250 + "," + marginSunburst.top + ")"),

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

d3.json(treePath, function (error, data) {
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
        .on("click", function(f) {
            if(f.parent) {
                zoomOut(f);
                if (!nodeIsCollapsed(getTreeObject(f))) {
                    collapseNode(getTreeObject(f));
                }
            }
        })
        .style('fill', 'orange');

    // Append hover text
    centerSunburst.append("title")
        .text("zoom out");

    // Make sunburst paths
    pathSunburst = sunburstSvg.selectAll(".sunburstPath")
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
        .on("click", function(f) {
            if(f.depth == 2) {
                if(nodeIsCollapsed(getTreeObject(f.parent))) {
                    clickTree(getTreeObject(f.parent));
                }
            }
            if(nodeIsCollapsed(getTreeObject(f))) {
                clickTree(getTreeObject(f));
            }
            zoom(f, f);
        })
        .on("mouseover", function(f) {
            mouseoverSunburst(f);
            mouseoverTree(getTreeObject(f));
        });
});

// Assign zoom functions
function zoomIn(f) {
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
            .on("click", function(f) {
                if(f.depth == 2) {
                    if(nodeIsCollapsed(getTreeObject(f.parent))) {
                        clickTree(getTreeObject(f.parent));
                    }
                }
                if(nodeIsCollapsed(getTreeObject(f))) {
                    clickTree(getTreeObject(f));
                }
                zoom(f, f);
            })
            .on("mouseover", function(f) {
                mouseoverSunburst(f);
                //console.log(f);
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
    mouseoverTree(p);
}

// Hover function
function mouseoverSunburst(f) {
    //mouseoverTree(getTreeObject(f));
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
            // .on('click', function () {
            //     var object = d3.select(this).datum();
            //     console.log(object);
            //     if(object.depth > 0) {
            //         zoom(object, object);
            //     } else {
            //         zoomOut(object);
            //     }
            //     mouseoverSunburst(object);
            // })
            .on('mouseover', function() {
                var object = d3.select(this).datum();
                mouseoverTree(getTreeObject(object));
            })
            .style('margin', '3px')
            .style('padding', '3px')
            //.style('float', 'right')
            .text(function (d) {
                return f.name;
            })
            .style('color', 'white');
        f = f.parent;
    } while (f.parent);
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

/*====================================================================================================================*/
/*=============================================TREE CODE==============================================================*/
/*====================================================================================================================*/

// constants
const treeSvg = d3v4.select("#treeVisual"),
    transitionTree = 0,
    widthTree = +parseInt(treeSvg.style("width")),
    heightTree = +parseInt(treeSvg.style("height")),
    dragAndZoom = d3v4.select("#treeVisual")
        .append("g")
        .attr("class", "content")
        .attr('transform', 'translate(' + widthTree/2 + ',' + heightTree/2 + ')');

// variables
var i = 0,
    treeRoot,
    tree = d3v4.tree()
        .nodeSize([heightTree/3, widthTree * 3])
        .separation(function(a, b) {
            return a.parent == b.parent ? 1 : 1;
        });


var zoom_handler = d3v4.zoom()
        .on("zoom", zoom_actions),
    drag_handler = d3v4.drag()
        .on("start", drag_start)
        .on("drag", drag_drag);

// get file
d3v4.json(treePath, function (error, data) {
    if (error) throw error;

    // initialize variables for start
    treeRoot = d3v4.hierarchy(data, function (f) {
        return f.children;
    });

    treeRoot.x0 = 100;
    treeRoot.y0 = 100;
    // Collapse everything at start
    treeRoot.children.forEach(collapse);

    update(treeRoot);

    // Collapse function
    function collapse(f) {
        if (f.children) {
            f._children = f.children
            f._children.forEach(collapse)
            f.children = null
        }
    }
});

d3v4.select(self.frameElement).style("height", "800px");

// update tree function
function update(treeSource) {

    // Assigns the x and y position
    var treeData = tree(treeRoot);

    // Compute layout
    var nodes = treeData.descendants(),
        links = treeData.descendants().slice(1);

    // nodes

    // Update
    var node = treeSvg.select('.content').selectAll('g.node')
        .data(nodes, function (f) {
            return f.id || (f.id = ++i);
        });

    // New nodes
    var nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr("transform", function (f) {
            return "translate(" + treeSource.x0 + "," + treeSource.x0 + ")";
        })
        .on('click', function(f) {
            if(f.data.children) {
                clickTree(f);
                if(getTreeObject(d3.select('.sunburstPath')[0][0].__data__).depth < f.depth) {
                    zoom(getSunburstObject(f), getSunburstObject(f));
                } else {
                    zoomOut(getSunburstObject(f));
                }
            } else {null}
        })
        .on('mouseover', function(f) {
            mouseoverTree(f);
            mouseoverSunburst(getSunburstObject(f));
        });

    // Add circles
    nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('r', 1e-6)
        .style("fill", function (f) {
            return f._children ? "#ffc0ab" : "#fff";
        });

    // Labels
    nodeEnter.append('text')
        .attr("dy", ".35em")
        .attr("x", function (f) {
            return f.children || f._children ? -13 : 13;
        })
        .attr("text-anchor", function (f) {
            return f.children || f._children ? "end" : "start";
        })
        .text(function (f) {
            return f.data.name;
        });

    // Update
    var nodeUpdate = nodeEnter.merge(node);

    // Transition
    nodeUpdate.transition()
        .duration(transitionTree)
        .attr("transform", function (f) {
            return "translate(" + f.y + "," + f.x + ")";
        });

    // Update
    nodeUpdate.select('circle.node')
        .attr('r', 10)
        .style("fill", function (f) {
            return f._children ? "#ffc0ab" : "#fff";
        })
        .attr('cursor', 'pointer');


    // Remove
    var nodeExit = node.exit().transition()
        .duration(transitionTree)
        .attr("transform", function (f) {
            return "translate(" + treeSource.x + "," + treeSource.x + ")";
        })
        .remove();

    nodeExit.select('circle')
        .attr('r', 1e-6);

    // Fade out
    nodeExit.select('text')
        .style('fill-opacity', 1e-6);

    // Links

    // Update
    var link = treeSvg.select('.content').selectAll('path.link')
        .data(links, function (f) {
            return f.id;
        });


    // New links
    var linkEnter = link.enter().insert('path', "g")
        .attr("class", "link")
        .attr('d', function (f) {
            var o = {x: treeSource.x0, y: treeSource.y0}
            return diagonal(o, o)
        });

    // Update
    var linkUpdate = linkEnter.merge(link);

    // Transition
    linkUpdate.transition()
        .duration(transitionTree)
        .attr('d', function (f) {
            return diagonal(f, f.parent)
        });

    // Remove
    var linkExit = link.exit().transition()
        .duration(transitionTree)
        .attr('d', function (f) {
            var o = {x: treeSource.x, y: treeSource.y}
            return diagonal(o, o)
        })
        .remove();

    // Store
    nodes.forEach(function (f) {
        f.x0 = f.x;
        f.y0 = f.y;
    });

    // Curve
    function diagonal(s, f) {

        path = `M ${s.y} ${s.x}
            C ${(s.y + f.y) / 2} ${s.x},
              ${(s.y + f.y) / 2} ${f.x},
              ${f.y} ${f.x}`;

        return path
    }
}

// clickTree function
function clickTree(f) {
    if (f.children) {
        f._children = f.children;
        f.children = null;
    } else {
        f.children = f._children;
        f._children = null;
    }
    update(f);
}

// mouseoverTree function
function mouseoverTree(f) {
    d3v4.selectAll(".link")
        .style("opacity", 0.3);

    d3v4.selectAll(".link")
        .filter(function (node) {
            return (nodeAncestors(f).indexOf(node) >= 0);
        })
        .style("opacity", 1);

}

// nodeAncestors function
function nodeAncestors(node) {
    var pathNode2Root = [];
    while (node.parent) {
        pathNode2Root.unshift(node);
        node = node.parent;
    }
    pathNode2Root.unshift(node);
    return pathNode2Root;
}

// Drag and zoom functions

function drag_start() {
}

function drag_drag(d) {
    d.fx = 100+d3.event.x;
    d.fy = 100+d3.event.y;
}

function zoom_actions() {
    dragAndZoom.attr("transform", d3v4.event.transform);
}

// Assign handlers
zoom_handler(treeSvg);
drag_handler(dragAndZoom);
/*====================================================================================================================*/
/*=============================================Interaction============================================================*/
/*====================================================================================================================*/

function getSunburstObject(f) {
    var ids = ancestorsNodeIdTree(f);
    ids.pop();
    var currentNode = sunburstRoot;
    while(ids) {
        var currentNodeId = ids.pop();
        if(currentNodeId == undefined) {
            break;
        }
        for(i = 0; i < currentNode._children.length; i++) {
            if(currentNode._children[i].nodeId == currentNodeId) {
                currentNode = currentNode._children[i];
                break;
            }
        }
    }
    return currentNode;
}


function ancestorsNodeIdTree(f) {
    var list = [];
    while(f) {
        list.push(f.data.nodeId);
        f = f.parent;
    }
    return list;
}


function getTreeObject(f) {
    var ids = ancestorsNodeIdSunburst(f)
    ids.pop;
    var currentNode = treeRoot;
    while(ids) {
        var currentNodeId = ids.pop();
        if(currentNodeId == undefined) {
            break;
        }
        if(currentNode.children != null) {
            for (i = 0; i < currentNode.children.length; i++) {
                if (currentNode.children[i].data.nodeId == currentNodeId) {
                    currentNode = currentNode.children[i];
                    break;
                }
            }
        } else {
            for (i = 0; i < currentNode._children.length; i++) {
                if (currentNode._children[i].data.nodeId == currentNodeId) {
                    currentNode = currentNode._children[i];
                    break;
                }
            }
        }
    }
    return currentNode;
}


function ancestorsNodeIdSunburst(f) {
    var list = [];
    while(f) {
        list.push(f.nodeId);
        f = f.parent;
    }
    return list;
}


function nodeIsCollapsed(f)  {
    var object = d3.selectAll('.node').filter(function (d) {
         return d.data === f.data
    });
    console.log(object[0][1].style.fill);
    if(object[0][1] == undefined) {
        return true;
    }
    if(object[0][1].style.fill === 'rgb(255, 192, 171)') {
        return true;
    }
    return false;
}

function collapseNode(f) {
    if (f.children) {
        f._children = f.children
        f._children.forEach(collapseNode)
        f.children = null
    }
    update(f);
}