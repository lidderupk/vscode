"use strict";
var vscode = require('vscode');
var LinkCheckDocument = (function () {
    function LinkCheckDocument(uri, locations, emitter) {
        this._uri = uri;
        this._locations = locations;
        // The ReferencesDocument has access to the event emitter from
        // the containg provider. This allows it to signal changes
        this._emitter = emitter;
        // Start with printing a header and start resolving
        var summary = this._locations.length > 1 ?
            "Found " + this._locations.length + " invalid links" :
            "Found " + this._locations.length + " invalid link";
        this._lines = [summary];
        this._links = [];
        this._join = this._populate();
    }
    Object.defineProperty(LinkCheckDocument.prototype, "value", {
        get: function () {
            return this._lines.join('\n');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LinkCheckDocument.prototype, "links", {
        get: function () {
            return this._links;
        },
        enumerable: true,
        configurable: true
    });
    LinkCheckDocument.prototype.join = function () {
        return this._join;
    };
    LinkCheckDocument.prototype._populate = function () {
        var _this = this;
        if (this._locations.length === 0) {
            return;
        }
        // fetch one by one, update doc asap
        return new Promise(function (resolve) {
            var index = 0;
            var next = function () {
                // We have seen all groups
                if (index >= _this._locations.length) {
                    resolve(_this);
                    return;
                }
                // We know that this._locations is sorted by uri
                // such that we can now iterate and collect ranges
                // until the uri changes
                var loc = _this._locations[index];
                var uri = loc.uri;
                var ranges = [loc.range];
                while (++index < _this._locations.length) {
                    loc = _this._locations[index];
                    if (loc.uri.toString() !== uri.toString()) {
                        break;
                    }
                    else {
                        ranges.push(loc.range);
                    }
                }
                // We have all ranges of a resource so that it be
                // now loaded and formatted
                _this._fetchAndFormatLocations(uri, ranges).then(function (lines) {
                    _this._emitter.fire(_this._uri);
                    next();
                });
            };
            next();
        });
    };
    LinkCheckDocument.prototype._fetchAndFormatLocations = function (uri, ranges) {
        var _this = this;
        // Fetch the document denoted by the uri and format the matches
        // with leading and trailing content form the document. Make sure
        // to not duplicate lines
        return vscode.workspace.openTextDocument(uri).then(function (doc) {
            _this._lines.push('', uri.toString());
            for (var i = 0; i < ranges.length; i++) {
                var line = ranges[i].start.line;
                _this._appendLeading(doc, line, ranges[i - 1]);
                _this._appendMatch(doc, line, ranges[i], uri);
                _this._appendTrailing(doc, line, ranges[i + 1]);
            }
        }, function (err) {
            _this._lines.push('', "Failed to load '" + uri.toString() + "'\n\n" + String(err), '');
        });
    };
    LinkCheckDocument.prototype._appendLeading = function (doc, line, previous) {
        var from = Math.max(0, line - 3, previous && previous.end.line || 0);
        while (++from < line) {
            var text = doc.lineAt(from).text;
            this._lines.push(("  " + (from + 1)) + (text && "  " + text));
        }
    };
    LinkCheckDocument.prototype._appendMatch = function (doc, line, match, target) {
        var text = doc.lineAt(line).text;
        var preamble = "  " + (line + 1) + ": ";
        // Append line, use new length of lines-array as line number
        // for a link that point to the reference
        var len = this._lines.push(preamble + text);
        // Create a document link that will reveal the reference
        var linkRange = new vscode.Range(len - 1, preamble.length + match.start.character, len - 1, preamble.length + match.end.character);
        var linkTarget = target.with({ fragment: String(1 + match.start.line) });
        this._links.push(new vscode.DocumentLink(linkRange, linkTarget));
    };
    LinkCheckDocument.prototype._appendTrailing = function (doc, line, next) {
        var to = Math.min(doc.lineCount, line + 3);
        if (next && next.start.line - to <= 2) {
            return; // next is too close, _appendLeading does the work
        }
        while (++line < to) {
            var text = doc.lineAt(line).text;
            this._lines.push(("  " + (line + 1)) + (text && "  " + text));
        }
        if (next) {
            this._lines.push("  ...");
        }
    };
    return LinkCheckDocument;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LinkCheckDocument;
//# sourceMappingURL=linkCheckDocument.js.map