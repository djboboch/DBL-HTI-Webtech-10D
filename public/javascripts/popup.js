var mod = document.getElementById("modal");
var btn = document.getElementById("randomasstree");
var up = document.getElementById("upload-file");
var spn = document.getElementById("close");

// when button is clicked, a popup is created
btn.onclick = function() {
    mod.style.display = "block";
};

spn.onclick = function() {
    mod.style.display = "none"
};

function doOnce() {
    if (document.cookie.replace(/(?:(?:^|.*;\s*)doSomethingOnlyOnce\s*\=\s*([^;]*).*$)|^.*$/, "$1") !== "true") {
        $("#explain_pop").delay(200).fadeIn();
        var date = new Date();
        var time = new Date(date.getTime() + 86400000); //expires after a day
        document.cookie = "doSomethingOnlyOnce=true; expires=time.toUTCString();";
    }
    $('#close_1, #explain_pop').click(function(){
        $("#explain_pop").fadeOut();
    });
}