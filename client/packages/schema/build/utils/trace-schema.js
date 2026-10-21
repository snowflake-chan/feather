"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaTraceEntry = void 0;
exports.trapDoubleFree = trapDoubleFree;
exports.traceMathSchemas = traceMathSchemas;
exports.trapAllocCounters = trapAllocCounters;
exports.traceProtocols = traceProtocols;
exports.traceSchema = traceSchema;
const math_schema_1 = require("./math-schema");
class SchemaTraceEntry {
    constructor(petName, schema) {
        this.liveCount = 0;
        this.allocCount = 0;
        this.freeCount = 0;
        this.poolSize = 0;
        this.name = petName;
        this.schema = schema;
    }
}
exports.SchemaTraceEntry = SchemaTraceEntry;
function pushSchema(schemaList, name, schema) {
    schemaList.push(new SchemaTraceEntry(name, schema));
}
function traceSchemaRec(petName, schema, schemaList, visited) {
    const type = schema.muType;
    if (visited.has(schema)) {
        return;
    }
    visited.set(schema, true);
    switch (type) {
        case 'struct':
        case 'union':
            pushSchema(schemaList, petName, schema);
            Object.keys(schema.muData).forEach((prop) => {
                traceSchemaRec(prop, schema.muData[prop], schemaList, visited);
            });
            return;
        case 'option':
        case 'dictionary':
            pushSchema(schemaList, petName + '{}', schema);
            traceSchemaRec(petName, schema.muData, schemaList, visited);
            return;
        case 'sorted-array':
        case 'array':
            pushSchema(schemaList, petName + '[]', schema);
            traceSchemaRec(petName, schema.muData, schemaList, visited);
            return;
        case 'vector':
        case 'bytes':
            pushSchema(schemaList, petName, schema);
            return;
        case 'array-union':
            pushSchema(schemaList, petName, schema);
            schema.muData.forEach((subtype, i) => {
                traceSchemaRec(petName + '[' + i + ']', subtype, schemaList, visited);
            });
            return;
    }
}
function trapDoubleFree(schemas) {
    for (let i = 0; i < schemas.length; ++i) {
        const record = schemas[i];
        const allocTrace = new WeakMap();
        const freeRecords = new WeakMap();
        record.schema.free = ((_free, schema, name) => {
            return function (x) {
                var _a, _b;
                if (x && typeof x === 'object') {
                    if (freeRecords.has(x)) {
                        console.error('previous free: ', (_a = freeRecords.get(x)) === null || _a === void 0 ? void 0 : _a.stack);
                        console.error('previous alloc: ', (_b = allocTrace.get(x)) === null || _b === void 0 ? void 0 : _b.stack);
                        throw new Error(`double free for schema ${name}`);
                    }
                    freeRecords.set(x, new Error());
                }
                return _free.call(schema, x);
            };
        })(record.schema.free, record.schema, record.name);
        record.schema.alloc = ((_alloc, schema, name) => {
            return function () {
                const x = _alloc.call(schema);
                if (x && typeof x === 'object') {
                    allocTrace.set(x, new Error());
                    freeRecords.delete(x);
                }
                return x;
            };
        })(record.schema.alloc, record.schema, record.name);
        record.schema.patch = ((_patch, schema, name) => {
            return function (base, out) {
                const x = _patch.call(schema, base, out);
                if (x && typeof x === 'object') {
                    allocTrace.set(x, new Error());
                    freeRecords.delete(x);
                }
                return x;
            };
        })(record.schema.patch, record.schema, record.name);
        record.schema.clone = ((_clone, schema, name) => {
            return function (y) {
                const x = _clone.call(schema, y);
                if (x && typeof x === 'object') {
                    allocTrace.set(x, new Error());
                    freeRecords.delete(x);
                }
                return x;
            };
        })(record.schema.clone, record.schema, record.name);
        record.schema.fromJSON = ((_fromJSON, schema, name) => {
            return function (y) {
                const x = _fromJSON.call(schema, y);
                if (x && typeof x === 'object') {
                    allocTrace.set(x, new Error());
                    freeRecords.delete(x);
                }
                return x;
            };
        })(record.schema.fromJSON, record.schema, record.name);
    }
}
function initVisitMask(schemaList) {
    const visited = new WeakMap();
    schemaList.forEach((entry) => {
        visited.set(entry.schema, true);
    });
    return visited;
}
function traceMathSchemas(schemaList) {
    const visited = initVisitMask(schemaList);
    traceSchemaRec('vec2', math_schema_1.Vec2Schema, schemaList, visited);
    traceSchemaRec('vec3', math_schema_1.Vec3Schema, schemaList, visited);
    traceSchemaRec('vec4', math_schema_1.Vec4Schema, schemaList, visited);
    traceSchemaRec('mat2', math_schema_1.Mat2Schema, schemaList, visited);
    traceSchemaRec('mat3', math_schema_1.Mat3Schema, schemaList, visited);
    traceSchemaRec('mat4', math_schema_1.Mat4Schema, schemaList, visited);
    traceSchemaRec('quat', math_schema_1.QuatSchema, schemaList, visited);
}
function trapAllocCounters(schemas) {
    const pollHandlers = [];
    for (let i = 0; i < schemas.length; ++i) {
        const entry = schemas[i];
        if (typeof entry.schema.stats === 'function') {
            pollHandlers.push(((_entry) => () => {
                const info = _entry.schema.stats();
                _entry.allocCount = info.allocCount;
                _entry.freeCount = info.freeCount;
                _entry.liveCount = info.allocCount - info.freeCount;
                _entry.poolSize = info.poolSize;
            })(entry));
        }
        else {
            ((_entry) => {
                const _alloc = _entry.schema.alloc;
                _entry.schema.alloc = () => {
                    ++_entry.allocCount;
                    _entry.liveCount = _entry.allocCount - _entry.freeCount;
                    const r = _alloc.call(_entry.schema);
                    _entry.poolSize = 0;
                    return r;
                };
                const _free = _entry.schema.free;
                _entry.schema.free = (x) => {
                    ++_entry.freeCount;
                    _entry.liveCount = _entry.allocCount - _entry.freeCount;
                    _free.call(_entry.schema, x);
                    _entry.poolSize = 0;
                };
            })(entry);
        }
    }
    function pollTraces() {
        for (let i = 0; i < pollHandlers.length; ++i) {
            pollHandlers[i]();
        }
        return schemas;
    }
    return pollTraces;
}
function traceProtocols(schemaList, host) {
    const visited = initVisitMask(schemaList);
    const protocols = host.protocols;
    for (let i = 0; i < protocols.length; ++i) {
        const p = protocols[i].schema;
        Object.keys(p.client).forEach((clientMessage) => {
            traceSchemaRec(`${p.name}.client.${clientMessage}`, p.client[clientMessage], schemaList, visited);
        });
        Object.keys(p.server).forEach((serverMessage) => {
            traceSchemaRec(`${p.name}.server.${serverMessage}`, p.server[serverMessage], schemaList, visited);
        });
    }
}
function traceSchema(petName, schema, schemaList = []) {
    const visited = initVisitMask(schemaList);
    return traceSchemaRec(petName, schema, schemaList, visited);
}
//# sourceMappingURL=trace-schema.js.map