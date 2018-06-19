$("button").click(function() {
    $.post({url:"/deleteTree/" + this.id, success: window.location.reload()} )
});