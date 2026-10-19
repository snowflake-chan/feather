"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUIScreen = isUIScreen;
exports.isUIElement = isUIElement;
exports.isUIBoxElement = isUIBoxElement;
exports.isUIBoxNode = isUIBoxNode;
exports.isUITextElement = isUITextElement;
exports.isUITextNode = isUITextNode;
exports.isUIInputElement = isUIInputElement;
exports.isUIInputNode = isUIInputNode;
exports.isUIImageElement = isUIImageElement;
exports.isUIImageNode = isUIImageNode;
exports.isUIScrollBoxElement = isUIScrollBoxElement;
exports.isUIScrollBoxNode = isUIScrollBoxNode;
exports.isUIAutoLayout = isUIAutoLayout;
exports.pickLayoutProp = pickLayoutProp;
exports.pickAutoLayoutProp = pickAutoLayoutProp;
function isUIScreen(value) {
    return value.type === 'screen';
}
function isUIElement(value) {
    return value.type === 'element';
}
function isUIBoxElement(value) {
    return value.type === 'box';
}
function isUIBoxNode(value) {
    return isUIElement(value) && isUIBoxElement(value.data);
}
function isUITextElement(value) {
    return value.type === 'text';
}
function isUITextNode(value) {
    return isUIElement(value) && isUITextElement(value.data);
}
function isUIInputElement(value) {
    return value.type === 'input';
}
function isUIInputNode(value) {
    return isUIElement(value) && isUIInputElement(value.data);
}
function isUIImageElement(value) {
    return value.type === 'image';
}
function isUIImageNode(value) {
    return isUIElement(value) && isUIImageElement(value.data);
}
function isUIScrollBoxElement(value) {
    return value.type === 'scrollBox';
}
function isUIScrollBoxNode(value) {
    return isUIElement(value) && isUIScrollBoxElement(value.data);
}
function isUIAutoLayout(value) {
    return value.type === 'autoLayout';
}
/**
 * 获取屏幕节点或元素节点的布局属性
 */
function pickLayoutProp(value) {
    if (isUIElement(value)) {
        return value.data.data.layout;
    }
    else if (isUIScreen(value)) {
        return value.data.layout;
    }
    else {
        return;
    }
}
/**
 * 获取节点的自布局属性，如果未开启自动布局，返回undefined
 */
function pickAutoLayoutProp(value) {
    const layout = pickLayoutProp(value);
    if (!layout || !isUIAutoLayout(layout)) {
        return;
    }
    return layout;
}
//# sourceMappingURL=util.js.map