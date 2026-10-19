import type { ChildProcess } from 'child_process';
import defineDebug from 'debug';
import { MuData, MuSocket, MuSocketSpec, MuSocketState } from '../socket';
import type { ProcessInternalMessage } from './message';

const debug = defineDebug('mudb:socket:child-process:client');

/**
 * 运行在主进程中用于控制子进程的对象，等效于 MuSocket
 * 目前仅可用于 Script Server 场景，如用于其他场景，可能需要调整 open 时触发 ready 的机制
 */
export class MuChildProcessSocket implements MuSocket {
    private _state = MuSocketState.INIT;

    public state() {
        return this._state;
    }
    private _spec: MuSocketSpec;

    constructor(
        public readonly sessionId: string,
        private _childProcess: ChildProcess,
    ) {}

    /**
     * MuClient start 时会调用此方法
     * @param spec
     */
    public open(spec: MuSocketSpec) {
        debug(`open start with state: ${this._state}`);
        if (this._state === MuSocketState.OPEN) {
            throw new Error('client-side child-process socket already opened');
        }
        if (this._state === MuSocketState.CLOSED) {
            throw new Error(
                'client-side child-process socket already closed, cannot reopen',
            );
        }
        this._spec = spec;
        this.addProcessListeners();
        this._state = MuSocketState.OPEN;
        // 通知 ChildProcessServer 建立 Socket
        this.sendInternal({
            type: 'connect',
            payload: {
                sessionId: this.sessionId,
            },
        });
        // 理论上需要握手后再 ready，但这里由于 SocketServer 对 ChildProcess 的监听注册发生在其 constructor 时，而 SocketServer 在 ChildProcess 初始化时就构建了。
        // 所以 SocketServer 对 ChildProcess 的监听必然先于 Launch 时才发生的 SocketClient 的 open，所以对 SocketClient 来说，不需要握手也能确保接收到消息。
        // TODO 在其他场景下使用时，这里是可能需要添加握手过程的
        spec.ready();
        debug('child-process socket is ready');
    }

    public send(message: MuData, unreliable: boolean = false) {
        if (this._state !== MuSocketState.OPEN) {
            return;
        }

        this._childProcess.send({
            message,
            unreliable,
        });
    }

    /**
     * 关闭时仅执行对应的回调，不会关闭通信通道。
     */
    public close() {
        debug('closing child-process socket');
        if (this._state !== MuSocketState.OPEN) {
            this._state = MuSocketState.CLOSED;
            return;
        }

        this.removeProcessListeners();
        this._state = MuSocketState.CLOSED;

        this.sendInternal({ type: 'close' });
        this._spec?.close();
    }

    public reliableBufferedAmount() {
        return 0;
    }

    public unreliableBufferedAmount() {
        return 0;
    }

    private addProcessListeners() {
        this._childProcess.on('message', this._onMessage);
        this._childProcess.on('close', this._onChildProcessClose);
    }

    private removeProcessListeners() {
        this._childProcess.removeListener('message', this._onMessage);
        this._childProcess.removeListener('close', this._onChildProcessClose);
    }

    private _onMessage = (data: { message: MuData; unreliable: boolean }) => {
        this._spec.message(data.message, data.unreliable);
    };

    private _onChildProcessClose = (code: number, signal: string) => {
        debug(
            `close child process socket since child process closed with code ${code} and signal ${signal}`,
        );
        this._state = MuSocketState.CLOSED;
        this._spec?.close(signal);
    };

    private sendInternal(message: ProcessInternalMessage) {
        this._childProcess.send(message);
    }
}
