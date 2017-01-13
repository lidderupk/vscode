"use strict";
var childProcess = require('child_process');
var utils = require('./utils');
var vscode = require('vscode');
var TypingsInstaller = (function () {
    function TypingsInstaller() {
        this.displayName = 'Typings';
    }
    TypingsInstaller.prototype.init = function () {
        return this.install();
    };
    TypingsInstaller.prototype.install = function () {
        var _this = this;
        var typingName = '';
        var args = '';
        return this.search()
            .then(function (name) {
            typingName = name;
            return _this.getGlobalArgs();
        }).then(function (a) {
            args += a;
            return _this.getSaveArgs();
        }).then(function (a) {
            args += ' ' + a;
            return _this.performInstall(typingName, args);
        }).then(function () {
            vscode.window.showInformationMessage('Typings for `' + typingName + '` installed successfully!');
        });
    };
    TypingsInstaller.prototype.getGlobalArgs = function () {
        var options = ['global ', 'no-global'];
        return vscode.window.showQuickPick(options).then(function (o) {
            if (o === options[0]) {
                return '--global';
            }
            return '';
        });
    };
    TypingsInstaller.prototype.getSaveArgs = function () {
        var options = ['save', 'no-save'];
        return vscode.window.showQuickPick(options).then(function (o) {
            if (o === options[0]) {
                return '--save';
            }
            return '';
        });
    };
    TypingsInstaller.prototype.performInstall = function (packageName, args) {
        var command = 'typings install ' + packageName + ' ' + args;
        return new Promise(function (resolve, reject) {
            childProcess.exec(command, { cwd: vscode.workspace.rootPath }, function (error, stdout) {
                if (error || stdout.toString().indexOf('ERR!') !== -1) {
                    reject('Failed to install typings for `' + packageName + '`');
                    return;
                }
                resolve();
            });
        });
    };
    TypingsInstaller.prototype.search = function () {
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
    TypingsInstaller.prototype.performSearch = function (typingName) {
        var command = 'typings search ' + typingName;
        return new Promise(function (resolve, reject) {
            childProcess.exec(command, { cwd: vscode.workspace.rootPath }, function (error, stdout) {
                if (error || stdout.toString().indexOf('No results') !== -1) {
                    reject('No typings found for `' + typingName + '`');
                    return;
                }
                resolve(createTypingsQuickPickItems(stdout.toString()));
            });
        });
    };
    return TypingsInstaller;
}());
exports.TypingsInstaller = TypingsInstaller;
function createTypingsQuickPickItems(output) {
    var rows = output.split('\n');
    rows.splice(0, 3);
    return rows.map(function (l) {
        var parts = l.match(/\S+/g);
        if (!parts) {
            return null;
        }
        return parts[1] + '~' + parts[0];
    }).filter(function (l) { return l !== null; });
}
//# sourceMappingURL=typingsInstaller.js.map