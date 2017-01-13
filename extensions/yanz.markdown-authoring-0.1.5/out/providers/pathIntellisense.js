"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var vscode_1 = require('vscode');
var fshelper = require('../utilities/fshelper');
var markdown_1 = require('../utilities/markdown');
var UpCompletionItem = (function (_super) {
    __extends(UpCompletionItem, _super);
    function UpCompletionItem() {
        _super.call(this, '..');
        this.kind = vscode_1.CompletionItemKind.File;
    }
    return UpCompletionItem;
}(vscode_1.CompletionItem));
var PathCompletionItem = (function (_super) {
    __extends(PathCompletionItem, _super);
    function PathCompletionItem(filename, isfile) {
        _super.call(this, filename);
        this.kind = vscode_1.CompletionItemKind.File;
        this.addGroupByFolderFile(filename, isfile);
        this.addSlashForFolder(filename, isfile);
    }
    PathCompletionItem.prototype.addGroupByFolderFile = function (filename, isfile) {
        this.sortText = (isfile ? 'b' : 'a') + "_" + filename;
    };
    PathCompletionItem.prototype.addSlashForFolder = function (filename, isfile) {
        if (!isfile) {
            this.label = filename + "/";
            this.insertText = filename;
        }
    };
    return PathCompletionItem;
}(vscode_1.CompletionItem));
exports.PathCompletionItem = PathCompletionItem;
var PathIntellisense = (function () {
    function PathIntellisense() {
    }
    PathIntellisense.prototype.provideCompletionItems = function (document, position) {
        var line = document.getText(document.lineAt(position).range);
        var partialLinkText = markdown_1.default.getPartialLinkText(line, position.character);
        var startPath = fshelper.getPath(document.fileName, partialLinkText);
        if (partialLinkText != null) {
            return fshelper.getChildren(startPath).then(function (children) {
                return [
                    new UpCompletionItem()
                ].concat(children.map(function (child) { return new PathCompletionItem(child.file, child.isFile); }));
            });
        }
        else {
            return Promise.resolve([]);
        }
    };
    return PathIntellisense;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PathIntellisense;
//# sourceMappingURL=pathIntellisense.js.map