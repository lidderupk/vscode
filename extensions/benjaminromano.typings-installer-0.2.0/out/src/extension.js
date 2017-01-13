"use strict";
var vscode = require('vscode');
var tsdInstaller_1 = require('./tsdInstaller');
var typingsInstaller_1 = require('./typingsInstaller');
function activate(context) {
    var disposables = [];
    var tsdInstaller = new tsdInstaller_1.TSDInstaller();
    var typingsInstaller = new typingsInstaller_1.TypingsInstaller();
    disposables.push(vscode.commands.registerCommand('typingsInstaller.typings', function () {
        typingsInstaller.init()
            .then(null, errorHandler);
    }));
    disposables.push(vscode.commands.registerCommand('typingsInstaller.TSD', function () {
        tsdInstaller.init()
            .then(null, errorHandler);
    }));
    context.subscriptions.concat(disposables);
}
exports.activate = activate;
function errorHandler(error) {
    if (!error) {
        return;
    }
    vscode.window.showErrorMessage(error);
}
//# sourceMappingURL=extension.js.map