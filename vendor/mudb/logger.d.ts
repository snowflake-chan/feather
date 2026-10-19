export interface MuLogger {
    log: (mesg: string) => void;
    error: (mesg: string) => void;
    exception: (e: Error) => void;
}
export declare const MuDefaultLogger: {
    log: () => void;
    error: (x: string) => void;
    exception: {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
};
//# sourceMappingURL=logger.d.ts.map