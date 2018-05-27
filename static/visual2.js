// Visualisation 2 Tree

// Creates the canvas for the SVG elements to be draw in
var canvas = d3.select('#treesvg')
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + 0 + ")rotate(90)");


// Initiates the tree object of the D3 library, defines the size seperations between each node
var tree = d3.tree()
    .size([Math.PI, 500])
    .separation(function (a, b) {
        return (a.parent == b.parent ? 1 : 2) / a.depth;
    });

//Initiate the zoom object used for zooming

var zoom = d3.zoom();

// d3.json used to import json file localy need to be updated to html json reciver attribute in production
d3.json("/static/treeconverted.json", function (error, data) {
    if (error) throw error;

    //From the json data we create a hierary and pass it to the tree object
    var treeroot = tree(d3.hierarchy(data));

    //Used for testing and attrbute checking
    console.log(treeroot.links());


    //Creates link between each node
    var link = canvas.selectAll('.link')
        .data(treeroot.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.linkRadial()
            .angle(function (d) {
                return d.x;
            })
            .radius(function (d) {
                return d.y;
            }));

    //Draws node on the canvas
    var treenode = canvas.selectAll('.node')
        .data(treeroot.descendants())
        .enter().append('g')
        .attr("class", function (d) {
            return "treenode" + (d.children ? " rreenode--internal" : " treenode --leaf");
        })
        .attr("transform", function (d) {
            return "translate(" + radialPoint(d.x, d.y) + ")";
        });

    treenode.append('circle')
        .attr('r', 2.5);

    // treenode.append('text')
    //     .style('fill', "black")
    //     .attr('dy', '0.31em')
    //     .attr('x', function(d){ return d.x < Math.PI === !d.children ? 6 : -6;})
    //     .attr("text-anchor", function(d) { return d.x < Math.PI === !d.children ? "start" : "end";})
    //     .attr('transform', function(d) { return "rotate(" + (d.x < Math.PI ? d.x - Math.PI /2 : d.x + Math.PI / 2) * 180 / Math.PI + ")";})
    //     .text(function(d) { return d.name});
});

function radialPoint(x, y) {
    return [((y = +y) * Math.cos(x -= Math.PI / 2)), (y * Math.sin(x))];
}