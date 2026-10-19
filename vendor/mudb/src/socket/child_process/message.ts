/**
 * 用于内部通信的消息
 */
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
