import { MuSchema } from '@box/mudb/schema';
import {
  Vec3Schema,
  Vec4Schema,
  Vec2Schema,
  Mat4Schema,
  Mat3Schema,
  Mat2Schema,
  QuatSchema,
} from './math-schema';
import { MuServer } from '@box/mudb/server';
import { MuClient } from '@box/mudb/client';

export class SchemaTraceEntry {
  public name: string;
  public schema: MuSchema<any>;

  public liveCount = 0;
  public allocCount = 0;
  public freeCount = 0;
  public poolSize = 0;

  constructor(petName: string, schema: MuSchema<any>) {
    this.name = petName;
    this.schema = schema;
  }
}

function pushSchema(
  schemaList: SchemaTraceEntry[],
  name: string,
  schema: MuSchema<any>,
) {
  schemaList.push(new SchemaTraceEntry(name, schema));
}

function traceSchemaRec(
  petName: string,
  schema: MuSchema<any>,
  schemaList: SchemaTraceEntry[],
  visited: WeakMap<MuSchema<any>, boolean>,
) {
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

export function trapDoubleFree(schemas: SchemaTraceEntry[]) {
  for (let i = 0; i < schemas.length; ++i) {
    const record = schemas[i];
    const allocTrace = new WeakMap<any, Error>();
    const freeRecords = new WeakMap<any, Error>();
    record.schema.free = ((_free: any, schema: any, name: any) => {
      return function (x) {
        if (x && typeof x === 'object') {
          if (freeRecords.has(x)) {
            console.error('previous free: ', freeRecords.get(x)?.stack);
            console.error('previous alloc: ', allocTrace.get(x)?.stack);
            throw new Error(`double free for schema ${name}`);
          }
          freeRecords.set(x, new Error());
        }
        return _free.call(schema, x);
      };
    })(record.schema.free, record.schema, record.name);
    record.schema.alloc = ((_alloc: any, schema: any, name: any) => {
      return function () {
        const x = _alloc.call(schema);
        if (x && typeof x === 'object') {
          allocTrace.set(x, new Error());
          freeRecords.delete(x);
        }
        return x;
      };
    })(record.schema.alloc, record.schema, record.name);
    record.schema.patch = ((_patch: any, schema: any, name: any) => {
      return function (base, out) {
        const x = _patch.call(schema, base, out);
        if (x && typeof x === 'object') {
          allocTrace.set(x, new Error());
          freeRecords.delete(x);
        }
        return x;
      };
    })(record.schema.patch, record.schema, record.name);
    record.schema.clone = ((_clone: any, schema: any, name: any) => {
      return function (y) {
        const x = _clone.call(schema, y);
        if (x && typeof x === 'object') {
          allocTrace.set(x, new Error());
          freeRecords.delete(x);
        }
        return x;
      };
    })(record.schema.clone, record.schema, record.name);
    record.schema.fromJSON = ((_fromJSON: any, schema: any, name: any) => {
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

function initVisitMask(schemaList: SchemaTraceEntry[]) {
  const visited = new WeakMap<MuSchema<any>, boolean>();
  schemaList.forEach((entry) => {
    visited.set(entry.schema, true);
  });
  return visited;
}

export function traceMathSchemas(schemaList: SchemaTraceEntry[]) {
  const visited = initVisitMask(schemaList);
  traceSchemaRec('vec2', Vec2Schema, schemaList, visited);
  traceSchemaRec('vec3', Vec3Schema, schemaList, visited);
  traceSchemaRec('vec4', Vec4Schema, schemaList, visited);
  traceSchemaRec('mat2', Mat2Schema, schemaList, visited);
  traceSchemaRec('mat3', Mat3Schema, schemaList, visited);
  traceSchemaRec('mat4', Mat4Schema, schemaList, visited);
  traceSchemaRec('quat', QuatSchema, schemaList, visited);
}

export function trapAllocCounters(schemas: SchemaTraceEntry[]) {
  const pollHandlers: (() => void)[] = [];
  for (let i = 0; i < schemas.length; ++i) {
    const entry = schemas[i];
    if (typeof (<any>entry.schema).stats === 'function') {
      pollHandlers.push(
        ((_entry: SchemaTraceEntry) => () => {
          const info = (<any>_entry.schema).stats();
          _entry.allocCount = info.allocCount;
          _entry.freeCount = info.freeCount;
          _entry.liveCount = info.allocCount - info.freeCount;
          _entry.poolSize = info.poolSize;
        })(entry),
      );
    } else {
      ((_entry: SchemaTraceEntry) => {
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

export function traceProtocols(
  schemaList: SchemaTraceEntry[],
  host: MuServer | MuClient,
) {
  const visited = initVisitMask(schemaList);
  const protocols = host.protocols;
  for (let i = 0; i < protocols.length; ++i) {
    const p = protocols[i].schema;
    Object.keys(p.client).forEach((clientMessage) => {
      traceSchemaRec(
        `${p.name}.client.${clientMessage}`,
        p.client[clientMessage],
        schemaList,
        visited,
      );
    });
    Object.keys(p.server).forEach((serverMessage) => {
      traceSchemaRec(
        `${p.name}.server.${serverMessage}`,
        p.server[serverMessage],
        schemaList,
        visited,
      );
    });
  }
}

export function traceSchema(
  petName: string,
  schema: MuSchema<any>,
  schemaList: SchemaTraceEntry[] = [],
) {
  const visited = initVisitMask(schemaList);
  return traceSchemaRec(petName, schema, schemaList, visited);
}
