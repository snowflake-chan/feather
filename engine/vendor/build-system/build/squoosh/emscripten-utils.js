"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.instantiateEmscriptenWasm = instantiateEmscriptenWasm;
const semaphore_1 = require("@box/utils/semaphore");
const path = __importStar(require("path"));
function instantiateEmscriptenWasm(factory, hash) {
    const mutex = new semaphore_1.Semaphore(1);
    let instance = null;
    return (content) => __awaiter(this, void 0, void 0, function* () {
        if (instance) {
            return instance;
        }
        yield mutex.p();
        try {
            if (!instance) {
                const bytes = yield content.retrieve(hash);
                if (!bytes) {
                    throw new Error('Error retrieving hash: ' + hash);
                }
                const mockRequire = (mod) => {
                    if (mod === 'path') {
                        return path;
                    }
                    else if (mod === 'fs') {
                        return {
                            readFileSync: () => Buffer.from(bytes),
                        };
                    }
                    else if (mod === 'crypto') {
                        return {
                            getRandomValues: (x) => {
                                for (let i = 0; i < x.length; ++i) {
                                    x[i] = Math.random() * (1 << 32);
                                }
                            },
                            randomBytes: (n) => {
                                const r = new Uint8Array(n);
                                for (let i = 0; i < n; ++i) {
                                    r[i] = Math.random() * 255;
                                }
                                return r;
                            },
                        };
                    }
                    else {
                        return {};
                    }
                };
                instance = yield factory(mockRequire)({
                    locateFile: () => 'XXXX',
                });
            }
            return instance;
        }
        finally {
            mutex.v();
        }
    });
}
//# sourceMappingURL=emscripten-utils.js.map