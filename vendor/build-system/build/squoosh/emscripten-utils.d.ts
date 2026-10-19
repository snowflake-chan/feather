import { ContentServer } from '@box/content-server';
import { EmscriptenWasm } from './emscripten-types';
export declare function instantiateEmscriptenWasm<T>(factory: (require: any) => EmscriptenWasm.ModuleFactory<T & EmscriptenWasm.Module>, hash: string): (content: ContentServer) => Promise<T>;
//# sourceMappingURL=emscripten-utils.d.ts.map