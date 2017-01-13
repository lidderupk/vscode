'use strict';
var csstreeValidator = require('csstree-validator');
var findEnd = require('./scanner.js').findEnd;
var vscode_languageserver_1 = require('vscode-languageserver');
function wrapper(options) {
    var report = csstreeValidator.validateString(options.code);
    var diagnostics = [];
    report = Object.keys(report).reduce(function (r, c) { return r.concat(report[c]); }, []);
    report.forEach(function (warning) {
        var line = warning.line - 1;
        var column = warning.column - 1;
        var doc = options.document;
        var offset = doc.offsetAt(vscode_languageserver_1.Position.create(line, column));
        var endPos;
        if (!warning.message.indexOf('Unknown property')) {
            endPos = vscode_languageserver_1.Position.create(line, column + warning.property.length);
        }
        else {
            endPos = doc.positionAt(findEnd(doc.getText(), offset));
        }
        diagnostics.push({
            message: "[CSSTree] " + warning.message,
            severity: 2 /* Warning */,
            range: {
                start: {
                    line: line,
                    character: column
                },
                end: {
                    line: endPos.line,
                    character: endPos.character
                }
            }
        });
    });
    return Promise.resolve(diagnostics);
}
exports.wrapper = wrapper;
;
//# sourceMappingURL=wrapper.js.map