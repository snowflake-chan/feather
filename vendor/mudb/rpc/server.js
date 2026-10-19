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
exports.MuRPCServer = void 0;
const protocol_1 = require("./protocol");
class MuRPCServer {
    constructor(spec) {
        const logger = spec.logger;
        const schemas = this.schemas = new protocol_1.MuRPCSchemas(spec.protocol);
        this.transport = spec.transport;
        this.transport.listen(schemas, spec.authorize, (conn, arg, response) => __awaiter(this, void 0, void 0, function* () {
            try {
                const method = arg.type;
                const handler = spec.handlers[method];
                if (!handler) {
                    logger && logger.error(`invalid rpc method: ${method}`);
                    response.type = 'error';
                    response.data = `invalid rpc method: ${method}`;
                }
                else {
                    const retSchema = schemas.protocol.api[method].ret;
                    if (handler.length === 3) {
                        const ret = retSchema.alloc();
                        const actualRet = yield handler(conn, arg.data, ret);
                        response.type = 'success';
                        const retInfo = response.data = schemas.retSchema.alloc();
                        retInfo.type = method;
                        if (ret === actualRet) {
                            retInfo.data = ret;
                        }
                        else {
                            logger && logger.log(`warning, handler for ${method} did not use storage for return type`);
                            retSchema.free(ret);
                            retInfo.data = actualRet;
                        }
                    }
                    else {
                        const ret = yield handler(conn, arg.data, undefined);
                        response.type = 'success';
                        const retInfo = response.data = schemas.retSchema.alloc();
                        retInfo.type = method;
                        retInfo.data = retSchema.clone(ret);
                    }
                }
            }
            catch (e) {
                logger && logger.error(e);
                response.type = 'error';
                if (e instanceof Error && e.message) {
                    response.data = e.message;
                }
                else {
                    response.data = e;
                }
            }
        }));
    }
}
exports.MuRPCServer = MuRPCServer;
//# sourceMappingURL=server.js.map