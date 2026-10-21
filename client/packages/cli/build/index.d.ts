/**
 * Stable protocol surface shared by CLI clients and Creator HTTP adapters.
 * This module deliberately contains no HTTP, credential or storage code:
 * those are adapters owned by the calling application.
 */
export declare const CREATOR_API_VERSION: "v1";
export declare const CREATOR_API_PREFIX: "/api/creator/v1";
export declare const CREATOR_SCRIPT_SIDES: readonly ["client", "server"];
export type CreatorScriptSide = typeof CREATOR_SCRIPT_SIDES[number];
export declare const CREATOR_SCRIPT_MAX_BYTES: number;
export type CreatorProjectScriptWrite = Readonly<{
    projectId: string;
    side: CreatorScriptSide;
    entry: string;
    content: string;
}>;
export type CreatorProjectScriptWriteResult = Readonly<{
    entry: string;
    side: CreatorScriptSide;
    revision: string;
    hash: string;
    shared: boolean;
    skipped?: boolean;
}>;
export type CreatorProjectScriptReadResult = Readonly<{
    entry: string;
    side: CreatorScriptSide;
    hash: string;
    shared: boolean;
    content: string;
}>;
export interface CreatorProjectScriptStore {
    updateProjectScript(projectId: string, side: CreatorScriptSide, entry: string, content: string): CreatorProjectScriptWriteResult;
    readProjectScript(projectId: string, side: CreatorScriptSide, entry: string): CreatorProjectScriptReadResult;
}
export declare function creatorApiPath(...segments: readonly (string | number)[]): string;
export declare function creatorProjectScriptPath(projectId: string, side: CreatorScriptSide, entry: string): string;
export declare function parseCreatorProjectScriptWrite(value: unknown): CreatorProjectScriptWrite;
export declare function parseCreatorProjectScriptReference(value: unknown): Readonly<{
    projectId: string;
    side: CreatorScriptSide;
    entry: string;
    content: string;
}>;
export declare function writeCreatorProjectScript(store: CreatorProjectScriptStore, input: CreatorProjectScriptWrite): CreatorProjectScriptWriteResult;
export declare function readCreatorProjectScript(store: CreatorProjectScriptStore, input: Omit<CreatorProjectScriptWrite, 'content'>): Readonly<{
    entry: string;
    side: CreatorScriptSide;
    hash: string;
    shared: boolean;
    content: string;
}>;
