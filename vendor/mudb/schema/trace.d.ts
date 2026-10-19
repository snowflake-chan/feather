import { MuSchema } from './schema';
import { MuWriteStream, MuReadStream } from '../stream';
export declare class MuSchemaLogger<BaseSchema extends MuSchema<any>> {
    name: string;
    allocCount: number;
    freeCount: number;
    private _schema;
    private _savedAlloc;
    private _savedFree;
    constructor(schema: MuSchemaTrace<BaseSchema>, name: string);
    begin(): void;
    end(): void;
}
export declare class MuSchemaTrace<BaseSchema extends MuSchema<any>> implements MuSchema<BaseSchema['identity']> {
    schema: BaseSchema;
    identity: BaseSchema['identity'];
    muType: BaseSchema['muType'];
    muData: BaseSchema['muData'];
    json: any;
    logs: MuSchemaLogger<BaseSchema>[];
    allocCount: number;
    freeCount: number;
    createLog(name: string): MuSchemaLogger<BaseSchema>;
    printLog(): void;
    constructor(base: BaseSchema);
    alloc(): BaseSchema['identity'];
    free(x: BaseSchema['identity']): void;
    equal(a: BaseSchema['identity'], b: BaseSchema['identity']): boolean;
    clone(x: BaseSchema['identity']): BaseSchema['identity'];
    assign(dst: BaseSchema['identity'], src: BaseSchema['identity']): BaseSchema['identity'];
    diff(base: BaseSchema['identity'], target: BaseSchema['identity'], out: MuWriteStream): boolean;
    patch(base: BaseSchema['identity'], inp: MuReadStream): BaseSchema['identity'];
    toJSON(x: BaseSchema['identity']): any;
    fromJSON(json: any): BaseSchema['identity'];
}
//# sourceMappingURL=trace.d.ts.map