'use strict';
const path = require("path");
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
var electron = require('./electron_j');
var os = require('os');
var glob = require('glob');
const requirements = require("./requirements");
const protocol_1 = require("./protocol");
const DEBUG = (typeof v8debug === 'object') || startedInDebugMode();
var storagePath;
var oldConfig;
var lastStatus;
function runJavaServer() {
    return requirements.resolveRequirements().catch(error => {
        //show error
        vscode_1.window.showErrorMessage(error.message, error.label).then((selection) => {
            if (error.label && error.label === selection && error.openUrl) {
                vscode_1.commands.executeCommand('vscode.open', error.openUrl);
            }
        });
        // rethrow to disrupt the chain.
        throw error;
    })
        .then(requirements => {
        return new Promise(function (resolve, reject) {
            let child = path.resolve(requirements.java_home + '/bin/java');
            let params = [];
            let workspacePath = path.resolve(storagePath + '/jdt_ws');
            if (DEBUG) {
                params.push('-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=1044');
            }
            params.push('-Declipse.application=org.jboss.tools.vscode.java.id1');
            params.push('-Dosgi.bundles.defaultStartLevel=4');
            params.push('-Declipse.product=org.jboss.tools.vscode.java.product');
            if (DEBUG) {
                params.push('-Dlog.protocol=true');
                params.push('-Dlog.level=ALL');
            }
            let vmargs = getJavaConfiguration().get('jdt.ls.vmargs', '');
            parseVMargs(params, vmargs);
            let server_home = path.resolve(__dirname, '../../server');
            let launchersFound = glob.sync('**/plugins/org.eclipse.equinox.launcher_*.jar', { cwd: server_home });
            if (launchersFound.length) {
                params.push('-jar');
                params.push(path.resolve(server_home, launchersFound[0]));
            }
            else {
                reject('failed to find launcher');
            }
            //select configuration directory according to OS
            let configDir = 'config_win';
            if (process.platform === 'darwin') {
                configDir = 'config_mac';
            }
            else if (process.platform === 'linux') {
                configDir = 'config_linux';
            }
            params.push('-configuration');
            params.push(path.resolve(__dirname, '../../server', configDir));
            params.push('-data');
            params.push(workspacePath);
            console.log('Executing ' + child + ' ' + params.join(' '));
            electron.fork(child, params, {}, function (err, result) {
                if (err) {
                    reject(err);
                }
                if (result) {
                    resolve(result);
                }
            });
        });
    });
}
function activate(context) {
    storagePath = context.storagePath;
    if (!storagePath) {
        storagePath = getTempWorkspace();
    }
    let serverOptions = runJavaServer;
    // Options to control the language client
    let clientOptions = {
        // Register the server for java
        documentSelector: ['java'],
        synchronize: {
            configurationSection: 'java',
            // Notify the server about file changes to .java files contain in the workspace
            fileEvents: [
                vscode_1.workspace.createFileSystemWatcher('**/*.java'),
                vscode_1.workspace.createFileSystemWatcher('**/pom.xml'),
                vscode_1.workspace.createFileSystemWatcher('**/*.gradle')
            ],
        }
    };
    let item = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right, Number.MIN_VALUE);
    oldConfig = getJavaConfiguration();
    // Create the language client and start the client.
    let languageClient = new vscode_languageclient_1.LanguageClient('java', 'Language Support for Java', serverOptions, clientOptions);
    languageClient.onNotification(protocol_1.StatusNotification.type, (report) => {
        console.log(report.message);
        switch (report.type) {
            case 'Started':
                item.text = '$(thumbsup)';
                lastStatus = item.text;
                break;
            case 'Error':
                item.text = '$(thumbsdown)';
                lastStatus = item.text;
                break;
            case 'Message':
                item.text = report.message;
                setTimeout(() => { item.text = lastStatus; }, 3000);
                break;
        }
        item.command = 'java.open.output';
        item.tooltip = report.message;
        toggleItem(vscode_1.window.activeTextEditor, item);
    });
    languageClient.onNotification(protocol_1.ActionableNotification.type, (notification) => {
        let show = null;
        switch (notification.severity) {
            case protocol_1.MessageType.Log:
                show = logNotification;
                break;
            case protocol_1.MessageType.Info:
                show = vscode_1.window.showInformationMessage;
                break;
            case protocol_1.MessageType.Warning:
                show = vscode_1.window.showWarningMessage;
                break;
            case protocol_1.MessageType.Error:
                show = vscode_1.window.showErrorMessage;
                break;
        }
        if (!show) {
            return;
        }
        const titles = notification.commands.map(a => a.title);
        show(notification.message, ...titles).then((selection) => {
            for (let action of notification.commands) {
                if (action.title === selection) {
                    vscode_1.commands.executeCommand(action.command, ...action.arguments);
                    break;
                }
            }
        });
    });
    vscode_1.commands.registerCommand('java.open.output', () => {
        languageClient.outputChannel.show(vscode_1.ViewColumn.Three);
    });
    vscode_1.commands.registerCommand('java.show.references', (uri, position, locations) => {
        vscode_1.commands.executeCommand('editor.action.showReferences', vscode_1.Uri.parse(uri), vscode_languageclient_1.Protocol2Code.asPosition(position), locations.map(vscode_languageclient_1.Protocol2Code.asLocation));
    });
    vscode_1.commands.registerCommand('java.projectConfiguration.update', uri => projectConfigurationUpdate(languageClient, uri));
    vscode_1.commands.registerCommand('java.ignoreIncompleteClasspath', (data) => setIncompleteClasspathSeverity('ignore'));
    vscode_1.commands.registerCommand('java.projectConfiguration.status', (uri, status) => setProjectConfigurationUpdate(languageClient, uri, status));
    vscode_1.window.onDidChangeActiveTextEditor((editor) => {
        toggleItem(editor, item);
    });
    let provider = {
        onDidChange: null,
        provideTextDocumentContent: (uri, token) => {
            return languageClient.sendRequest(protocol_1.ClassFileContentsRequest.type, { uri: uri.toString() }, token).then((v) => {
                return v || '';
            });
        }
    };
    vscode_1.workspace.registerTextDocumentContentProvider('jdt', provider);
    item.text = 'Starting Java Language Server...';
    toggleItem(vscode_1.window.activeTextEditor, item);
    let disposable = languageClient.start();
    // Push the disposable to the context's subscriptions so that the
    // client can be deactivated on extension deactivation
    context.subscriptions.push(disposable);
    context.subscriptions.push(onConfigurationChange());
}
exports.activate = activate;
function logNotification(message, ...items) {
    return new Promise((resolve, reject) => {
        console.log(message);
    });
}
function setIncompleteClasspathSeverity(severity) {
    const config = getJavaConfiguration();
    const section = 'errors.incompleteClasspath.severity';
    config.update(section, severity, true).then(() => console.log(section + ' globally set to ' + severity), (error) => console.log(error));
}
function projectConfigurationUpdate(languageClient, uri) {
    let resource = uri;
    if (!(resource instanceof vscode_1.Uri)) {
        if (vscode_1.window.activeTextEditor) {
            resource = vscode_1.window.activeTextEditor.document.uri;
        }
    }
    if (isJavaConfigFile(resource.path)) {
        languageClient.sendNotification(protocol_1.ProjectConfigurationUpdateRequest.type, {
            uri: resource.toString()
        });
    }
}
function setProjectConfigurationUpdate(languageClient, uri, status) {
    const config = getJavaConfiguration();
    const section = 'configuration.updateBuildConfiguration';
    const st = protocol_1.FeatureStatus[status];
    config.update(section, st).then(() => console.log(section + ' set to ' + st), (error) => console.log(error));
    if (status !== protocol_1.FeatureStatus.disabled) {
        projectConfigurationUpdate(languageClient, uri);
    }
}
function toggleItem(editor, item) {
    if (editor && editor.document &&
        (editor.document.languageId === 'java' || isJavaConfigFile(editor.document.uri.path))) {
        item.show();
    }
    else {
        item.hide();
    }
}
function isJavaConfigFile(path) {
    return path.endsWith('pom.xml') || path.endsWith('.gradle');
}
function onConfigurationChange() {
    return vscode_1.workspace.onDidChangeConfiguration(params => {
        let newConfig = getJavaConfiguration();
        if (hasJavaConfigChanged(oldConfig, newConfig)) {
            let msg = 'Java Language Server configuration changed, please restart VS Code.';
            let action = 'Restart Now';
            let restartId = 'workbench.action.reloadWindow';
            oldConfig = newConfig;
            vscode_1.window.showWarningMessage(msg, action).then((selection) => {
                if (action === selection) {
                    vscode_1.commands.executeCommand(restartId);
                }
            });
        }
    });
}
function hasJavaConfigChanged(oldConfig, newConfig) {
    return hasConfigKeyChanged('home', oldConfig, newConfig)
        || hasConfigKeyChanged('jdt.ls.vmargs', oldConfig, newConfig);
}
function hasConfigKeyChanged(key, oldConfig, newConfig) {
    return oldConfig.get(key) !== newConfig.get(key);
}
function parseVMargs(params, vmargsLine) {
    if (!vmargsLine) {
        return;
    }
    let vmargs = vmargsLine.match(/(?:[^\s"]+|"[^"]*")+/g);
    if (vmargs === null) {
        return;
    }
    vmargs.forEach(function (arg) {
        if (params.indexOf(arg) < 0) {
            params.push(arg);
        }
    });
}
exports.parseVMargs = parseVMargs;
function getTempWorkspace() {
    return path.resolve(os.tmpdir(), 'vscodesws_' + makeRandomHexString(5));
}
function makeRandomHexString(length) {
    var chars = ['0', '1', '2', '3', '4', '5', '6', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    var result = '';
    for (var i = 0; i < length; i++) {
        var idx = Math.floor(chars.length * Math.random());
        result += chars[idx];
    }
    return result;
}
function startedInDebugMode() {
    let args = process.execArgv;
    if (args) {
        return args.some((arg) => /^--debug=?/.test(arg) || /^--debug-brk=?/.test(arg));
    }
    ;
    return false;
}
function getJavaConfiguration() {
    return vscode_1.workspace.getConfiguration('java');
}
//# sourceMappingURL=extension.js.map