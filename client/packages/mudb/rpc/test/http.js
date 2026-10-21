"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const tape = require("tape");
const server_1 = require("../http/server");
const schema_1 = require("../../schema");
const server_2 = require("../server");
const port_1 = require("../../util/port");
const client_1 = require("../client");
const client_2 = require("../http/client");
tape('http server', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const protocol = {
        name: 'test',
        api: {
            login: {
                arg: new schema_1.MuUTF8(),
                ret: new schema_1.MuVoid(),
            },
            logout: {
                arg: new schema_1.MuVoid(),
                ret: new schema_1.MuVoid(),
            },
            hello: {
                arg: new schema_1.MuVoid(),
                ret: new schema_1.MuUTF8(),
            },
            add: {
                arg: new schema_1.MuStruct({
                    a: new schema_1.MuFloat64(),
                    b: new schema_1.MuFloat64(),
                }),
                ret: new schema_1.MuFloat64(),
            },
        },
    };
    const transport = new server_1.MuRPCHttpServerTransport({
        route: 'api',
        byteLimit: 1 << 20,
        cookie: 'auth',
    });
    const httpServer = http.createServer((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!transport.handler(req, res)) {
            t.fail('unhandled route');
            res.statusCode = 404;
            res.end();
        }
    }));
    const port = yield (0, port_1.findPortAsync)();
    httpServer.listen(port);
    const server = new server_2.MuRPCServer({
        protocol,
        transport,
        authorize: (connection) => __awaiter(void 0, void 0, void 0, function* () {
            if (connection.auth === 'bad') {
                return false;
            }
            return true;
        }),
        handlers: {
            login: (conn, handle) => __awaiter(void 0, void 0, void 0, function* () {
                conn.setAuth(handle);
            }),
            logout: (conn) => __awaiter(void 0, void 0, void 0, function* () {
                conn.setAuth('');
            }),
            hello: (conn) => __awaiter(void 0, void 0, void 0, function* () {
                if (conn.auth) {
                    return `hello ${conn.auth}`;
                }
                return `hello guest`;
            }),
            add: (conn_1, _a) => __awaiter(void 0, [conn_1, _a], void 0, function* (conn, { a, b }) {
                return a + b;
            }),
        },
    });
    const client = new client_1.MuRPCClient(protocol, new client_2.MuRPCHttpClientTransport({
        url: `http://127.0.0.1:${port}/api`,
        timeout: Infinity,
    }));
    t.equals(yield client.api.hello(), `hello guest`);
    yield client.api.login('user');
    t.equals(yield client.api.hello(), `hello user`);
    httpServer.close();
    t.end();
}));
//# sourceMappingURL=http.js.map