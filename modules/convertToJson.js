//Required Modules
const PythonShell = require('python-shell');



exports.runConverter = function()
{
    PythonShell.run('pyscripts/convertToJson.py', function (err) {
        if (err) throw err;
    })

}