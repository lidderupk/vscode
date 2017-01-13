"use strict";
var fs = require('fs');
var path = require('path');
var vscode = require('vscode');
var RegexRepl = (function () {
    function RegexRepl(regex, opt) {
        this.resultSrc = regex.source;
        this.opt = opt || '';
    }
    RegexRepl.prototype.result = function () {
        return new RegExp(this.resultSrc, this.opt);
    };
    RegexRepl.prototype.replace = function (name, val) {
        var valSrc = val.source;
        valSrc = valSrc.replace(/(^|[^\[])\^/g, '$1');
        this.resultSrc = this.resultSrc.replace(name, valSrc);
        return this;
    };
    return RegexRepl;
}());
var MarkdownUtils = (function () {
    function MarkdownUtils() {
    }
    // regex replacing helper from marked
    MarkdownUtils.replace = function (regex, opt) {
        return new RegexRepl(regex, opt);
    };
    MarkdownUtils.parseLink = function (rowNum, rowText) {
        var result = [];
        result = result.concat(this.parseLinkInternal(rowNum, rowText, MarkdownUtils.regex_link));
        result = result.concat(this.parseLinkInternal(rowNum, rowText, MarkdownUtils.regex_def));
        return result;
    };
    MarkdownUtils.parseLinkInternal = function (rowNum, rowText, regexp) {
        var result = [];
        var match;
        var reg = new RegExp(regexp.source, 'g');
        while (match = reg.exec(rowText)) {
            var url = match[1];
            var isFileLink = MarkdownUtils.isFileLink(url);
            if (isFileLink) {
                url = MarkdownUtils.getFileLink(url);
            }
            result.push({
                source: match[1],
                url: url,
                rowNum: rowNum,
                colStart: match.index,
                colEnd: match.index + match[0].length,
                isFileLink: isFileLink,
                isValid: true
            });
        }
        return result;
    };
    MarkdownUtils.isFileLink = function (url) {
        // etc. http:, mailto:
        if (url.includes(':'))
            return false;
        // etc. #asdf
        if (url.startsWith('#'))
            return false;
        // etc. /a/b
        // remove trailing #
        url = this.getFileLink(url);
        // get file extension, if longer than 5 characters, ignore
        // because the java package like com.microsoft.xxx may contain . as well.
        if (path.extname(url).length == 0 || path.extname(url).length > 4)
            return false;
        return true;
    };
    MarkdownUtils.getFileLink = function (url) {
        var index = url.indexOf('#');
        if (index > 0) {
            url = url.substring(0, index);
        }
        return url;
    };
    MarkdownUtils.fileExists = function (currentPath, file) {
        var fullpath = path.resolve(MarkdownUtils.resolvePath(currentPath, file), path.basename(file));
        return fs.existsSync(fullpath) && fs.statSync(fullpath).isFile();
    };
    MarkdownUtils.getLinkPositionList = function (path, text) {
        var res = [];
        var rowList = text.split('\n');
        rowList.forEach(function (rowText, rowNum) {
            var links = MarkdownUtils.parseLink(rowNum, rowText);
            links.forEach(function (link) {
                if (link.isFileLink) {
                    link.isValid = MarkdownUtils.fileExists(path, link.url);
                }
            });
            res = res.concat(links);
        });
        return res;
    };
    MarkdownUtils.getPartialLinkText = function (text, pos) {
        var context = text.substring(0, pos);
        var match;
        var regex = new RegExp(MarkdownUtils.regex_link_partial.source, 'g');
        if (match = regex.exec(context)) {
            return match[1];
        }
        regex = new RegExp(MarkdownUtils.regex_def_partial.source, 'g');
        if (match = regex.exec(context)) {
            return match[1];
        }
        return null;
    };
    MarkdownUtils.resolvePath = function (currentPath, linkText) {
        var rootPath = vscode.workspace.rootPath;
        if (!rootPath) {
            rootPath = currentPath;
        }
        var textdir = linkText;
        if (!linkText.endsWith("/") && !linkText.endsWith("\\")) {
            textdir = path.dirname(linkText);
        }
        if (linkText.startsWith("/") || linkText.startsWith("\\")) {
            return path.resolve(rootPath, "." + textdir);
        }
        else {
            return path.resolve(currentPath, textdir);
        }
    };
    MarkdownUtils.regex_link_text = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
    MarkdownUtils.regex_link_href = /\s*<?([\s\S]*?)>?(?:\s+['\"]([\s\S]*?)['\"])?\s*/;
    MarkdownUtils.regex_link = MarkdownUtils.replace(/!?\[(?:inside)\]\(href\)/g)
        .replace('inside', MarkdownUtils.regex_link_text)
        .replace('href', MarkdownUtils.regex_link_href)
        .result();
    MarkdownUtils.regex_link_partial = MarkdownUtils.replace(/!?\[(?:inside)\]\(href$/)
        .replace('inside', MarkdownUtils.regex_link_text)
        .replace('href', MarkdownUtils.regex_link_href)
        .result();
    MarkdownUtils.regex_def = /^ *\[[^\]]+\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])?\s*$/;
    MarkdownUtils.regex_def_partial = /^ *\[[^\]]+\]: *<?([^\s>]+)$/;
    return MarkdownUtils;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MarkdownUtils;
//# sourceMappingURL=markdownUtils.js.map