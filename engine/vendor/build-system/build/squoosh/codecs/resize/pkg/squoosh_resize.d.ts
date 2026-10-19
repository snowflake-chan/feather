/**
 * @param {Uint8Array} input_image
 * @param {number} input_width
 * @param {number} input_height
 * @param {number} output_width
 * @param {number} output_height
 * @param {number} typ_idx
 * @param {boolean} premultiply
 * @param {boolean} color_space_conversion
 * @returns {Uint8Array}
 */
export function resize(input_image: Uint8Array, input_width: number, input_height: number, output_width: number, output_height: number, typ_idx: number, premultiply: boolean, color_space_conversion: boolean): Uint8Array;
export default init;
declare function init(input: any): Promise<WebAssembly.Exports>;
//# sourceMappingURL=squoosh_resize.d.ts.map