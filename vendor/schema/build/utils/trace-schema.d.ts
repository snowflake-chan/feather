import { MuSchema } from '@box/mudb/schema';
import { MuServer } from '@box/mudb/server';
import { MuClient } from '@box/mudb/client';
export declare class SchemaTraceEntry {
    name: string;
    schema: MuSchema<any>;
    liveCount: number;
    allocCount: number;
    freeCount: number;
    poolSize: number;
    constructor(petName: string, schema: MuSchema<any>);
}
export declare function trapDoubleFree(schemas: SchemaTraceEntry[]): void;
export declare function traceMathSchemas(schemaList: SchemaTraceEntry[]): void;
export declare function trapAllocCounters(schemas: SchemaTraceEntry[]): () => SchemaTraceEntry[];
export declare function traceProtocols(schemaList: SchemaTraceEntry[], host: MuServer | MuClient): void;
export declare function traceSchema(petName: string, schema: MuSchema<any>, schemaList?: SchemaTraceEntry[]): void;
//# sourceMappingURL=trace-schema.d.ts.map