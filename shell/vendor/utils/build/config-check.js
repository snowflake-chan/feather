"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s = s;
exports.maybeS = maybeS;
exports.n = n;
exports.maybeN = maybeN;
exports.b = b;
exports.validateAppEnv = validateAppEnv;
exports.removeConfigUndefined = removeConfigUndefined;
function s(val) {
    if (typeof val !== 'string') {
        throw new Error('config must be string, but got ' + val);
    }
    return val + '';
}
function maybeS(val) {
    if (val === undefined) {
        return;
    }
    if (typeof val !== 'string') {
        throw new Error('config must be string, but got ' + val);
    }
    return val + '';
}
function n(val) {
    const num = parseFloat(val);
    if (isNaN(num)) {
        throw new Error('config must be number, but got ' + val);
    }
    return num;
}
function maybeN(val) {
    if (val === undefined) {
        return;
    }
    return n(val);
}
function b(val) {
    const string_to_boolean = {
        TRUE: true,
        1: true,
        true: true,
        True: true,
        T: true,
        t: true,
        FALSE: false,
        0: false,
        false: false,
        False: false,
        F: false,
        f: false,
        null: false,
    };
    return !!string_to_boolean[val];
}
function validateAppEnv(appEnv) {
    if (appEnv !== 'development' &&
        appEnv !== 'staging' &&
        appEnv !== 'production' &&
        appEnv !== 'preprod' &&
        appEnv !== 'test') {
        return 'production';
    }
    else {
        return appEnv;
    }
}
function removeConfigUndefined(props) {
    return Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined));
}
