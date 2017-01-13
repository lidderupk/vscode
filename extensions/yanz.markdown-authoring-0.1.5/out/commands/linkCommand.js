"use strict";
var path = require('path');
var vscode = require('vscode');
var markdownUtils_1 = require('../utilities/markdownUtils');
var LinkCommand = (function () {
    function LinkCommand() {
    }
    LinkCommand.check = function (text, filepath) {
        var positionList = markdownUtils_1.default.getLinkPositionList(path.dirname(filepath), text);
        positionList = positionList.filter(function (position) {
            return !position.isValid;
        });
        var result = new Array();
        positionList.forEach(function (position) {
            result.push(new vscode.Location(vscode.Uri.file(filepath), new vscode.Range(new vscode.Position(position.rowNum, position.colStart), new vscode.Position(position.rowNum, position.colEnd))));
        });
        return result;
    };
    return LinkCommand;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LinkCommand;
//# sourceMappingURL=linkCommand.js.map