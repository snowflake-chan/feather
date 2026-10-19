"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Texture = void 0;
exports.optimizeTexture = optimizeTexture;
exports.scaleTexture = scaleTexture;
exports.packTexture = packTexture;
exports.textureNodeToTexture = textureNodeToTexture;
exports.packTextures = packTextures;
exports.flipTexture = flipTexture;
exports.rotateTexture = rotateTexture;
exports.extendTextureEdge = extendTextureEdge;
class TextureNode {
    constructor(texture) {
        this.texture = texture;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.rotation = 0;
        this.id = TextureNode.count++;
        if (texture) {
            this.width = texture.width;
            this.height = texture.height;
        }
        else {
            this.children = [];
        }
    }
}
TextureNode.count = 0;
function gcd(n, m) {
    return n % m ? gcd(m, n % m) : m;
}
class Texture {
    constructor(width, height, data) {
        this.width = width;
        this.height = height;
        this.data = data || Array(width * height).fill(0);
    }
    set(x, y, value) {
        this.data[y * this.width + x] = value;
    }
    get(x, y) {
        return this.data[y * this.width + x];
    }
}
exports.Texture = Texture;
function optimizeTexture(texture, extendEdge = false) {
    let gcdRow = 0;
    let gcdColumn = 0;
    for (let i = 0; i < texture.height; i++) {
        let count = 1;
        for (let j = 1; j <= texture.width; j++) {
            if (j < texture.width && texture.get(j, i) === texture.get(j - 1, i)) {
                count++;
            }
            else {
                gcdRow = gcd(gcdRow, count);
                count = 1;
            }
        }
    }
    for (let i = 0; i < texture.width; i++) {
        let count = 1;
        for (let j = 1; j <= texture.height; j++) {
            if (j < texture.height && texture.get(i, j) === texture.get(i, j - 1)) {
                count++;
            }
            else {
                gcdColumn = gcd(gcdColumn, count);
                count = 1;
            }
        }
    }
    if (gcdRow === 0) {
        gcdRow = 1;
    }
    if (gcdColumn === 0) {
        gcdColumn = 1;
    }
    if (gcdRow == 1 && gcdColumn == 1 && !extendEdge) {
        return texture;
    }
    const txt = new Texture(texture.width / gcdRow + (extendEdge ? 2 : 0), texture.height / gcdColumn + (extendEdge ? 2 : 0));
    let ptr = extendEdge ? txt.width + 1 : 0;
    const skips = extendEdge ? 2 : 0;
    for (let i = 0; i < texture.data.length; i++) {
        txt.data[ptr++] = texture.data[i];
        i += gcdRow - 1;
        if (i % texture.width === texture.width - 1) {
            i += texture.width * (gcdColumn - 1);
            ptr += skips;
        }
    }
    if (extendEdge) {
        for (let i = 0; i < txt.width; i++) {
            txt.data[i] = txt.data[i + txt.width];
            txt.data[txt.data.length - 1 - i] =
                txt.data[txt.data.length - 1 - i - txt.width];
        }
        for (let i = 0; i < txt.height; i++) {
            txt.data[i * txt.width] = txt.data[i * txt.width + 1];
            txt.data[i * txt.width + txt.width - 1] =
                txt.data[i * txt.width + txt.width - 2];
        }
    }
    return txt;
}
function scaleTexture(texture, widthScale = 1, heightScale = 1) {
    const txt = new Texture(texture.width * widthScale, texture.height * heightScale);
    let ptr = 0;
    for (let i = 0; i < texture.data.length; i++) {
        for (let j = 0; j < widthScale; j++) {
            txt.data[ptr++] = texture.data[i];
        }
        if (i % texture.width === texture.width - 1) {
            for (let j = 0; j < heightScale - 1; j++) {
                for (let k = 0; k < texture.width * widthScale; k++) {
                    txt.data[ptr] = txt.data[ptr - texture.width * widthScale];
                    ptr++;
                }
            }
        }
    }
    return txt;
}
function packTexture(a, b, freespaces) {
    if (Math.max(a.width, a.height) < Math.max(b.width, b.height)) {
        return packTexture(b, a, freespaces);
    }
    const extendedWidth = a.width < a.height;
    b.rotation = b.width < b.height === extendedWidth ? 0 : 1;
    b.x = extendedWidth ? a.width : 0;
    b.y = extendedWidth ? 0 : a.height;
    const width = a.width + (extendedWidth ? (b.rotation ? b.height : b.width) : 0);
    const height = a.height + (extendedWidth ? 0 : b.rotation ? b.width : b.height);
    const node = new TextureNode();
    node.width = width;
    node.height = height;
    node.children.push(a, b);
    const bWidth = b.rotation ? b.height : b.width;
    const bHeight = b.rotation ? b.width : b.height;
    if (extendedWidth) {
        const y = b.y + bHeight;
        if (y < height) {
            freespaces.push({
                node,
                x: b.x,
                y: bHeight,
                width: bWidth,
                height: height - bHeight,
                minWH: Math.min(bWidth, height - bHeight),
                maxWH: Math.max(bWidth, height - bHeight),
            });
        }
    }
    else {
        const x = b.x + bWidth;
        if (x < width) {
            freespaces.push({
                node,
                x: bWidth,
                y: b.y,
                width: width - bWidth,
                height: bHeight,
                minWH: Math.min(width - bWidth, bHeight),
                maxWH: Math.max(width - bWidth, bHeight),
            });
        }
    }
    return node;
}
function fillFreeSpace(texture, freespaces, idx) {
    const [f] = freespaces.splice(idx, 1);
    let { width, height } = texture;
    if (texture.width > f.width || texture.height > f.height) {
        width = texture.height;
        height = texture.width;
        texture.rotation = 1;
    }
    texture.x = f.x;
    texture.y = f.y;
    f.node.children.push(texture);
    const rightSpace = (f.width - width) * f.height;
    const bottomSpace = f.width * (f.height - height);
    if (rightSpace > bottomSpace) {
        const w = f.width - width;
        const h = f.height;
        freespaces.push({
            node: f.node,
            x: f.x + width,
            y: f.y,
            width: w,
            height: h,
            minWH: Math.min(w, h),
            maxWH: Math.max(w, h),
        });
        if (bottomSpace > 0) {
            const w = width;
            const h = f.height - height;
            freespaces.push({
                node: f.node,
                x: f.x,
                y: f.y + height,
                width: w,
                height: h,
                minWH: Math.min(w, h),
                maxWH: Math.max(w, h),
            });
        }
    }
    else if (bottomSpace > rightSpace) {
        const w = f.width;
        const h = f.height - height;
        freespaces.push({
            node: f.node,
            x: f.x,
            y: f.y + height,
            width: w,
            height: h,
            minWH: Math.min(w, h),
            maxWH: Math.max(w, h),
        });
        if (rightSpace > 0) {
            const w = f.width - width;
            const h = height;
            freespaces.push({
                node: f.node,
                x: f.x + width,
                y: f.y,
                width: w,
                height: h,
                minWH: Math.min(w, h),
                maxWH: Math.max(w, h),
            });
        }
    }
}
function textureNodeToTexture(node) {
    const texture = new Texture(node.width, node.height);
    const positions = new Map();
    function draw(n, x, y, rotation) {
        if (n.texture) {
            for (let i = 0; i < n.texture.width; i++) {
                for (let j = 0; j < n.texture.height; j++) {
                    texture.set(x + (rotation ? n.texture.height - 1 - j : i), y + (rotation ? i : j), n.texture.get(i, j));
                }
            }
            positions.set(n.texture, {
                x,
                y,
                rotation,
                width: rotation ? n.texture.height : n.texture.width,
                height: rotation ? n.texture.width : n.texture.height,
            });
            delete n.texture;
        }
        else {
            for (const c of n.children) {
                draw(c, x + (rotation ? c.y : c.x), y + (rotation ? c.x : c.y), rotation ^ c.rotation);
            }
        }
    }
    draw(node, node.x, node.y, node.rotation);
    return {
        texture,
        positions,
    };
}
function packTextures(textures) {
    const txts = textures
        .map((t) => new TextureNode(t))
        .sort((a, b) => {
        const aa = a.width * a.height;
        const ab = b.width * b.height;
        if (aa === ab) {
            const xa = Math.max(a.width, a.height);
            const xb = Math.max(b.width, b.height);
            if (xa === xb) {
                return Math.min(b.width, b.height) - Math.min(a.width, a.height);
            }
            return xb - xa;
        }
        return ab - aa;
    });
    let texture = txts[0];
    const freespaces = [];
    for (let i = 1; i < txts.length; i++) {
        const txt = txts[i];
        const minWH = Math.min(txt.width, txt.height);
        const maxWH = Math.max(txt.width, txt.height);
        let best = -1;
        for (let j = 0; j < freespaces.length; j++) {
            const cur = freespaces[j];
            if (cur.minWH >= minWH && cur.maxWH >= maxWH) {
                if (best === -1) {
                    best = j;
                }
                else {
                    const pre = freespaces[best];
                    if (cur.width * cur.height < pre.width * pre.height) {
                        best = j;
                    }
                }
            }
        }
        if (best !== -1) {
            fillFreeSpace(txt, freespaces, best);
        }
        else {
            texture = packTexture(texture, txt, freespaces);
        }
    }
    return {
        texture,
        wastes: freespaces.reduce((prev, cur) => prev + cur.width * cur.height, 0),
    };
}
function flipTexture(a) {
    const t = new Texture(a.height, a.width);
    for (let i = 0; i < a.width; i++) {
        for (let j = 0; j < a.height; j++) {
            t.set(j, i, a.get(i, j));
        }
    }
    return t;
}
function rotateTexture(a) {
    const t = new Texture(a.height, a.width);
    for (let i = 0; i < a.width; i++) {
        for (let j = 0; j < a.height; j++) {
            t.set(j, i, a.get(a.width - 1 - i, j));
        }
    }
    return t;
}
function extendTextureEdge(a) {
    const t = new Texture(a.width + 2, a.height + 2);
    for (let i = 0; i < t.width; i++) {
        for (let j = 0; j < t.height; j++) {
            t.set(i, j, a.get(Math.min(Math.max(0, i - 1), a.width - 1), Math.min(Math.max(0, j - 1), a.height - 1)));
        }
    }
    return t;
}
