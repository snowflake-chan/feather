"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test = require("tape");
const index_1 = require("../index");
const server_1 = require("../../../server");
const client_1 = require("../../../client");
const socket_1 = require("../../socket");
function randomId() {
    return Math.random().toString(36).substring(2);
}
test('client socket will always be open first', (t) => {
    t.test('when server starts first', (st) => {
        st.plan(3);
        const socketServer = (0, index_1.createLocalSocketServer)();
        const clientSocket = (0, index_1.createLocalSocket)({
            sessionId: randomId(),
            server: socketServer,
        });
        const serverSocket = clientSocket._duplex;
        const server = new server_1.MuServer(socketServer);
        const client = new client_1.MuClient(clientSocket);
        server.start({
            ready: () => client.start({
                ready: () => {
                    st.equal(clientSocket.state(), socket_1.MuSocketState.OPEN);
                    st.equal(serverSocket.state(), socket_1.MuSocketState.INIT);
                    setTimeout(() => st.equal(serverSocket.state(), socket_1.MuSocketState.OPEN), 0);
                },
            }),
        });
    });
    t.test('when client starts first', (st) => {
        st.plan(3);
        const socketServer = (0, index_1.createLocalSocketServer)();
        const clientSocket = (0, index_1.createLocalSocket)({
            sessionId: randomId(),
            server: socketServer,
        });
        const serverSocket = clientSocket._duplex;
        const server = new server_1.MuServer(socketServer);
        const client = new client_1.MuClient(clientSocket);
        client.start({
            ready: () => server.start({
                ready: () => {
                    st.equal(clientSocket.state(), socket_1.MuSocketState.OPEN);
                    st.equal(serverSocket.state(), socket_1.MuSocketState.INIT);
                    setTimeout(() => st.equal(serverSocket.state(), socket_1.MuSocketState.OPEN), 0);
                },
            }),
        });
    });
    t.end();
});
//# sourceMappingURL=connection.js.map