"use strict";
var childProcess = require('child_process');
var utils = require('./utils');
var vscode = require('vscode');
var TSDInstaller = (function () {
    function TSDInstaller() {
        this.displayName = 'TSD (deprecated)';
    }
    TSDInstaller.prototype.init = function () {
        return this.install();
    };
    TSDInstaller.prototype.install = function () {
        var _this = this;
        var typingName = '';
        return this.search()
            .then(function (name) {
            typingName = name;
            return _this.getInstallArgs();
        }).then(function (args) {
            return _this.performInstall(typingName, args);
        }).then(function () {
            vscode.window.showInformationMessage('Typings for `' + typingName + '` installed successfully!');
        });
    };
    TSDInstaller.prototype.getInstallArgs = function () {
        var options = ['save', 'no-save'];
        return vscode.window.showQuickPick(options).then(function (o) {
            if (o === options[0]) {
                return '--save';
            }
            return '';
        });
    };
    TSDInstaller.prototype.performInstall = function (packageName, args) {
        var command = 'tsd install ' + packageName + ' ' + args;
        return new Promise(function (resolve, reject) {
            childProcess.exec(command, { cwd: vscode.workspace.rootPath }, function (error, stdout) {
                if (error || stdout.toString().indexOf('zero results') !== -1) {
                    reject('Failed to install typings for `' + packageName + '`');
                    return;
                }
                resolve();
            });
        });
    };
    TSDInstaller.prototype.search = function () {
        return utils.requestTypingName()
            .then(this.performSearch)
            .then(vscode.window.showQuickPick)
            .then(function (name) {
            if (!name) {
                return Promise.reject(null);
            }
            return name;
        });
    };
    TSDInstaller.prototype.performSearch = function (typingName) {
        var command = 'tsd query ' + typingName;
        return new Promise(function (resolve, reject) {
            childProcess.exec(command, { cwd: vscode.workspace.rootPath }, function (error, stdout) {
                if (error || stdout.toString().indexOf('zero results') !== -1) {
                    reject('No typings found for `' + typingName + '`');
                    return;
                }
                resolve(extractTypingNames(stdout.toString()));
            });
        });
    };
    return TSDInstaller;
}());
exports.TSDInstaller = TSDInstaller;
// For some reason this can't be called in child process callback when inside class...
function extractTypingNames(output) {
    return output.split('\n')
        .filter(function (l) { return l.indexOf('/') !== -1; })
        .map(function (l) { return l.split('/')[1].trim(); })
        .filter(function (t) { return t !== ''; });
}
//# sourceMappingURL=tsdInstaller.js.map