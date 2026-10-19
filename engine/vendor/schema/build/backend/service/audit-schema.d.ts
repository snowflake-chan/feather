import { MuStruct, MuUTF8, MuArray, MuVarint, MuDate, MuSchema, MuOption } from '@box/mudb/schema';
import { UploadScene } from '../rpc/user-protocol';
export declare enum AuditType {
    image = 0,
    audio = 1
}
export declare enum AuditStatus {
    init = 0,
    waiting = 1,
    reject = 2,
    accept = 3,
    manuallyReject = 4,
    manuallyAccept = 5,
    error = 6
}
export type Label = 'normal' | 'spam' | 'ad' | 'politics' | 'terrorism' | 'abuse' | 'porn' | 'flood' | 'contraband' | 'meaningless' | 'customized';
export type Suggestion = 'pass' | 'review' | 'block';
export declare const AuditDetailSchema: MuStruct<{
    startTime: MuVarint;
    endTime: MuVarint;
    text: MuUTF8;
    label: MuSchema<Label>;
    hintWords: MuOption<MuArray<MuUTF8>>;
    keyword: MuUTF8;
    libName: MuUTF8;
}>;
export declare const AuditResultSchema: MuStruct<{
    scene: MuUTF8;
    label: MuSchema<Label>;
    suggestion: MuSchema<Suggestion>;
    rate: MuVarint;
    details: MuOption<MuArray<MuStruct<{
        startTime: MuVarint;
        endTime: MuVarint;
        text: MuUTF8;
        label: MuSchema<Label>;
        hintWords: MuOption<MuArray<MuUTF8>>;
        keyword: MuUTF8;
        libName: MuUTF8;
    }>>>;
}>;
export declare const UploadHistorySchema: MuStruct<{
    id: MuVarint;
    user_id: MuVarint;
    hash: MuUTF8;
    type: MuSchema<AuditType>;
    scence: MuSchema<UploadScene>;
    created_at: MuDate;
    updated_at: MuDate;
}>;
export declare const AuditSchema: MuStruct<{
    id: MuVarint;
    hash: MuUTF8;
    type: MuSchema<AuditType>;
    task_id: MuUTF8;
    original_info: MuStruct<{
        scene: MuUTF8;
        label: MuSchema<Label>;
        suggestion: MuSchema<Suggestion>;
        rate: MuVarint;
        details: MuOption<MuArray<MuStruct<{
            startTime: MuVarint;
            endTime: MuVarint;
            text: MuUTF8;
            label: MuSchema<Label>;
            hintWords: MuOption<MuArray<MuUTF8>>;
            keyword: MuUTF8;
            libName: MuUTF8;
        }>>>;
    }>;
    error_log: MuUTF8;
    status: MuSchema<AuditStatus>;
    created_at: MuDate;
    updated_at: MuDate;
}>;
//# sourceMappingURL=audit-schema.d.ts.map