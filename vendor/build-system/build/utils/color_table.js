"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorTable = exports.ColorEvent = exports.ColorOption = void 0;
exports.to8Bit = to8Bit;
exports.to24Bit = to24Bit;
var ColorOption;
(function (ColorOption) {
    ColorOption[ColorOption["default"] = 0] = "default";
    ColorOption[ColorOption["monochrome"] = 1] = "monochrome";
    ColorOption[ColorOption["mvColorScheme"] = 2] = "mvColorScheme";
    ColorOption[ColorOption["eightBit"] = 3] = "eightBit";
    ColorOption[ColorOption["custom"] = 4] = "custom";
})(ColorOption || (exports.ColorOption = ColorOption = {}));
exports.ColorEvent = {
    updateColor: 'updateColor',
};
function to8Bit(color) {
    const red = color[0];
    const green = color[1];
    const blue = color[2];
    const encodedData = (Math.floor(red / 32) << 5) +
        (Math.floor(green / 32) << 2) +
        Math.floor(blue / 64);
    return encodedData;
}
function to24Bit(packed) {
    const r = (packed >> 5) * 32;
    const g = ((packed & 28) >> 2) * 32;
    const b = (packed & 3) * 64;
    return [r, g, b];
}
function rgbToHex(R, G, B) {
    if (Array.isArray(R)) {
        return '#' + toHex(R[0]) + toHex(R[1]) + toHex(R[2]);
    }
    return '#' + toHex(R) + toHex(G) + toHex(B);
}
function toHex(n) {
    n = parseInt(n, 10);
    if (isNaN(n)) {
        return '00';
    }
    n = Math.max(0, Math.min(n, 255));
    return ('0123456789ABCDEF'.charAt((n - (n % 16)) / 16) +
        '0123456789ABCDEF'.charAt(n % 16));
}
function hexToRgb(hexStr) {
    const rgb = new Float32Array(3);
    if (hexStr.length === 7 && hexStr[0] == '#') {
        rgb[0] = parseInt(hexStr.slice(1, 3), 16) / 255;
        rgb[1] = parseInt(hexStr.slice(3, 5), 16) / 255;
        rgb[2] = parseInt(hexStr.slice(5, 7), 16) / 255;
    }
    else if (hexStr.length === 6) {
        rgb[0] = parseInt(hexStr.slice(0, 2), 16) / 255;
        rgb[1] = parseInt(hexStr.slice(2, 4), 16) / 255;
        rgb[2] = parseInt(hexStr.slice(4, 6), 16) / 255;
    }
    return rgb;
}
function generateMonochrome(list) {
    list.push(undefined);
    const coeff = 246 / 255;
    const h1 = 255 / 2;
    const h2 = 246 / 2;
    for (let i = 1; i <= 255; i++) {
        const v = (i - h1) * coeff + h2;
        list[i] = [v / 255, v / 255, v / 255];
    }
}
let mvColor = '[{"r":255,"g":255,"b":255,"a":255},{"r":220,"g":159,"b":180,"a":255},{"r":225,"g":107,"b":140,"a":255},{"r":142,"g":53,"b":74,"a":255},{"r":248,"g":195,"b":205,"a":255},{"r":244,"g":167,"b":185,"a":255},{"r":100,"g":54,"b":60,"a":255},{"r":245,"g":150,"b":170,"a":255},{"r":181,"g":73,"b":91,"a":255},{"r":232,"g":122,"b":144,"a":255},{"r":208,"g":90,"b":110,"a":255},{"r":219,"g":77,"b":109,"a":255},{"r":254,"g":223,"b":225,"a":255},{"r":158,"g":122,"b":122,"a":255},{"r":208,"g":16,"b":76,"a":255},{"r":159,"g":53,"b":58,"a":255},{"r":203,"g":27,"b":69,"a":255},{"r":238,"g":169,"b":169,"a":255},{"r":191,"g":103,"b":102,"a":255},{"r":134,"g":71,"b":63,"a":255},{"r":177,"g":150,"b":147,"a":255},{"r":235,"g":122,"b":119,"a":255},{"r":149,"g":74,"b":69,"a":255},{"r":169,"g":99,"b":96,"a":255},{"r":203,"g":64,"b":66,"a":255},{"r":171,"g":59,"b":58,"a":255},{"r":215,"g":196,"b":187,"a":255},{"r":144,"g":72,"b":64,"a":255},{"r":115,"g":67,"b":56,"a":255},{"r":199,"g":62,"b":58,"a":255},{"r":85,"g":66,"b":54,"a":255},{"r":153,"g":70,"b":57,"a":255},{"r":241,"g":148,"b":131,"a":255},{"r":181,"g":68,"b":52,"a":255},{"r":185,"g":136,"b":125,"a":255},{"r":241,"g":124,"b":103,"a":255},{"r":136,"g":76,"b":58,"a":255},{"r":232,"g":48,"b":21,"a":255},{"r":215,"g":84,"b":85,"a":255},{"r":181,"g":93,"b":76,"a":255},{"r":133,"g":72,"b":54,"a":255},{"r":163,"g":94,"b":71,"a":255},{"r":204,"g":84,"b":58,"a":255},{"r":114,"g":72,"b":50,"a":255},{"r":247,"g":92,"b":47,"a":255},{"r":106,"g":64,"b":40,"a":255},{"r":154,"g":80,"b":52,"a":255},{"r":196,"g":98,"b":67,"a":255},{"r":175,"g":95,"b":60,"a":255},{"r":251,"g":150,"b":110,"a":255},{"r":114,"g":73,"b":56,"a":255},{"r":180,"g":113,"b":87,"a":255},{"r":219,"g":142,"b":113,"a":255},{"r":240,"g":94,"b":28,"a":255},{"r":237,"g":120,"b":74,"a":255},{"r":202,"g":120,"b":83,"a":255},{"r":179,"g":92,"b":55,"a":255},{"r":86,"g":63,"b":46,"a":255},{"r":227,"g":145,"b":110,"a":255},{"r":143,"g":90,"b":60,"a":255},{"r":240,"g":169,"b":134,"a":255},{"r":160,"g":103,"b":75,"a":255},{"r":193,"g":105,"b":60,"a":255},{"r":251,"g":153,"b":102,"a":255},{"r":148,"g":122,"b":109,"a":255},{"r":163,"g":99,"b":54,"a":255},{"r":231,"g":148,"b":96,"a":255},{"r":125,"g":83,"b":44,"a":255},{"r":199,"g":133,"b":80,"a":255},{"r":152,"g":95,"b":42,"a":255},{"r":225,"g":166,"b":121,"a":255},{"r":133,"g":91,"b":50,"a":255},{"r":252,"g":159,"b":77,"a":255},{"r":255,"g":186,"b":132,"a":255},{"r":233,"g":139,"b":42,"a":255},{"r":233,"g":163,"b":104,"a":255},{"r":177,"g":120,"b":68,"a":255},{"r":150,"g":99,"b":46,"a":255},{"r":202,"g":122,"b":44,"a":255},{"r":67,"g":52,"b":27,"a":255},{"r":236,"g":184,"b":138,"a":255},{"r":120,"g":85,"b":43,"a":255},{"r":176,"g":119,"b":54,"a":255},{"r":150,"g":114,"b":73,"a":255},{"r":226,"g":148,"b":59,"a":255},{"r":199,"g":128,"b":45,"a":255},{"r":155,"g":110,"b":35,"a":255},{"r":110,"g":85,"b":47,"a":255},{"r":235,"g":180,"b":113,"a":255},{"r":215,"g":185,"b":142,"a":255},{"r":130,"g":102,"b":58,"a":255},{"r":182,"g":142,"b":85,"a":255},{"r":188,"g":159,"b":119,"a":255},{"r":135,"g":102,"b":51,"a":255},{"r":193,"g":138,"b":38,"a":255},{"r":255,"g":177,"b":27,"a":255},{"r":209,"g":152,"b":38,"a":255},{"r":221,"g":165,"b":45,"a":255},{"r":201,"g":152,"b":51,"a":255},{"r":249,"g":191,"b":69,"a":255},{"r":220,"g":184,"b":121,"a":255},{"r":186,"g":145,"b":50,"a":255},{"r":232,"g":182,"b":71,"a":255},{"r":247,"g":194,"b":66,"a":255},{"r":125,"g":108,"b":70,"a":255},{"r":218,"g":201,"b":166,"a":255},{"r":250,"g":214,"b":137,"a":255},{"r":217,"g":171,"b":66,"a":255},{"r":246,"g":197,"b":85,"a":255},{"r":255,"g":196,"b":8,"a":255},{"r":239,"g":187,"b":36,"a":255},{"r":202,"g":173,"b":95,"a":255},{"r":141,"g":116,"b":42,"a":255},{"r":180,"g":165,"b":130,"a":255},{"r":135,"g":127,"b":108,"a":255},{"r":137,"g":125,"b":85,"a":255},{"r":116,"g":103,"b":62,"a":255},{"r":162,"g":140,"b":55,"a":255},{"r":108,"g":96,"b":36,"a":255},{"r":134,"g":120,"b":53,"a":255},{"r":98,"g":89,"b":44,"a":255},{"r":233,"g":205,"b":76,"a":255},{"r":247,"g":217,"b":76,"a":255},{"r":251,"g":226,"b":81,"a":255},{"r":217,"g":205,"b":144,"a":255},{"r":173,"g":161,"b":66,"a":255},{"r":221,"g":210,"b":59,"a":255},{"r":165,"g":160,"b":81,"a":255},{"r":190,"g":194,"b":63,"a":255},{"r":108,"g":106,"b":45,"a":255},{"r":147,"g":150,"b":80,"a":255},{"r":131,"g":138,"b":45,"a":255},{"r":177,"g":180,"b":121,"a":255},{"r":97,"g":97,"b":56,"a":255},{"r":75,"g":78,"b":42,"a":255},{"r":91,"g":98,"b":46,"a":255},{"r":77,"g":81,"b":57,"a":255},{"r":137,"g":145,"b":107,"a":255},{"r":144,"g":180,"b":75,"a":255},{"r":145,"g":173,"b":112,"a":255},{"r":181,"g":202,"b":160,"a":255},{"r":100,"g":106,"b":88,"a":255},{"r":123,"g":162,"b":63,"a":255},{"r":134,"g":193,"b":102,"a":255},{"r":74,"g":89,"b":61,"a":255},{"r":66,"g":96,"b":45,"a":255},{"r":81,"g":110,"b":65,"a":255},{"r":145,"g":180,"b":147,"a":255},{"r":128,"g":143,"b":124,"a":255},{"r":27,"g":129,"b":62,"a":255},{"r":93,"g":172,"b":129,"a":255},{"r":54,"g":86,"b":60,"a":255},{"r":34,"g":125,"b":81,"a":255},{"r":168,"g":216,"b":185,"a":255},{"r":106,"g":131,"b":114,"a":255},{"r":45,"g":109,"b":75,"a":255},{"r":70,"g":93,"b":76,"a":255},{"r":36,"g":147,"b":110,"a":255},{"r":134,"g":166,"b":151,"a":255},{"r":0,"g":137,"b":108,"a":255},{"r":9,"g":97,"b":72,"a":255},{"r":32,"g":96,"b":79,"a":255},{"r":15,"g":76,"b":58,"a":255},{"r":79,"g":114,"b":108,"a":255},{"r":0,"g":170,"b":144,"a":255},{"r":105,"g":176,"b":172,"a":255},{"r":38,"g":69,"b":61,"a":255},{"r":102,"g":186,"b":183,"a":255},{"r":38,"g":135,"b":133,"a":255},{"r":64,"g":91,"b":85,"a":255},{"r":48,"g":90,"b":86,"a":255},{"r":120,"g":194,"b":196,"a":255},{"r":55,"g":107,"b":109,"a":255},{"r":165,"g":222,"b":228,"a":255},{"r":119,"g":150,"b":154,"a":255},{"r":102,"g":153,"b":161,"a":255},{"r":129,"g":199,"b":212,"a":255},{"r":51,"g":166,"b":184,"a":255},{"r":12,"g":72,"b":66,"a":255},{"r":13,"g":86,"b":97,"a":255},{"r":0,"g":137,"b":167,"a":255},{"r":51,"g":103,"b":116,"a":255},{"r":37,"g":83,"b":89,"a":255},{"r":30,"g":136,"b":168,"a":255},{"r":86,"g":108,"b":115,"a":255},{"r":87,"g":124,"b":138,"a":255},{"r":88,"g":178,"b":220,"a":255},{"r":43,"g":95,"b":117,"a":255},{"r":58,"g":143,"b":183,"a":255},{"r":46,"g":92,"b":110,"a":255},{"r":0,"g":98,"b":132,"a":255},{"r":125,"g":185,"b":222,"a":255},{"r":81,"g":168,"b":221,"a":255},{"r":46,"g":169,"b":223,"a":255},{"r":11,"g":16,"b":19,"a":255},{"r":15,"g":37,"b":64,"a":255},{"r":8,"g":25,"b":45,"a":255},{"r":0,"g":92,"b":175,"a":255},{"r":11,"g":52,"b":110,"a":255},{"r":123,"g":144,"b":210,"a":255},{"r":110,"g":117,"b":164,"a":255},{"r":38,"g":30,"b":71,"a":255},{"r":17,"g":50,"b":133,"a":255},{"r":78,"g":79,"b":151,"a":255},{"r":33,"g":30,"b":85,"a":255},{"r":139,"g":129,"b":195,"a":255},{"r":112,"g":100,"b":154,"a":255},{"r":155,"g":144,"b":194,"a":255},{"r":138,"g":107,"b":190,"a":255},{"r":106,"g":76,"b":156,"a":255},{"r":143,"g":119,"b":181,"a":255},{"r":83,"g":61,"b":91,"a":255},{"r":178,"g":143,"b":206,"a":255},{"r":152,"g":109,"b":178,"a":255},{"r":119,"g":66,"b":141,"a":255},{"r":60,"g":47,"b":65,"a":255},{"r":74,"g":34,"b":93,"a":255},{"r":102,"g":50,"b":124,"a":255},{"r":89,"g":44,"b":99,"a":255},{"r":111,"g":51,"b":129,"a":255},{"r":87,"g":76,"b":87,"a":255},{"r":180,"g":129,"b":187,"a":255},{"r":63,"g":43,"b":54,"a":255},{"r":87,"g":42,"b":63,"a":255},{"r":94,"g":61,"b":80,"a":255},{"r":114,"g":99,"b":110,"a":255},{"r":98,"g":41,"b":84,"a":255},{"r":109,"g":46,"b":91,"a":255},{"r":193,"g":50,"b":142,"a":255},{"r":168,"g":73,"b":122,"a":255},{"r":86,"g":46,"b":55,"a":255},{"r":224,"g":60,"b":138,"a":255},{"r":96,"g":55,"b":62,"a":255},{"r":252,"g":250,"b":242,"a":255},{"r":255,"g":255,"b":251,"a":255},{"r":189,"g":192,"b":186,"a":255},{"r":145,"g":152,"b":159,"a":255},{"r":120,"g":125,"b":123,"a":255},{"r":112,"g":124,"b":116,"a":255},{"r":101,"g":103,"b":101,"a":255},{"r":83,"g":89,"b":83,"a":255},{"r":79,"g":79,"b":72,"a":255},{"r":82,"g":67,"b":61,"a":255},{"r":55,"g":60,"b":56,"a":255},{"r":58,"g":50,"b":38,"a":255},{"r":238,"g":238,"b":238,"a":255},{"r":221,"g":221,"b":221,"a":255},{"r":187,"g":187,"b":187,"a":255},{"r":170,"g":170,"b":170,"a":255},{"r":136,"g":136,"b":136,"a":255},{"r":119,"g":119,"b":119,"a":255},{"r":85,"g":85,"b":85,"a":255},{"r":68,"g":68,"b":68,"a":255},{"r":34,"g":34,"b":34,"a":255},{"r":17,"g":17,"b":17,"a":255}]';
mvColor = JSON.parse(mvColor);
function generateMVColor(list) {
    list.push(undefined);
    for (let i = 0; i < mvColor.length; i++) {
        list.push([mvColor[i].r / 255, mvColor[i].g / 255, mvColor[i].b / 255]);
    }
}
const preset = [
    '#FF5050',
    '#FFAF00',
    '#FFD236',
    '#C3EB37',
    '#23AF41',
    '#73E1C8',
    '#82D2F0',
    '#5FA7FF',
    '#4173F5',
    '#AA64D7',
    '#FF87F5',
    '#FFB4CD',
    '#AF6E28',
    '#FFEDDB',
    '#D7D7D7',
    '#FFFFFF',
    '#A7DACA',
];
function generatePresetColor(list) {
    list.push(undefined);
    let i = 0;
    for (i = 0; i < preset.length; i++) {
        const c = hexToRgb(preset[i]);
        list.push([c[0], c[1], c[2]]);
    }
    for (; i < 255; i++) {
        list.push([63, 70, 77].map((v) => v / 255));
    }
}
function generateEightBitColor(list) {
    list.push(undefined);
    for (let i = 0; i < 254; i++) {
        const c = to24Bit(i);
        list.push([c[0] / 255, c[1] / 255, c[2] / 255]);
    }
    list.push([236 / 255, 236 / 255, 226 / 255]);
}
class ColorTable {
    constructor(options) {
        this._messages = {};
        // rgb value range: [0, 1];
        this.colorsRgb = [];
        // [metalness, smoothness, emissive][];
        this.MSE = [];
        // transparent, refract
        this.TR = [];
        this._currentIndex = 1;
        if (!options) {
            options = {
                type: ColorOption.default,
            };
        }
        this.initColor(options);
        for (let i = 0; i < this.colorsRgb.length; i++) {
            this.MSE[i] = [0, 0, 0];
            this.TR[i] = [0, 127];
        }
    }
    initColor(option) {
        this.colorsRgb = [];
        switch (option.type) {
            case ColorOption.default:
                generatePresetColor(this.colorsRgb);
                break;
            case ColorOption.eightBit:
                generateEightBitColor(this.colorsRgb);
                break;
            case ColorOption.monochrome:
                generateMonochrome(this.colorsRgb);
                break;
            case ColorOption.mvColorScheme:
                generateMVColor(this.colorsRgb);
                break;
            case ColorOption.custom:
                if (typeof option.customColors[1] == 'string') {
                    let i;
                    for (i = 1; i < option.customColors.length; i++) {
                        const c = hexToRgb(option.customColors[i]);
                        this.colorsRgb[i] = [c[0], c[1], c[2]];
                    }
                    for (; i < 256; i++) {
                        this.colorsRgb[i] = [
                            mvColor[i - 1].r / 255,
                            mvColor[i - 1].g / 255,
                            mvColor[i - 1].b / 255,
                        ];
                    }
                }
                else if (option.customColors[1].r !== undefined &&
                    option.customColors[1].b !== undefined &&
                    option.customColors[1].g !== undefined) {
                    for (let i = 1; i < 256; i++) {
                        const { r, g, b } = option.customColors[i];
                        this.colorsRgb[i] = [r / 255, g / 255, b / 255];
                    }
                }
                break;
            default:
                generatePresetColor(this.colorsRgb);
                break;
        }
    }
    initWithExistColors(platte) {
        this.initColor({
            type: ColorOption.custom,
            customColors: platte,
        });
    }
    setPbrArray(pbrArray) {
        const len = Math.min(pbrArray.length, this.MSE.length);
        for (let i = 0; i < len; i++) {
            this.MSE[i][0] = pbrArray[i][0];
            this.MSE[i][1] = pbrArray[i][1];
            this.MSE[i][2] = pbrArray[i][2];
        }
    }
    setTRArray(trArray) {
        const len = Math.min(trArray.length, this.TR.length);
        for (let i = 0; i < len; i++) {
            this.TR[i][0] = trArray[i][0];
            this.TR[i][1] = trArray[i][1];
        }
    }
    getHexColors() {
        const hexColors = [];
        hexColors.push(null);
        for (let i = 1; i < this.colorsRgb.length; i++) {
            hexColors.push(rgbToHex(this.colorsRgb[i].map((v) => v * 255)).slice(1));
        }
        return hexColors;
    }
    getHexColorById(idx) {
        return rgbToHex(this.colorsRgb[idx].map((v) => v * 255)).slice(1);
    }
    getRgbById(idx) {
        return this.colorsRgb[idx];
    }
    getRgbColorById(idx) {
        return [
            this.colorsRgb[idx][0],
            this.colorsRgb[idx][1],
            this.colorsRgb[idx][2],
        ];
    }
    getRGBArray() {
        const colors = [];
        colors.push({
            r: 0,
            g: 0,
            b: 0,
        });
        for (let i = 1; i < this.colorsRgb.length; i++) {
            colors.push({
                r: this.colorsRgb[i][0] * 255,
                g: this.colorsRgb[i][1] * 255,
                b: this.colorsRgb[i][2] * 255,
            });
        }
        return colors;
    }
    setCurrentIndex(idx) {
        if (idx < 1 || idx > 256) {
            console.warn('color index out of range', idx);
            return;
        }
        this._currentIndex = idx;
    }
    getCurrentColor() {
        return {
            index: this._currentIndex,
            colorHex: this.colorsRgb[this._currentIndex],
        };
    }
    updateColor(idx, c) {
        if (idx < 1 && idx > 256) {
            return;
        }
        if (typeof c == 'string') {
            c = hexToRgb(c);
        }
        if (rgbToHex(c[0] * 255, c[1] * 255, c[2] * 255) !==
            rgbToHex(this.colorsRgb[idx][0] * 255, this.colorsRgb[idx][1] * 255, this.colorsRgb[idx][2] * 255)) {
            const preColor = this.colorsRgb[idx].splice(0);
            this.colorsRgb[idx][0] = c[0];
            this.colorsRgb[idx][1] = c[1];
            this.colorsRgb[idx][2] = c[2];
            this.fire(exports.ColorEvent.updateColor, {
                index: idx,
                preColor: preColor,
                currColor: c,
            });
        }
    }
    updatePBRProperties(idx, properties) {
        if (idx < 1 && idx > 256) {
            return;
        }
        if (this.MSE[idx][0] !== properties[0] ||
            this.MSE[idx][1] !== properties[1] ||
            this.MSE[idx][2] !== properties[2]) {
            this.MSE[idx][0] = properties[0];
            this.MSE[idx][1] = properties[1];
            this.MSE[idx][2] = properties[2];
        }
    }
    updateTR(idx, properties) {
        if (idx < 1 && idx > 256) {
            return;
        }
        if (this.TR[idx][0] !== properties[0] ||
            this.TR[idx][1] !== properties[1]) {
            this.TR[idx][0] = properties[0];
            this.TR[idx][1] = properties[1];
        }
    }
    getColor(idx) {
        if (idx < 1 || idx > 256) {
            return void 0;
        }
        return this.colorsRgb[idx];
    }
    getPBRProperties(idx) {
        if (idx < 1 || idx > 256) {
            return void 0;
        }
        return this.MSE[idx];
    }
    getTRProperties(idx) {
        if (idx < 1 || idx > 256) {
            return void 0;
        }
        return this.TR[idx];
    }
    on(event, fn) {
        if (typeof this._messages[event] === 'undefined') {
            this._messages[event] = [fn];
        }
        else {
            this._messages[event].push(fn);
        }
        return this;
    }
    fire(event, args) {
        if (typeof this._messages[event] === 'undefined') {
            return void 0;
        }
        else {
            const environment = {
                event: event,
                args: args || {},
            };
            const len = this._messages[event].length;
            for (let i = 0; i < len; i++) {
                this._messages[event][i].call(this, environment);
            }
        }
        return this;
    }
    remove(event, fn) {
        if (this._messages[event] instanceof Array) {
            let i = this._messages[event].length - 1;
            for (; i >= 0; i--) {
                this._messages[event][i] === fn && this._messages[event].splice(i, 1);
            }
        }
        return this;
    }
    removeAll(event) {
        if (this._messages[event] instanceof Array) {
            this._messages[event].splice(0);
        }
        return this;
    }
}
exports.ColorTable = ColorTable;
//# sourceMappingURL=color_table.js.map