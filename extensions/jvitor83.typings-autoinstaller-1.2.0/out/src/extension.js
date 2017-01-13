"use strict";
var vscode = require("vscode");
var PackageWatcher_1 = require("./PackageWatcher");
var TypingsService_1 = require("./TypingsService");
var npmPackageWatcher;
var bowerPackageWatcher;
var outputChannel;
var typingsService;
function activate(context) {
    outputChannel = vscode.window.createOutputChannel("Typings AutoInstaller Watcher");
    context.subscriptions.push(outputChannel);
    startNpmWatch(context);
    startBowerWatch(context);
    var installAllDependenciesCommand = vscode.commands.registerCommand('typings.installAllDependencies', function (context) {
        installAllDependencies(context);
    });
    context.subscriptions.push(installAllDependenciesCommand);
}
exports.activate = activate;
function installAllDependencies(context) {
    var npmPath = vscode.workspace.rootPath + "/package.json";
    vscode.workspace.openTextDocument(npmPath).then(function (file) {
        var packageJson = JSON.parse(file.getText());
        // Install
        installPackages(packageJson, function (count) {
            writeOutput("Installed Typings of " + count + " npm package(s)\n");
            readBower();
        }, true);
    }, function () {
        readBower();
    });
    var readBower = function () {
        var bowerPath = vscode.workspace.rootPath + "/bower.json";
        vscode.workspace.openTextDocument(bowerPath).then(function (file) {
            var packageJson = JSON.parse(file.getText());
            // Install
            installPackages(packageJson, function (count) {
                writeOutput("Installed Typings of " + count + " bower package(s)\n");
            });
        });
    };
}
function startNpmWatch(context) {
    var path = vscode.workspace.rootPath + "/package.json";
    initNpmWatcher(path);
    var watcher = vscode.workspace.createFileSystemWatcher(path);
    watcher.onDidChange(function (e) {
        if (isNpmWatcherDeactivated()) {
            initNpmWatcher(path);
        }
        vscode.workspace.openTextDocument(path).then(function (file) {
            var packageJson = JSON.parse(file.getText());
            npmPackageWatcher.changed(packageJson, function (newPackages, deletedPackes) {
                // Install
                installPackages(newPackages, function (count) {
                    if (count)
                        writeOutput("Installed Typings of " + count + " npm package(s)\n");
                    // Uninstall
                    uninstallPackages(deletedPackes, function (count) {
                        if (count)
                            writeOutput("Uninstalled Typings of " + count + " npm package(s)\n");
                    });
                });
            });
        });
    });
    context.subscriptions.push(watcher);
}
function isNpmWatcherDeactivated() {
    return !npmPackageWatcher;
}
function initNpmWatcher(path) {
    vscode.workspace.openTextDocument(path).then(function (file) {
        if (file != null) {
            var packageJson = JSON.parse(file.getText());
            npmPackageWatcher = new PackageWatcher_1.PackageWatcher(packageJson);
            typingsService = new TypingsService_1.TypingsService(vscode.workspace.rootPath);
        }
    });
}
function startBowerWatch(context) {
    var path = vscode.workspace.rootPath + "/bower.json";
    initBowerWatcher(path);
    var watcher = vscode.workspace.createFileSystemWatcher(path);
    watcher.onDidChange(function (e) {
        if (isBowerWatcherDeactivated()) {
            initBowerWatcher(path);
        }
        vscode.workspace.openTextDocument(path).then(function (file) {
            var bowerJson = JSON.parse(file.getText());
            bowerPackageWatcher.changed(bowerJson, function (newPackages, deletedPackes) {
                // Install
                installPackages(newPackages, function (count) {
                    if (count)
                        writeOutput("Installed Typings of " + count + " bower package(s)\n");
                    // Uninstall
                    uninstallPackages(deletedPackes, function (count) {
                        if (count)
                            writeOutput("Uninstalled Typings of " + count + " bower package(s)\n");
                    });
                });
            });
        });
    });
    context.subscriptions.push(watcher);
}
function installPackages(packageJson, callback, installEngines) {
    // if(installEngines){
    //     typingsService.install(packageJson.engines || {}, false, writeOutput, (counte) => {});
    // }
    if (installEngines === void 0) { installEngines = false; }
    typingsService.install(packageJson.dependencies || {}, false, writeOutput, function (counta) {
        typingsService.install(packageJson.devDependencies || {}, true, writeOutput, function (countb) {
            typingsService.install(packageJson.engines || {}, false, writeOutput, function (countc) { return callback(counta + countb + countc); });
        });
    });
}
function uninstallPackages(packageJson, callback) {
    typingsService.uninstall(packageJson.dependencies || {}, false, writeOutput, function (counta) {
        typingsService.uninstall(packageJson.devDependencies || {}, true, writeOutput, function (countb) {
            typingsService.uninstall(packageJson.engines || {}, false, writeOutput, function (countc) { return callback(counta + countb + countc); });
        });
    });
    // typingsService.uninstall(packageJson.dependencies, false, writeOutput, (counta) => {
    //     typingsService.uninstall(packageJson.devDependencies, true, writeOutput, (countb) => callback(counta + countb));
    // });
}
function isBowerWatcherDeactivated() {
    return !bowerPackageWatcher;
}
function initBowerWatcher(path) {
    vscode.workspace.openTextDocument(path).then(function (file) {
        var bowerJson = JSON.parse(file.getText());
        bowerPackageWatcher = new PackageWatcher_1.PackageWatcher(bowerJson);
        typingsService = new TypingsService_1.TypingsService(vscode.workspace.rootPath);
    });
}
function writeOutput(message) {
    outputChannel.append(message);
}
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map