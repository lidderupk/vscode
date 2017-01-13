//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
"use strict";
var chai_1 = require('chai');
var vscode_1 = require('vscode');
var fs_extra_1 = require('fs-extra');
var extension = require('../src/extension');
extension.activate();
var extensionID = 'bradgashler.htmltagwrap';
var samplesFolder = vscode_1.extensions.getExtension(extensionID).extensionPath + '/test/sampleFiles/';
var tempFolder = samplesFolder + 'temp/';
function parametrizedTest(startFilePath, expectedResultFilePath, selectionStart, selectionEnd, failMessage) {
    var result;
    var expectedResult;
    var editor;
    var workingFilePath = tempFolder + startFilePath;
    fs_extra_1.copySync(samplesFolder + startFilePath, workingFilePath, { clobber: true });
    var testPromise = vscode_1.workspace.openTextDocument(workingFilePath).then(function (workingDocument) {
        return vscode_1.window.showTextDocument(workingDocument);
    }).then(function (_editor) {
        editor = _editor;
    }).then(function () {
        editor.selection = new vscode_1.Selection(selectionStart, selectionEnd);
        return vscode_1.commands.executeCommand('extension.htmlTagWrap').then(function () { return new Promise(function (f) { return setTimeout(f, 500); }); });
    }).then(function () {
        result = editor.document.getText();
    }).then(function () {
        return vscode_1.workspace.openTextDocument(samplesFolder + expectedResultFilePath);
    }).then(function (expectedResultDocument) {
        expectedResult = expectedResultDocument.getText();
    }).then(function () {
        return vscode_1.commands.executeCommand('workbench.action.closeActiveEditor').then(function () { return new Promise(function (f) { return setTimeout(f, 500); }); });
    });
    return testPromise.then(function () {
        chai_1.expect(result).not.to.be.equal(undefined, 'File loding error');
        chai_1.expect(expectedResult).not.to.be.equal(undefined, 'File loding error');
        chai_1.expect(result).to.be.equal(expectedResult, failMessage);
    });
}
suite('Extension Tests', function () {
    test('HTML with tabs block wrap test', function () {
        return parametrizedTest('tabFile.html', 'expectedTabBlockWrapFileResult.html', new vscode_1.Position(1, 1), new vscode_1.Position(6, 6), 'Tab using block wrap does not work');
    });
    test('HTML with spaces block wrap test', function () {
        return parametrizedTest('spaceFile.html', 'expectedSpaceBlockWrapFileResult.html', new vscode_1.Position(1, 4), new vscode_1.Position(7, 9), 'Space using block wrap does not work');
    });
    test('HTML with tabs line wrap test', function () {
        return parametrizedTest('tabFile.html', 'expectedTabLineWrapFileResult.html', new vscode_1.Position(2, 2), new vscode_1.Position(2, 11), 'Tab using line wrap does not work');
    });
    test('HTML with spaces line wrap test', function () {
        return parametrizedTest('spaceFile.html', 'expectedSpaceLineWrapFileResult.html', new vscode_1.Position(2, 8), new vscode_1.Position(2, 17), 'Space using line wrap does not work');
    });
    teardown(function (done) { return fs_extra_1.emptyDir(tempFolder, done); });
});
//# sourceMappingURL=extension.test.js.map