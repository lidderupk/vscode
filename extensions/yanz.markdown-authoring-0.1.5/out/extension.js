"use strict";
var fs = require('fs');
var path = require('path');
var vscode = require('vscode');
var markdownUtils_1 = require('./utilities/markdownUtils');
var pathCompletionProvider_1 = require('./providers/pathCompletionProvider');
var diagnosticCollection = vscode.languages.createDiagnosticCollection('markdown-authoring');
var throttleDuration = 500;
var throttle = {
    "uri": null,
    "timeout": null
};
function activate(context) {
    // check all at the beginning
    checkAll();
    // register commands
    context.subscriptions.push(vscode.commands.registerCommand('extension.linkCheck', function () {
        checkAll();
    }));
    // register workspace events
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(didChangeTextDocument));
    // register diagnotic collection
    context.subscriptions.push(diagnosticCollection);
    // register path completion provider
    var pathCompletionProvider = new pathCompletionProvider_1.default();
    var providerRegistrations = vscode.Disposable.from(vscode.languages.registerCompletionItemProvider('markdown', pathCompletionProvider, '(', '/', '\\', '.'));
    context.subscriptions.push(providerRegistrations);
}
exports.activate = activate;
function lint(uri, document) {
    if (path.extname(uri.fsPath) !== '.md') {
        return;
    }
    var invalidLinks = check(uri, document);
    var diagnostics = [];
    invalidLinks.forEach(function (link) {
        var diangostic = new vscode.Diagnostic(link.location.range, 'Invalid relative reference link', vscode.DiagnosticSeverity.Warning);
        diangostic.source = link.source;
        diagnostics.push(diangostic);
    });
    diagnosticCollection.set(uri, diagnostics);
}
function didChangeTextDocument(change) {
    requestLint(change.document.uri, change.document);
}
function suppressLint(uri) {
    if (throttle.timeout && (uri === throttle.uri)) {
        clearTimeout(throttle.timeout);
        throttle.uri = null;
        throttle.timeout = null;
    }
}
function requestLint(uri, document) {
    suppressLint(uri);
    throttle.uri = uri;
    throttle.timeout = setTimeout(function waitThrottleDuration() {
        // Do not use throttle.document in this function; it may have changed
        lint(uri, document);
        suppressLint(uri);
    }, throttleDuration);
}
function checkAll() {
    vscode.window.setStatusBarMessage('start check links for all markdown files...', vscode.workspace.findFiles('**/*.md', '').then(function (uriList) {
        diagnosticCollection.clear();
        var openedDocuments = vscode.workspace.textDocuments;
        var openedUris = openedDocuments.map(function (x) { return x.uri; });
        uriList.map(function (uri) {
            var index = openedUris.findIndex(function (x) { return x.fsPath === uri.fsPath; });
            if (index >= 0) {
                lint(uri, openedDocuments[index]);
            }
            else {
                lint(uri);
            }
        });
    }).then(function () {
        vscode.window.setStatusBarMessage('end check links for all markdown files!', 5000);
    }));
}
function check(uri, document) {
    var positionList = markdownUtils_1.default.getLinkPositionList(path.dirname(uri.fsPath), document ? document.getText() : fs.readFileSync(uri.fsPath).toString());
    positionList = positionList.filter(function (position) {
        return !position.isValid;
    });
    var result = new Array();
    positionList.forEach(function (position) {
        result.push({
            'location': new vscode.Location(vscode.Uri.file(uri.fsPath), new vscode.Range(new vscode.Position(position.rowNum, position.colStart), new vscode.Position(position.rowNum, position.colEnd))),
            'source': position.source
        });
    });
    return result;
}
//# sourceMappingURL=extension.js.map