$("a").click(function() {
    var treeID = this.id;
    $.get({url:'/visualization/' + treeID, success: window.location.href = '/visualization/' + treeID });


});