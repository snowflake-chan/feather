"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageExtension = getImageExtension;
exports.isBase64 = isBase64;
exports.getB64Type = getB64Type;
exports.fetchImageBitmap = fetchImageBitmap;
exports.retrieveImage = retrieveImage;
exports.retrieveWithImage = retrieveWithImage;
function getImageExtension(filename) {
    const found = filename.match(/.(jpg|jpeg|png|gif|svg|ico)$/g);
    if (!found) {
        return '';
    }
    return found[0];
}
function isBase64(b64) {
    const mimeRegex = '(data:\\w+\\/[a-zA-Z\\+\\-\\.]+;base64,)';
    const valueRegex = '(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+/]{3}=)?';
    const regex = mimeRegex + valueRegex;
    return new RegExp('^' + regex + '$', 'gi').test(b64);
}
function getB64Type(b64) {
    return b64.substring(b64.indexOf('/') + 1, b64.indexOf(';base64'));
}
async function fetchImageBitmap(input, init) {
    if (typeof fetch === 'undefined') {
        return Promise.reject('Fetch is not supported.');
    }
    const response = await fetch(input, init);
    const blob = await response.blob();
    return createImageBitmap(blob);
}
let retrieve;
async function retrieveImage(out, url) {
    if ((out.image && out.loaded) || out.error) {
        return out;
    }
    if (!retrieve) {
        if (typeof Image !== 'undefined' && typeof document !== 'undefined') {
            retrieve = retrieveWithImage;
        }
        else if (typeof fetch !== 'undefined') {
            retrieve = retrieveWithFetch;
        }
        else {
            out.error = true;
            return out;
        }
    }
    await retrieve(out, url);
    return out;
}
function retrieveWithImage(out, url) {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    out.image = image;
    return new Promise((resolve) => {
        image.onload = () => {
            out.loaded = true;
            resolve(out);
        };
        image.onerror = () => {
            out.error = true;
            resolve(out);
        };
        image.src = url;
    });
}
async function retrieveWithFetch(out, url) {
    try {
        const image = await fetchImageBitmap(url);
        out.image = image;
        out.loaded = true;
    }
    catch (err) {
        out.error = true;
    }
    return out;
}
