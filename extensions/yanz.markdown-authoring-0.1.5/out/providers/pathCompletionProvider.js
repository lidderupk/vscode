"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var vscode = require('vscode');
var path = require('path');
var fs = require('fs');
var markdownUtils_1 = require('../utilities/markdownUtils');
var UpCompletionItem = (function (_super) {
    __extends(UpCompletionItem, _super);
    function UpCompletionItem() {
        _super.call(this, '..');
        this.kind = vscode.CompletionItemKind.File;
    }
    return UpCompletionItem;
}(vscode.CompletionItem));
var PathCompletionItem = (function (_super) {
    __extends(PathCompletionItem, _super);
    function PathCompletionItem(filename, isfile) {
        _super.call(this, filename);
        this.kind = vscode.CompletionItemKind.File;
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
}(vscode.CompletionItem));
var FileInfo = (function () {
    function FileInfo(dir, file) {
        this.file = file;
        this.isFile = fs.statSync(path.join(dir, file)).isFile();
    }
    return FileInfo;
}());
var PathCompletionProvider = (function () {
    function PathCompletionProvider() {
    }
    PathCompletionProvider.prototype.provideCompletionItems = function (document, position) {
        var line = document.getText(document.lineAt(position).range);
        var partialLinkText = markdownUtils_1.default.getPartialLinkText(line, position.character);
        var startPath = markdownUtils_1.default.resolvePath(path.dirname(document.fileName), partialLinkText);
        if (partialLinkText != null) {
            return this.getChildren(startPath).then(function (children) {
                return [
                    new UpCompletionItem()
                ].concat(children.map(function (child) { return new PathCompletionItem(child.file, child.isFile); }));
            });
        }
        else {
            return Promise.resolve([]);
        }
    };
    PathCompletionProvider.prototype.getChildren = function (startPath, maxResults) {
        return this.readdir(startPath)
            .then(function (files) { return files.filter(function (filename) { return filename[0] !== '.'; }).map(function (f) { return new FileInfo(startPath, f); }); })
            .catch(function () { return []; });
    };
    PathCompletionProvider.prototype.readdir = function (path) {
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
    };
    return PathCompletionProvider;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PathCompletionProvider;
//# sourceMappingURL=pathCompletionProvider.js.map