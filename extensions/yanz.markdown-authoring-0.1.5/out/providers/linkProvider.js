"use strict";
var vscode = require('vscode');
var Provider = (function () {
    function Provider() {
        var _this = this;
        this._onDidChange = new vscode.EventEmitter();
        this._documents = new Map();
        this._editorDecoration = vscode.window.createTextEditorDecorationType({ textDecoration: 'underline' });
        // Listen to the following events:
        // * closeTextDocument - which means we must clear the corresponding model object - `ReferencesDocument`
        this._subscriptions = vscode.workspace.onDidCloseTextDocument(function (doc) { return _this._documents.delete(doc.uri.toString()); });
    }
    Provider.prototype.dispose = function () {
        this._subscriptions.dispose();
        this._documents.clear();
        this._editorDecoration.dispose();
        this._onDidChange.dispose();
    };
    Object.defineProperty(Provider.prototype, "onDidChange", {
        /**
         * Expose an event to signal changes of _virtual_ documents
         * to the editor
         */
        get: function () {
            return this._onDidChange.event;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Provider method that takes an uri of the `references`-scheme and
     * resolves its content by (1) running the reference search command
     * and (2) formatting the results
     */
    Provider.prototype.provideTextDocumentContent = function (uri) {
        var _this = this;
        // already loaded?
        var document = this._documents.get(uri.toString());
        if (document) {
            return document.value;
        }
        // Decode target-uri and target-position from the provided uri and execute the
        // `reference provider` command (http://code.visualstudio.com/docs/extensionAPI/vscode-api-commands).
        // From the result create a references document which is in charge of loading,
        // printing, and formatting references
        var _a = decodeLocation(uri), target = _a[0], pos = _a[1];
        return vscode.commands.executeCommand('vscode.executeReferenceProvider', target, pos).then(function (locations) {
            // sort by locations and shuffle to begin from target resource
            var idx = 0;
            locations.sort(Provider._compareLocations).find(function (loc, i) { return loc.uri.toString() === target.toString() && (idx = i) && true; });
            locations.push.apply(locations, locations.splice(0, idx));
            // create document and return its early state
            var document = new ReferencesDocument(uri, locations, _this._onDidChange);
            _this._documents.set(uri.toString(), document);
            return document.value;
        });
    };
    Provider._compareLocations = function (a, b) {
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
    Provider.prototype.provideDocumentLinks = function (document, token) {
        // While building the virtual document we have already created the links.
        // Those are composed from the range inside the document and a target uri
        // to which they point
        var doc = this._documents.get(document.uri.toString());
        if (doc) {
            return doc.links;
        }
    };
    Provider.scheme = 'references';
    return Provider;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Provider;
var seq = 0;
function encodeLocation(uri, pos) {
    var query = JSON.stringify([uri.toString(), pos.line, pos.character]);
    return vscode.Uri.parse(Provider.scheme + ":References.locations?" + query + "#" + seq++);
}
exports.encodeLocation = encodeLocation;
function decodeLocation(uri) {
    var _a = JSON.parse(uri.query), target = _a[0], line = _a[1], character = _a[2];
    return [vscode.Uri.parse(target), new vscode.Position(line, character)];
}
exports.decodeLocation = decodeLocation;
//# sourceMappingURL=linkProvider.js.map