/**
* @param {Uint8Array} data
* @param {number} width
* @param {number} height
* @returns {Uint8Array}
*/
export function encode(data: Uint8Array, width: number, height: number): Uint8Array;
/**
* @param {Uint8Array} data
* @returns {ImageData}
*/
export function decode(data: Uint8Array): ImageData;
export default init;
declare function init(input: any): Promise<WebAssembly.Exports>;
//# sourceMappingURL=squoosh_png.d.ts.map