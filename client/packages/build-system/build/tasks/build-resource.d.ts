import { BuildSystem } from '../build-system';
import { Tasks } from '../type';
import { Hash } from '@box/content-server';
export type RetType = 'hash' | 'json' | 'bin' | 'text';
export type FileResource = {
    file: string;
    skipError?: boolean;
    ext?: string;
    ret?: RetType;
};
export type DirectoryResource = {
    dir: string;
    filter?: string;
    ret?: RetType;
    meta?: boolean;
};
export type FuncResource = {
    func: keyof Tasks;
    args: ResourceSpec[];
    ret?: RetType;
};
export type TableResource = {
    table: {
        [prop: string]: ResourceSpec;
    };
    ret?: RetType;
};
export type JSONResource = {
    json: any;
    ret?: RetType;
};
export type StringResource = {
    str: string;
    ret?: RetType;
};
export type ImportResource = {
    import: string;
    ret?: RetType;
};
export type ResourceSpec = FileResource | DirectoryResource | FuncResource | TableResource | JSONResource | ImportResource | StringResource;
export declare function buildResource(bs: BuildSystem, dirHash: Hash, resourceHash: Hash): Promise<any>;
//# sourceMappingURL=build-resource.d.ts.map