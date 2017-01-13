"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
function getTabString(editor) {
    var spacesUsed = editor.options.insertSpaces;
    if (spacesUsed) {
        var numOfUsedSpaces = editor.options.tabSize;
        return ' '.repeat(numOfUsedSpaces);
    }
    return '\t';
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate() {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "copythis" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    vscode.commands.registerCommand('extension.htmlTagWrap', function () {
        // The code you place here will be executed every time your command is executed
        var editor = vscode.window.activeTextEditor;
        if (editor != undefined) {
            var selection = editor.selection;
            var selectedText = editor.document.getText(selection);
            var firstIndex = 1;
            var lastIndex = selectedText.length;
            console.log('selection is: ' + selectedText);
            console.log('length is: ' + lastIndex);
            console.log('selection.start.character: ' + selection.start.character);
            console.log('selection.end.character: ' + selection.end.character);
            var selectionStart = selection.start;
            var selectionEnd = selection.end;
            if (selectionEnd.line > selectionStart.line) {
                //Wrap it as a block
                var lineAbove = selectionStart.line - 1;
                var lineBelow = selectionEnd.line + 1;
                //console.log('tabSize = ' + tabSize);
                var tabSizeSpace_1 = getTabString(editor);
                var selectionStart_spaces = editor.document.lineAt(selectionStart.line).text.substring(0, selectionStart.character);
                //console.log('selectionStart_spaces = ' + selectionStart_spaces);
                //console.log('tabsizeSpace =' + tabSizeSpace);
                editor.edit(function (editBuilder) {
                    // Modify last line of selection
                    editBuilder.insert(new vscode.Position(selectionEnd.line, selectionEnd.character), '\n' + selectionStart_spaces + '</p>');
                    editBuilder.insert(new vscode.Position(selectionEnd.line, 0), tabSizeSpace_1);
                    console.log('End line done.  Line #: ' + selectionEnd.line);
                    for (var lineNumber = selectionEnd.line - 1; lineNumber > selectionStart.line; lineNumber--) {
                        console.log('FOR Loop line #: ' + lineNumber);
                        editBuilder.insert(new vscode.Position(lineNumber, 0), tabSizeSpace_1);
                    }
                    // Modify firs line of selection
                    editBuilder.insert(new vscode.Position(selectionStart.line, selectionStart.character), '<p>\n' + selectionStart_spaces + tabSizeSpace_1);
                    console.log('Start Line done.  Line #: ' + selectionStart.line);
                }).then(function () {
                    console.log('Edit applied!');
                    var bottomTagLine = lineBelow + 1;
                    var firstTagSelectionSelection = new vscode.Selection(selectionStart.line, selectionStart.character + 1, selectionStart.line, selectionStart.character + 2);
                    var lastTagSelectionSelection = new vscode.Selection(bottomTagLine, selectionStart.character + 2, bottomTagLine, selectionStart.character + 3);
                    var tagSelections = [firstTagSelectionSelection, lastTagSelectionSelection];
                    editor.selections = tagSelections;
                }, function (err) {
                    console.log('Edit rejected!');
                    console.error(err);
                });
            }
            else {
                //Wrap it inline
                editor.edit(function (editBuilder) {
                    editBuilder.insert(new vscode.Position(selectionEnd.line, selectionEnd.character), '</p>');
                    editBuilder.insert(new vscode.Position(selectionEnd.line, selectionStart.character), '<p>');
                }).then(function () {
                    console.log('Edit applied!');
                    var firstTagSelectionSelection = new vscode.Selection(selectionStart.line, selectionStart.character + 1, selectionStart.line, selectionStart.character + 2);
                    var lastTagSelectionSelection = new vscode.Selection(selectionEnd.line, selectionEnd.character + 3 + 2, selectionEnd.line, selectionEnd.character + 3 + 3);
                    var tagSelections = [firstTagSelectionSelection, lastTagSelectionSelection];
                    editor.selections = tagSelections;
                }, function (err) {
                    console.log('Edit rejected!');
                    console.error(err);
                });
            }
        }
        ;
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map