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
$(function () {
    // bind change event to select
    $('#selectvis').on('change', function () {
        var url = $(this).val(); // get selected value
        if (url) { // require a URL
            window.location = url; // redirect
        }
        return false;
    });
});