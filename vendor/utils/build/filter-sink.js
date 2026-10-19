"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterSink = filterSink;
function filterSink(filteredSink, logLevel, unfilterPrefixRegex) {
    if (unfilterPrefixRegex === undefined || unfilterPrefixRegex === '') {
        return (mesg) => {
            if (logLevel < mesg.level) {
                return;
            }
            filteredSink(mesg);
        };
    }
    const logPrefixRegex = new RegExp(unfilterPrefixRegex);
    return (mesg) => {
        const prefix = mesg.prefix.join('/');
        const matchesPrefix = logPrefixRegex.test(prefix);
        if (!matchesPrefix && logLevel < mesg.level) {
            return;
        }
        filteredSink(mesg);
    };
}
