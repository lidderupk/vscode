"use strict";
var vscode = require('vscode');
function requestTypingName() {
    return vscode.window.showInputBox({
        prompt: 'Enter typings name',
        placeHolder: 'e.g. node'
    }).then(function (typingName) {
        if (typeof typingName === 'undefined' || typingName === null) {
            return Promise.reject(null);
        }
        typingName = typingName.trim();
        if (typingName === '') {
            return Promise.reject(null);
        }
        return typingName;
    });
}
exports.requestTypingName = requestTypingName;
//# sourceMappingURL=utils.js.map