'use strict';
var wrapper_1 = require('./wrapper');
var vscode_languageserver_1 = require('vscode-languageserver');
var config;
var connection = vscode_languageserver_1.createConnection(new vscode_languageserver_1.IPCMessageReader(process), new vscode_languageserver_1.IPCMessageWriter(process));
var documents = new vscode_languageserver_1.TextDocuments();
function validate(document) {
    return wrapper_1.wrapper({
        code: document.getText(),
        document: document,
        config: config,
    }).then(function (diagnostics) {
        connection.sendDiagnostics({ uri: document.uri, diagnostics: diagnostics });
    }).catch(function (err) {
        connection.window.showErrorMessage(err.stack.replace(/\n/g, ' '));
    });
}
function validateAll() {
    return Promise.all(documents.all().map(function (doc) { return validate(doc); }));
}
connection.onInitialize(function (params) {
    validateAll();
    return {
        capabilities: {
            textDocumentSync: documents.syncKind
        }
    };
});
connection.onDidChangeConfiguration(function (params) {
    var settings = params.settings;
    config = settings.csstree.config;
    validateAll();
});
documents.onDidChangeContent(function (event) { return validate(event.document); });
documents.onDidClose(function (e) { return connection.sendDiagnostics({ uri: e.document.uri, diagnostics: [] }); });
documents.listen(connection);
connection.onDidChangeWatchedFiles(validateAll);
connection.listen();
//# sourceMappingURL=server.js.map