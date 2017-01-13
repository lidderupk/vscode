"use strict";
var fs = require('fs');
var path = require('path');
function fileExists(dir, file) {
    var fullpath = path.join(dir, file);
    return fs.existsSync(fullpath) && fs.statSync(fullpath).isFile();
}
exports.fileExists = fileExists;
//# sourceMappingURL=fsUtils.js.map