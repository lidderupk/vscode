"use strict";
var childProcess = require("child_process");
var TypingsService = (function () {
    function TypingsService(rootPath) {
        this.rootPath = rootPath;
    }
    TypingsService.prototype.install = function (dependency, isDev, stateCallback, callback) {
        var _this = this;
        if (isDev === void 0) { isDev = false; }
        var installCommands = Object.keys(dependency).map(function (key) { return function (callback) { return _this.installDependency(key, isDev, stateCallback, _this.rootPath, callback); }; });
        if (installCommands && installCommands.length) {
            var successCount_1 = 0;
            var run_1 = function (index) {
                installCommands[index](function (success) {
                    if (success) {
                        successCount_1++;
                    }
                    var newIndex = index + 1;
                    (installCommands.length > newIndex) ?
                        run_1(newIndex) :
                        callback(successCount_1);
                });
            };
            run_1(0);
        }
        else {
            callback(0);
        }
    };
    TypingsService.prototype.installDependency = function (key, isDev, stateCallback, rootPath, callback) {
        if (isDev === void 0) { isDev = false; }
        stateCallback("Installing Typings package '" + key + "'\n");
        var saveString = "--save";
        if (isDev) {
            saveString = "--save-dev";
        }
        var command = ("typings install dt~" + key + " --global ") + saveString;
        childProcess.exec(command, { cwd: rootPath, env: process.env }, function (error, stdout, sterr) {
            if (sterr && sterr.indexOf('typings ERR!') > -1) {
                if (sterr.match(/typings ERR! message Unable to find "[^"]*" \("dt"\) in the registry/g)) {
                    stateCallback("Typings for package '" + key + "' not found\n\n");
                }
                else {
                    stateCallback(sterr);
                }
                callback(false);
            }
            else {
                stateCallback(stdout);
                stateCallback("Successfully installed Typings for package '" + key + "'\n\n");
                callback(true);
            }
        });
    };
    TypingsService.prototype.uninstall = function (dependency, isDev, stateCallback, callback) {
        var _this = this;
        if (isDev === void 0) { isDev = false; }
        var uninstallCommands = Object.keys(dependency).map(function (key) { return function (callback) { return _this.uninstallDependency(key, isDev, stateCallback, _this.rootPath, callback); }; });
        if (uninstallCommands && uninstallCommands.length) {
            var successCount_2 = 0;
            var run_2 = function (index) {
                uninstallCommands[index](function (success) {
                    if (success) {
                        successCount_2++;
                    }
                    var newIndex = index + 1;
                    (uninstallCommands.length > newIndex) ?
                        run_2(newIndex) :
                        callback(successCount_2);
                });
            };
            run_2(0);
        }
        else {
            callback(0);
        }
    };
    TypingsService.prototype.uninstallDependency = function (key, isDev, stateCallback, rootPath, callback) {
        if (isDev === void 0) { isDev = false; }
        stateCallback("Uninstalling Typings package '" + key + "'\n");
        var saveString = "--save";
        if (isDev) {
            saveString = "--save-dev";
        }
        var command = ("typings uninstall " + key + " --global ") + saveString;
        childProcess.exec(command, { cwd: rootPath, env: process.env }, function (error, stdout, sterr) {
            if (sterr && sterr.indexOf('typings ERR!') > -1) {
                if (sterr.match(/typings ERR! message Typings for "[^"]*" are not listed in global.*dependencies/g)) {
                    stateCallback("Typings for package '" + key + "' not installed\n\n");
                }
                else {
                    stateCallback(sterr);
                }
                callback(false);
            }
            else {
                stateCallback(stdout);
                stateCallback("Successfully uninstalled Typings for package '" + key + "'\n\n");
                callback(true);
            }
        });
    };
    return TypingsService;
}());
exports.TypingsService = TypingsService;
//# sourceMappingURL=TypingsService.js.map