export type ProcessInternalMessage = ConnectMessage | CloseMessage;
type ConnectMessage = {
    type: 'connect';
    payload: {
        sessionId: string;
    };
};
type CloseMessage = {
    type: 'close';
};
export {};
//# sourceMappingURL=message.d.ts.map