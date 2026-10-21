function fillArrayAPI<T extends number[]|Int16Array|Uint8Array|Uint16Array|Uint32Array|Float32Array|Float64Array> (array:T, value:number) {
    array.fill(value);
}

function fillArrayPolyfill<T extends number[]|Int16Array|Uint8Array|Uint16Array|Uint32Array|Float32Array|Float64Array> (array:T, value:number) {
    for (let i = 0; i < array.length; ++i) {
        array[i] = value;
    }
}

// This method makes sure we use the polyfill if we're using polyfail.ts (which we do in dev)
const typedArrayPrototype = Object.getPrototypeOf(Uint8Array).prototype;
export const fillArray = (typedArrayPrototype && typedArrayPrototype.fill !== undefined) ? fillArrayAPI : fillArrayPolyfill;
