'use strict';
var vscode = require('vscode');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var cmdCounter = 0;
var statusBarItems = [];
function activate(context) {
    if (vscode.workspace && vscode.workspace.rootPath) {
        var tasksOutputChannel = new OutputChannel;
        tasksOutputChannel.addOutputChannel('Status Bar Tasks');
        var saveContext = vscode.workspace.onDidSaveTextDocument(function (textDocument) {
            if (textDocument.fileName.endsWith('tasks.json')) {
                statusBarItems.forEach(function (i) {
                    i.hide();
                });
                statusBarItems = [];
                LoadTasks(context, tasksOutputChannel);
            }
        });
        context.subscriptions.push(saveContext);
        LoadTasks(context, tasksOutputChannel);
    }
}
exports.activate = activate;
function LoadTasks(context, tasksOutputChannel) {
    /*
    tasksOutputChannel.attachOutput('Start loading of tasks:\n');
    vscode.commands.getCommands(true).then(results => {
        results.forEach((val: string, i: number) => {
            if (val.startsWith('extension.run')) {
                tasksOutputChannel.attachOutput( i + ' ' + val + '\n');
            }
        });
        tasksOutputChannel.attachOutput('cmdCounter: ' + cmdCounter + ' Loading tasks now.\n');
    });
    */
    var statusBarTask, disposableCommand;
    var taskList = getTasksArray();
    var taskCounter = 0;
    var delimiter = process.platform == 'win32' ? '\\' : '/';
    if (taskList) {
        taskList.forEach(function (val, i) {
            var statusBarTask = new StatusBarTask();
            if (val['showInStatusBar'] == null || val['showInStatusBar'] == true) {
                statusBarTask.addStatusBartask(val['taskName'], (i + cmdCounter));
                var disposableCommand_1 = vscode.commands.registerCommand('extension.run' + (i + cmdCounter), function () {
                    tasksOutputChannel.showOutput();
                    var cmd = val['args'].join(' ');
                    var currentTextEditors = vscode.window.activeTextEditor;
                    var sbt_workspaceRoot = '', sbt_workspaceRootFolderName = '', sbt_file = '', sbt_relativeFile = '', sbt_fileDirname = '', sbt_fileBasename = '', sbt_fileBasenameNoExtension = '', sbt_fileExtname;
                    if (currentTextEditors != undefined) {
                        try {
                            // path to the current application
                            sbt_workspaceRoot = vscode.workspace.rootPath;
                            // folder name holding the application
                            sbt_workspaceRootFolderName = sbt_workspaceRoot.substring(sbt_workspaceRoot.lastIndexOf(delimiter) + 1);
                            // full filepath to open file
                            sbt_file = vscode.window.activeTextEditor.document.fileName;
                            // folder/file relative to the workspace root
                            sbt_relativeFile = sbt_file.substring(sbt_workspaceRoot.length + 1);
                            var currentFilepathSplit = sbt_file.split(delimiter);
                            // filename
                            sbt_fileBasename = currentFilepathSplit.pop();
                            // path to the open file
                            sbt_fileDirname = currentFilepathSplit.join(delimiter);
                            // file extension 
                            var sbt_fileExtnameArray = sbt_fileBasename.match('(\\.[^.]+)$');
                            sbt_fileExtname = sbt_fileExtnameArray != null ? sbt_fileExtnameArray[0] : '';
                            // filename without extension
                            sbt_fileBasenameNoExtension = sbt_fileBasename.substring(0, sbt_fileBasename.length - sbt_fileExtname.length);
                        }
                        catch (e) {
                            tasksOutputChannel.attachOutput('Exception during string variable replacements: ' + e);
                        }
                    }
                    cmd = cmd.replace(/(\$\{env\.)\w+(\})/gi, function (matched) {
                        var envVar = matched.substring(matched.indexOf('.') + 1, matched.indexOf('}'));
                        if (process.env[envVar] != undefined) {
                            return process.env[envVar];
                        }
                        else {
                            return "";
                        }
                    });
                    cmd = cmd.replace(/\$\{file\}/gi, sbt_file)
                        .replace(/\$\{fileBasename\}/gi, sbt_fileBasename)
                        .replace(/\$\{relativeFile\}/gi, sbt_relativeFile)
                        .replace(/\$\{fileDirname\}/gi, sbt_fileDirname)
                        .replace(/\$\{fileExtname\}/gi, sbt_fileExtname)
                        .replace(/\$\{workspaceRoot\}/gi, sbt_workspaceRoot)
                        .replace(/\$\{fileBasenameNoExtension\}/gi, sbt_fileBasenameNoExtension)
                        .replace(/\$\{workspaceRootFolderName\}/gi, sbt_workspaceRootFolderName);
                    var ls = exec(cmd, { cwd: vscode.workspace.rootPath, maxBuffer: 2048000 });
                    ls.stdout.on('data', function (data) { return tasksOutputChannel.attachOutput(data); });
                    ls.stderr.on('data', function (data) { return tasksOutputChannel.attachOutput(data); });
                });
            }
            context.subscriptions.push(disposableCommand);
            context.subscriptions.push(statusBarTask);
            taskCounter += 1;
        });
        cmdCounter += taskCounter;
    }
    /*
    tasksOutputChannel.attachOutput('Post loading of tasks:\n');
    vscode.commands.getCommands(true).then(results => {
        results.forEach((val: string, i: number) => {
            if (val.startsWith('extension.run')) {
                tasksOutputChannel.attachOutput( i + ' ' + val + '\n');
            }
        });
        tasksOutputChannel.attachOutput('cmdCounter: ' + cmdCounter + '\n');
        tasksOutputChannel.attachOutput('\n');
    });
    */
}
function deactivate() {
}
exports.deactivate = deactivate;
function getTasksArray() {
    try {
        var taskFilePath = path.join(vscode.workspace.rootPath, '.vscode', 'tasks.json');
        var rawTaskFileContents = fs.readFileSync(taskFilePath, 'utf8');
        var taskFileContents = rawTaskFileContents.replace(/((\/\/|\/\/\/)(.*)(\r\n|\r|\n))|((\/\*)((\D|\d)+)(\*\/))/gi, "");
        var taskFileTasks = JSON.parse(taskFileContents);
        if (taskFileTasks) {
            var taskElement = taskFileTasks['tasks'];
            /*
            if (taskFileTasks.command) {
                var command = taskFileTasks.command;
                if (taskFileTasks.args) {
                    var args = taskFileTasks.args;
                    taskElement.forEach(function(task) {
                        if (task.args) {
                            task.args.splice(0, 0, command);
                            task.args.splice.apply(task.args, [1,0].concat(args));
                        } else {
                            task.args.push(command);
                            task.args.push(args);
                        }
                    });
                }
            }
            */
            return taskElement;
        }
        else {
            return null;
        }
    }
    catch (e) {
        return null;
    }
}
var OutputChannel = (function () {
    function OutputChannel() {
    }
    OutputChannel.prototype.addOutputChannel = function (channelName) {
        this._outputChannel = vscode.window.createOutputChannel(channelName);
    };
    OutputChannel.prototype.attachOutput = function (output) {
        this._outputChannel.append(output);
    };
    OutputChannel.prototype.showOutput = function () {
        this._outputChannel.show();
    };
    OutputChannel.prototype.dispose = function () {
        this._outputChannel.dispose();
    };
    return OutputChannel;
})();
var StatusBarTask = (function () {
    function StatusBarTask() {
    }
    StatusBarTask.prototype.addStatusBartask = function (taskName, taskNumber) {
        this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this._statusBarItem.text = taskName;
        this._statusBarItem.command = "extension.run" + taskNumber;
        this._statusBarItem.show();
        statusBarItems.push(this._statusBarItem);
    };
    StatusBarTask.prototype.dispose = function () {
        this._statusBarItem.dispose();
    };
    return StatusBarTask;
})();
//# sourceMappingURL=extension.js.map