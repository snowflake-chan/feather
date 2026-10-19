export default class ImageData {
  constructor(
    public data: Uint8ClampedArray,
    public width: number,
    public height: number,
  ) {}
}

// squoosh requires image data is a global object
// if (typeof global !== 'undefined') {
//   global['ImageData'] = ImageData;
// }
// if (typeof window !== 'undefined') {
//   (<any>window)['ImageData'] = ImageData;
// }
