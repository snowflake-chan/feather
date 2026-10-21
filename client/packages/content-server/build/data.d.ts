export type DataRequest = {
    data: Uint8Array | null;
    loaded: boolean;
    error: boolean;
    abort?: () => void;
};
export declare function retrieveData(out: DataRequest, url: string, retryCount?: number, timeout?: number): Promise<void>;
