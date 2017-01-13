"use strict";
var vscode = require('vscode');
var linkCheckDocument_1 = require('../schemes/linkCheckDocument');
var uuid = require('node-uuid');
var LinkCheckProvider = (function () {
    function LinkCheckProvider() {
        var _this = this;
        this._onDidChange = new vscode.EventEmitter();
        this._documents = new Map();
        this._editorDecoration = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(206, 186, 44, 0.58)', textDecoration: 'underline'
        });
        this._subscriptions = new Array();
        this._subscriptions.push(vscode.workspace.onDidCloseTextDocument(function (doc) { return _this._documents.delete(doc.uri.toString()); }));
    }
    LinkCheckProvider.putResult = function (result) {
        var key = uuid.v4();
        this._results[key] = result;
        return key;
    };
    LinkCheckProvider.getResult = function (key) {
        var result = this._results[key];
        this._results.delete(key);
        return result;
    };
    LinkCheckProvider.prototype.dispose = function () {
        this._subscriptions.forEach(function (d) { return d.dispose(); });
        this._documents.clear();
        this._editorDecoration.dispose();
        this._onDidChange.dispose();
    };
    Object.defineProperty(LinkCheckProvider.prototype, "onDidChange", {
        get: function () {
            return this._onDidChange.event;
        },
        enumerable: true,
        configurable: true
    });
    LinkCheckProvider.prototype.provideTextDocumentContent = function (uri) {
        // already loaded
        var document = this._documents.get(uri.toString());
        if (document) {
            return document.value;
        }
        var resultKey = LinkCheckProvider.decodeUri(uri);
        var locations = LinkCheckProvider.getResult(resultKey).slice();
        locations.sort(LinkCheckProvider._compareLocations);
        // create document and return its early state
        document = new linkCheckDocument_1.default(uri, locations, this._onDidChange);
        this._documents.set(uri.toString(), document);
        return document.value;
    };
    LinkCheckProvider._compareLocations = function (a, b) {
        if (a.uri.toString() < b.uri.toString()) {
            return -1;
        }
        else if (a.uri.toString() > b.uri.toString()) {
            return 1;
        }
        else {
            return a.range.start.compareTo(b.range.start);
        }
    };
    LinkCheckProvider.prototype.provideDocumentLinks = function (document, token) {
        var doc = this._documents.get(document.uri.toString());
        if (doc) {
            return doc.links;
        }
    };
    LinkCheckProvider.prototype.decorate = function (editor, document) {
        var _this = this;
        if (editor && document) {
            var doc_1 = this._documents.get(document.uri.toString());
            if (doc_1) {
                return doc_1.join().then(function () {
                    var rangeList = doc_1.links.map(function (link) { return link.range; });
                    editor.setDecorations(_this._editorDecoration, rangeList);
                });
            }
        }
        return Promise.resolve();
    };
    LinkCheckProvider.encodeUri = function (resultKey) {
        return vscode.Uri.parse(LinkCheckProvider.scheme + ":LinkCheck.locations?" + resultKey);
    };
    LinkCheckProvider.decodeUri = function (uri) {
        var resultKey = uri.query;
        return resultKey;
    };
    LinkCheckProvider.scheme = 'linkCheck';
    LinkCheckProvider._results = new Map();
    return LinkCheckProvider;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LinkCheckProvider;
//# sourceMappingURL=linkCheckProvider.js.map