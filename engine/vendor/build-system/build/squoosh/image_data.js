"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ImageData {
    constructor(data, width, height) {
        this.data = data;
        this.width = width;
        this.height = height;
    }
}
exports.default = ImageData;
// squoosh requires image data is a global object
// if (typeof global !== 'undefined') {
//   global['ImageData'] = ImageData;
// }
// if (typeof window !== 'undefined') {
//   (<any>window)['ImageData'] = ImageData;
// }
//# sourceMappingURL=image_data.js.map