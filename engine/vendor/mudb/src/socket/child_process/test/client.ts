import { fork } from 'child_process';
import { join } from 'path';
import * as test from 'tape';

import { MuChildProcessSocket } from '../client';
import { MuSocketState } from '../../socket';

function noop() {}

function createChildProcess() {
    return fork(join(__dirname, './child_process.ts'), undefined, {
        execArgv: ['-r', 'ts-node/register'],
        stdio: 'inherit' as any,
    });
}

function sessionId() {
    return Math.random().toString(36).substring(0, 2);
}

test('socket initial state', (t) => {
    const socket = new MuChildProcessSocket(sessionId(), createChildProcess());
    t.equal(socket.state(), MuSocketState.INIT, 'should be MuSocketState.INIT');
    t.end();
});

test('socket.open() - when INIT', (t) => {
    t.plan(2);

    const socket = new MuChildProcessSocket(sessionId(), createChildProcess());
    socket.open({
        ready: () => {
            t.ok(true, 'should invoke ready handler');
            t.equal(
                socket.state(),
                MuSocketState.OPEN,
                'should change state to MuSocketState.OPEN',
            );
        },
        message: noop,
        close: noop,
    });
});

test('socket.open() - when OPEN', (t) => {
    t.plan(1);

    const socket = new MuChildProcessSocket(sessionId(), createChildProcess());
    socket.open({
        ready: () =>
            t.throws(
                // open socket when already open
                () =>
                    socket.open({
                        ready: noop,
                        message: noop,
                        close: noop,
                    }),
            ),
        message: noop,
        close: noop,
    });
});

test('socket.open() - when CLOSED', (t) => {
    t.plan(1);

    const socket = new MuChildProcessSocket(sessionId(), createChildProcess());
    socket.open({
        // close socket when open
        ready: () => socket.close(),
        message: noop,
        close: () =>
            t.throws(
                // open socket when already closed
                () =>
                    socket.open({
                        ready: noop,
                        message: noop,
                        close: noop,
                    }),
            ),
    });
});

test('socket.close() - when OPEN', (t) => {
    t.plan(2);

    const socket = new MuChildProcessSocket(sessionId(), createChildProcess());
    socket.open({
        // close socket when open
        ready: () => socket.close(),
        message: noop,
        close: (error) => {
            t.equal(
                error,
                undefined,
                'should invoke close handler without error message',
            );
            t.equal(
                socket.state(),
                MuSocketState.CLOSED,
                'should change state to MuSocketState.CLOSED',
            );
        },
    });
});

test('socket.close() - when INIT', (t) => {
    const socket = new MuChildProcessSocket(sessionId(), createChildProcess());
    // close socket when init
    socket.close();
    t.equal(
        socket.state(),
        MuSocketState.CLOSED,
        'should change state to MuSocketState.CLOSED',
    );
    t.end();
});

test('socket.close() - when CLOSED', (t) => {
    const socket = new MuChildProcessSocket(sessionId(), createChildProcess());
    socket.open({
        // close socket when open
        ready: () => socket.close(),
        message: noop,
        close: () => {
            // close socket when already closed
            socket.close();

            t.ok(true, 'should not invoke close handler');
            t.end();
        },
    });
});
