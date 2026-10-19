import type { ChildProcess } from 'child_process';
import defineDebug from 'debug';
import {
    MuCloseHandler,
    MuConnectionHandler,
    MuData,
    MuMessageHandler,
    MuSessionId,
    MuSocket,
    MuSocketServer,
    MuSocketServerSpec,
    MuSocketServerState,
    MuSocketSpec,
    MuSocketState,
} from '../socket';
import type { ProcessInternalMessage } from './message';

const debug = defineDebug('mudb:socket:child-process:server');

function noop() {
    debug('noop invoked');
}

export class MuChildProcessSocketClient implements MuSocket {
    static clientCount = 0;
    private _state = MuSocketState.INIT;
    public sessionId: MuSessionId;
    public state() {
        return this._state;
    }

    /**
     * a child-process object
     **/
    private _socket: ChildProcess;

    /**
     * 配置的消息处理函数
     */
    private _onmessage: MuMessageHandler = noop;

    private _closeCallbackPerOpen: MuCloseHandler = noop;
    private _closeCallbackPerClient: MuCloseHandler;

    constructor({
        sessionId,
        socket,
        onClientClose,
    }: {
        sessionId: MuSessionId;
        socket: ChildProcess;
        onClientClose: MuCloseHandler;
    }) {
        debug('new child-process socket client');
        this._socket = socket;
        this.sessionId = sessionId;
        this._closeCallbackPerClient = onClientClose;
    }

    public open(spec: MuSocketSpec) {
        debug('open child-process socket client');
        if (this._state === MuSocketState.OPEN) {
            throw new Error('server-side child-process socket already open');
        }
        if (this._state === MuSocketState.CLOSED) {
            throw new Error(
                'server-side child-process socket already closed, cannot reopen',
            );
        }

        this._onmessage = spec.message;
        this._closeCallbackPerOpen = spec.close;
        this.addChildProcessListeners();
        this._state = MuSocketState.OPEN;

        spec.ready();
    }

    /**
     * 当 ChildProcess 发生对应事件时进行相应的处理
     */
    private addChildProcessListeners() {
        this._socket.on('message', this._onMessage);
    }
    private removeChildProcessListeners() {
        this._socket.removeListener('message', this._onMessage);
    }

    private _onMessage = (data: { message: MuData; unreliable: boolean }) => {
        if (!data.message) {
            return;
        }

        this._onmessage(data.message, data.unreliable);
    };

    public send(message: MuData, unreliable_?: boolean) {
        if (this._state !== MuSocketState.OPEN) {
            return;
        }

        const unreliable = !!unreliable_;
        this._socket.send({
            message,
            unreliable,
        });
    }

    /**
     * 仅关闭IPC通道的连接，这里没有处理子进程的关闭
     * @returns
     */
    public close() {
        debug('close child-process socket client');
        if (this._state !== MuSocketState.OPEN) {
            this._state = MuSocketState.CLOSED;
            return;
        }

        this.removeChildProcessListeners();
        this._state = MuSocketState.CLOSED;
        this._closeCallbackPerClient();
        this._closeCallbackPerOpen();
    }

    public reliableBufferedAmount() {
        return 0;
    }

    public unreliableBufferedAmount() {
        return 0;
    }
}

/**
 * 在 ChildProcess 中的 Server端
 */
export class MuChildProcessSocketServer implements MuSocketServer {
    protected _state = MuSocketServerState.INIT;
    public state() {
        return this._state;
    }

    private _pendingSockets: MuChildProcessSocketClient[] = [];
    public clients: MuChildProcessSocketClient[] = [];

    private _onconnection: MuConnectionHandler = noop;
    private _onclose: MuCloseHandler = noop;

    constructor() {
        // 向 ChildProcess注册监听，用来创建和销毁 MuChildProcessSocketClient
        process.on('message', (data: ProcessInternalMessage) => {
            if (data.type === 'connect') {
                const client = new MuChildProcessSocketClient({
                    sessionId: data.payload.sessionId,
                    socket: process as unknown as ChildProcess, // 因为必须在 ChildProcess 中使用，所以直接断言类型，不浪费额外的代码判断了
                    onClientClose: () => {
                        this.clients.splice(this.clients.indexOf(client), 1);
                    },
                });
                this.clients.push(client);

                this._handleConnection(client);
            } else if (data.type === 'close') {
                this.clients.forEach((c) => c.close());
            }
        });
    }

    private _handleConnection(socket: MuChildProcessSocketClient) {
        switch (this._state) {
            case MuSocketServerState.RUNNING:
                debug('connection');
                this._onconnection(socket);
                break;
            case MuSocketServerState.SHUTDOWN:
                socket.close();
                break;
            default:
                this._pendingSockets.push(socket);
        }
    }

    public start(spec: MuSocketServerSpec) {
        if (this._state === MuSocketServerState.RUNNING) {
            throw new Error('Child-process socket server already started');
        }
        if (this._state === MuSocketServerState.SHUTDOWN) {
            throw new Error(
                'Child-process socket server already started and shut down, cannot restart',
            );
        }

        // 目前一个Server仅对应一个Client，并且是立即连接
        this._state = MuSocketServerState.RUNNING;

        this._onconnection = spec.connection;
        this._onclose = spec.close;

        spec.ready();
        debug('socket server is ready');

        // connection 发生在 ready 之后
        while (this._pendingSockets.length > 0) {
            this._handleConnection(this._pendingSockets.pop()!);
        }
    }

    public close() {
        if (this._state !== MuSocketServerState.RUNNING) {
            this._state = MuSocketServerState.SHUTDOWN;
            return;
        }

        this._state = MuSocketServerState.SHUTDOWN;

        // 关闭所有 clients
        debug(`close all ${this.clients.length} clients`);
        for (let i = 0; i < this.clients.length; ++i) {
            this.clients[i].close();
        }

        debug('socket server close');
        this._onclose();
    }
}
