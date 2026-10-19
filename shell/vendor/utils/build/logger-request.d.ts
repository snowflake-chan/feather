import * as http from 'http';
export declare function requestToLog(req: http.IncomingMessage, uuid: string): {
    uuid: string;
    httpVersion: string;
    method: string | undefined;
    rawHeaders: string[];
    url: string;
    ip: string;
};
//# sourceMappingURL=logger-request.d.ts.map