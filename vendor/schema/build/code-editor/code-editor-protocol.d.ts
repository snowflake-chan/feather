import { MuVoid, MuUTF8, MuStruct, MuBoolean, MuFloat32 } from '@box/mudb/schema';
export declare const ShareScriptResSchema: MuStruct<{
    success: MuBoolean;
    errorCode: MuFloat32;
}>;
export type ShareScriptResState = typeof ShareScriptResSchema.identity;
export declare const CodeEditorProtocol: {
    name: string;
    client: {
        getSession: MuUTF8;
        syncFile: MuStruct<{
            fileId: MuUTF8;
            name: MuUTF8;
            text: MuUTF8;
            order: MuFloat32;
            isClient: MuBoolean;
            isShare: MuBoolean;
            isUploading: MuBoolean;
            lockedMapTitle: MuUTF8;
            lockedMapId: import("@box/mudb/schema").MuVarint;
            size: import("@box/mudb/schema").MuVarint;
        }>;
        removeFile: MuUTF8;
        syncCursor: MuStruct<{
            sessionId: MuUTF8;
            name: MuUTF8;
            fileId: MuUTF8;
            startPosId: MuUTF8;
            endPosId: MuUTF8;
        }>;
        syncCursorName: MuStruct<{
            sessionId: MuUTF8;
            name: MuUTF8;
            fileId: MuUTF8;
            startPosId: MuUTF8;
            endPosId: MuUTF8;
        }>;
        removeCursor: MuUTF8;
        syncCursorDict: import("@box/mudb/schema").MuDictionary<MuStruct<{
            sessionId: MuUTF8;
            name: MuUTF8;
            fileId: MuUTF8;
            startPosId: MuUTF8;
            endPosId: MuUTF8;
        }>>;
        addFileSuccess: MuUTF8;
        onShareAutoSave: MuUTF8;
    };
    server: {
        copyFile: MuUTF8;
        renameFile: MuStruct<{
            name: MuUTF8;
            fileId: MuUTF8;
        }>;
        recoverFile: MuStruct<{
            isClient: MuBoolean;
            name: MuUTF8;
            hash: MuUTF8;
        }>;
        addFile: MuBoolean;
        addFileForce: MuStruct<{
            fileId: MuUTF8;
            name: MuUTF8;
            hash: MuUTF8;
            isClient: MuBoolean;
        }>;
        selectFile: MuUTF8;
        blurFile: MuVoid;
        removeFile: MuUTF8;
        syncCursorName: MuUTF8;
        syncCursor: MuStruct<{
            sessionId: MuUTF8;
            name: MuUTF8;
            fileId: MuUTF8;
            startPosId: MuUTF8;
            endPosId: MuUTF8;
        }>;
    };
};
//# sourceMappingURL=code-editor-protocol.d.ts.map