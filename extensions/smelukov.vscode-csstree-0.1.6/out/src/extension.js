'use strict';
var path = require('path');
var vscode_languageclient_1 = require('vscode-languageclient');
exports.activate = function activate(context) {
    var serverModule = path.join(__dirname, 'server.js');
    var client = new vscode_languageclient_1.LanguageClient('csstree', {
        run: {
            module: serverModule,
            transport: vscode_languageclient_1.TransportKind.ipc
        },
        debug: {
            module: serverModule,
            transport: vscode_languageclient_1.TransportKind.ipc,
            options: {
                execArgv: ['--nolazy', '--debug=6004']
            }
        }
    }, {
        documentSelector: ['css'],
        synchronize: {
            configurationSection: 'csstree'
        }
    });
    context.subscriptions.push(new vscode_languageclient_1.SettingMonitor(client, 'csstree.enable').start());
};
//# sourceMappingURL=extension.js.map