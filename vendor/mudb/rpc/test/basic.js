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
const tape = require("tape");
const local_1 = require("../local");
const schema_1 = require("../../schema");
const server_1 = require("../server");
const client_1 = require("../client");
tape('basic rpc', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const protocol = {
        name: 'test rpc',
        api: {
            hello: {
                arg: new schema_1.MuUTF8(),
                ret: new schema_1.MuUTF8(),
            },
            fib: {
                arg: new schema_1.MuStruct({
                    a: new schema_1.MuVarint(),
                    b: new schema_1.MuVarint(),
                }),
                ret: new schema_1.MuStruct({
                    a: new schema_1.MuVarint(),
                    b: new schema_1.MuVarint(),
                }),
            },
            brokenRoute: {
                arg: new schema_1.MuVoid(),
                ret: new schema_1.MuVoid(),
            },
            logout: {
                arg: new schema_1.MuVoid(),
                ret: new schema_1.MuVoid(),
            },
        },
    };
    const transport = new local_1.MuRPCLocalTransport();
    const server = new server_1.MuRPCServer({
        protocol,
        transport,
        authorize: (_a) => __awaiter(void 0, [_a], void 0, function* ({ auth }) { return auth !== 'bad guy'; }),
        handlers: {
            hello: (_a, arg_1) => __awaiter(void 0, [_a, arg_1], void 0, function* ({ auth }, arg) {
                if (auth === 'admin') {
                    return 'administrator';
                }
                return 'hello ' + arg;
            }),
            fib: (conn_1, _a, ret_1) => __awaiter(void 0, [conn_1, _a, ret_1], void 0, function* (conn, { a, b }, ret) {
                ret.a = a + b;
                ret.b = a;
                return ret;
            }),
            brokenRoute: () => __awaiter(void 0, void 0, void 0, function* () {
                throw new Error('not implemented');
            }),
            logout: (conn) => __awaiter(void 0, void 0, void 0, function* () {
                conn.setAuth('');
            }),
        },
    });
    const client = new client_1.MuRPCClient(protocol, transport.client('user'));
    t.equals(yield client.api.hello('world'), 'hello world', 'hello world');
    t.same(yield client.api.fib({ a: 2, b: 1 }), { a: 3, b: 2 }, 'fibonacci');
    try {
        yield client.api.brokenRoute();
        t.fail('should throw');
    }
    catch (e) {
        t.pass(`throws ${e}`);
    }
    const badClient = new client_1.MuRPCClient(protocol, transport.client('bad guy'));
    try {
        yield badClient.api.hello('i am a jerk');
        t.fail('should throw');
    }
    catch (e) {
        t.pass('bad api throws when called');
    }
    const adminClient = new client_1.MuRPCClient(protocol, transport.client('admin'));
    t.equals(yield adminClient.api.hello('guest'), 'administrator', 'admin auth ok');
    yield adminClient.api.logout();
    t.equals(yield adminClient.api.hello('guest'), 'hello guest', 'log out ok');
    t.end();
}));
//# sourceMappingURL=basic.js.map