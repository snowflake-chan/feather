export function getImageExtension (filename:string) : string {
    const found = filename.match(/.(jpg|jpeg|png|gif|svg|ico)$/g);
    if (!found) {
        return '';
    }
    return found[0];
}

export function isBase64 (b64:string) {
    const mimeRegex = '(data:\\w+\\/[a-zA-Z\\+\\-\\.]+;base64,)';
    const valueRegex = '(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+\/]{3}=)?';
    const regex = mimeRegex + valueRegex;
    return (new RegExp('^' + regex + '$', 'gi')).test(b64);
}

export function getB64Type (b64:string) {
    return b64.substring(b64.indexOf('/') + 1, b64.indexOf(';base64'));
}
