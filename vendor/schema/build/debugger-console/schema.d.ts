import { MuUTF8, MuUint32, MuStruct, MuArray, MuBoolean } from '@box/mudb/schema';
export declare const StackFrameSchema: MuStruct<{
    function: MuUTF8;
    file: MuUTF8;
    line: MuUint32;
    column: MuUint32;
    source: MuUTF8;
    isolate: MuBoolean;
}>;
export declare const ParsedErrorSchema: MuStruct<{
    name: MuUTF8;
    message: MuUTF8;
    stack: MuArray<MuStruct<{
        function: MuUTF8;
        file: MuUTF8;
        line: MuUint32;
        column: MuUint32;
        source: MuUTF8;
        isolate: MuBoolean;
    }>>;
}>;
/**
 * 用在 DebuggerConsole 中存储错误信息的结构
 * 为了方便前后端通信，所以是个 Schema
 */
export type ParsedError = typeof ParsedErrorSchema.identity;
//# sourceMappingURL=schema.d.ts.map