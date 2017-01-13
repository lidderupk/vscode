"use strict";
var fs = require('fs');
var path = require('path');
var vscode = require('vscode');
var FileInfo = (function () {
    function FileInfo(dir, file) {
        this.file = file;
        this.isFile = fs.statSync(path.join(dir, file)).isFile();
    }
    return FileInfo;
}());
exports.FileInfo = FileInfo;
function fileExists(dir, file) {
    var fullpath = path.join(dir, file);
    return fs.existsSync(fullpath) && fs.statSync(fullpath).isFile();
}
exports.fileExists = fileExists;
function getChildren(startPath, maxResults) {
    return readdir(startPath)
        .then(function (files) { return files.filter(notHidden).map(function (f) { return new FileInfo(startPath, f); }); })
        .catch(function () { return []; });
}
exports.getChildren = getChildren;
function getChildFiles(include, maxResults) {
    return vscode.workspace.findFiles(include, '', maxResults);
}
exports.getChildFiles = getChildFiles;
function getPath(fileName, text) {
    var filedir = path.dirname(fileName);
    if (text.startsWith("/") || text.startsWith("\\")) {
        text = '.' + text;
    }
    var textdir = path.dirname(text);
    return path.resolve(filedir, textdir);
}
exports.getPath = getPath;
function getExt(document) {
    if (document.isUntitled) {
        return undefined;
    }
    return path.extname(document.fileName);
}
exports.getExt = getExt;
function readdir(path) {
    return new Promise(function (resolve, reject) {
        fs.readdir(path, function (error, files) {
            if (error) {
                reject(error);
            }
            else {
                resolve(files);
            }
        });
    });
}
function notHidden(filename) {
    return filename[0] !== '.';
}
//# sourceMappingURL=fshelper.js.map