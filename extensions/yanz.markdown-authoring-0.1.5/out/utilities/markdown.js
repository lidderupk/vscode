"use strict";
var fshelper = require('./fshelper');
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
var MarkdownHelper = (function () {
    function MarkdownHelper() {
    }
    // regex replacing helper from marked
    MarkdownHelper.replace = function (regex, opt) {
        return new RegexRepl(regex, opt);
    };
    MarkdownHelper.parseLink = function (rowNum, rowText) {
        var res = [];
        var match;
        var regex = new RegExp(MarkdownHelper.regex_link.source, 'g');
        while (match = regex.exec(rowText)) {
            var url = match[1];
            var isValid = true;
            var isFileLink = false;
            if (!url.includes("://")) {
                // considered as a path
                isFileLink = true;
            }
            res.push({
                url: url,
                rowNum: rowNum,
                colStart: match.index,
                colEnd: match.index + match[0].length,
                isFileLink: isFileLink,
                isValid: true
            });
        }
        return res;
    };
    MarkdownHelper.getLinkPositionList = function (path, text) {
        var res = [];
        var rowList = text.split('\n');
        rowList.forEach(function (rowText, rowNum) {
            var links = MarkdownHelper.parseLink(rowNum, rowText);
            links.forEach(function (link) {
                if (link.isFileLink) {
                    link.isValid = fshelper.fileExists(path, link.url);
                }
            });
            res = res.concat(links);
        });
        return res;
    };
    MarkdownHelper.getPartialLinkText = function (text, pos) {
        var context = text.substring(0, pos);
        var match;
        var regex = new RegExp(MarkdownHelper.regex_link_partial.source, 'g');
        if (match = regex.exec(context)) {
            return match[1];
        }
        return null;
    };
    MarkdownHelper.regex_link_text = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
    MarkdownHelper.regex_link_href = /\s*<?([\s\S]*?)>?(?:\s+['\"]([\s\S]*?)['\"])?\s*/;
    MarkdownHelper.regex_link = MarkdownHelper.replace(/!?\[(?:inside)\]\(href\)/g)
        .replace('inside', MarkdownHelper.regex_link_text)
        .replace('href', MarkdownHelper.regex_link_href)
        .result();
    MarkdownHelper.regex_link_partial = MarkdownHelper.replace(/!?\[(?:inside)\]\(href$/)
        .replace('inside', MarkdownHelper.regex_link_text)
        .replace('href', MarkdownHelper.regex_link_href)
        .result();
    return MarkdownHelper;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MarkdownHelper;
//# sourceMappingURL=markdown.js.map