// Some helper tools for creating declarative databinding
// Currently used in the script system to synchronize script objects with the engine across a socket.
//
import { MuSchema } from '@box/mudb/schema';
import { MuReadStream, MuWriteStream } from '@box/mudb/stream';
import { ScriptResourceSync } from './resource';
import { CodeGenContext, CodeGenFunc, CodeGenBlock } from '../codegen';

export interface Binding<
  ScriptObject,
  EngineObject,
  PropSchema extends MuSchema<any>,
> {
  // name (for sanity)
  name: string;

  // schema for property
  schema: PropSchema;

  // user defined methods
  preTick?: (
    script: ScriptObject,
    engine: EngineObject,
    resource: ScriptResourceSync,
  ) => void;
  checkPostTick?: (
    script: ScriptObject,
    engine: EngineObject,
    resources: ScriptResourceSync,
  ) => boolean;
  deltaPostTick?: (
    script: ScriptObject,
    engine: EngineObject,
    resources: ScriptResourceSync,
  ) => PropSchema['identity'];
  synchronize?: (engine: EngineObject, patch: PropSchema['identity']) => void;

  // codegen methods
  emitPreTick?: (
    block: CodeGenBlock,
    scriptTok: string,
    engineTok: string,
    resourceTok: string,
  ) => void;
  emitPostTick?: (
    checkBlock: CodeGenBlock,
    deltaBlock: CodeGenBlock,
    scriptTok: string,
    engineTok: string,
    resourceTok: string,
    checkTok: string,
    patchTok: string,
  ) => void;
  emitSynchronize?: (
    block: CodeGenBlock,
    engineTok: string,
    patchTok: string,
  ) => void;
}

export class ScriptSyncPatch {
  public id = 0;
  public ids: number[] = [];
  public data: any[] = [];
}

export const ScriptSyncPool: ScriptSyncPatch[] = [];
function allocScriptSyncPatch() {
  return ScriptSyncPool.pop() || new ScriptSyncPatch();
}

// pretick copies the properties from the engine object into the script object
function generatePreTick<ScriptObject, EngineObject>(
  name: string,
  bindings: Binding<ScriptObject, EngineObject, MuSchema<any>>[],
  block: CodeGenBlock,
  scriptTok: string,
  engineTok: string,
  resourceTok: string,
) {
  bindings.forEach((b) => {
    if (b.emitPreTick) {
      block.push(`
            // emit pretick ${b.name}
            `);
      b.emitPreTick(block, scriptTok, engineTok, resourceTok);
    } else if (b.preTick) {
      block.push(`
            // call pretick ${b.name}
            `);
      const f = block.inject(b.preTick);
      if (b.preTick.length >= 3) {
        block.push(`${f}(${scriptTok},${engineTok},${resourceTok});`);
      } else {
        block.push(`${f}(${scriptTok},${engineTok});`);
      }
    }
  });
}

// post tick compares the script object to the engine object, if a property has changed add the changed property to the patch object
// there are two parts to post tick:
//  1.  check phase: which compares the script property and engine property and emits a "checkVar" which is a boolean flag to determine if the properties are different
//  2.  delta phase: which loops over all the propeties which have a check flag that changed and appends the changed properties to the patch
function generatePostTick<ScriptObject, EngineObject>(
  name: string,
  bindings: Binding<ScriptObject, EngineObject, MuSchema<any>>[],
  func: CodeGenFunc,
  scriptTok: string,
  engineTok: string,
  resourceTok: string,
) {
  const check = func.block();
  const postTicks: {
    id: number;
    checkVar: string;
    patchVar: string;
    preBlock: CodeGenBlock;
    postBlock: CodeGenBlock;
  }[] = [];
  bindings.forEach((b, id) => {
    if (b.emitPostTick) {
      const checkVar = func.def();
      const patchVar = func.def();
      const preBlock = func.block();
      const postBlock = func.block();
      check.push(`
            // emit check ${b.name}
            `);
      preBlock.push(`
            // emit delta ${b.name}
            `);
      b.emitPostTick(
        check,
        postBlock,
        scriptTok,
        engineTok,
        resourceTok,
        checkVar,
        patchVar,
      );
      postTicks.push({
        id,
        checkVar,
        patchVar,
        preBlock,
        postBlock,
      });
    } else if (b.checkPostTick && b.deltaPostTick) {
      const checkVar = func.def();
      const patchVar = func.def();
      const preBlock = func.block();
      const postBlock = func.block();
      check.push(`
            // call check ${b.name}
            `);
      preBlock.push(`
            // call delta ${b.name}
            `);
      // push check block
      const checkFunc = check.inject(b.checkPostTick);
      if (b.checkPostTick.length >= 3) {
        check.push(
          `${checkVar}=!!${checkFunc}(${scriptTok},${engineTok},${resourceTok});`,
        );
      } else {
        check.push(`${checkVar}=!!${checkFunc}(${scriptTok},${engineTok});`);
      }

      // push post block
      const postFunc = postBlock.inject(b.deltaPostTick);
      if (b.deltaPostTick.length >= 3) {
        postBlock.push(
          `${patchVar}=${postFunc}(${scriptTok},${engineTok},${resourceTok});`,
        );
      } else {
        postBlock.push(`${patchVar}=${postFunc}(${scriptTok},${engineTok});`);
      }
      postTicks.push({
        id,
        checkVar,
        patchVar,
        preBlock,
        postBlock,
      });
    }
  });

  // if the component doesn't have a post tick, then skip it
  if (postTicks.length === 0) {
    check.push(`
        // empty post tick
        return null;`);
    return;
  }

  // if no patch required, early out and return null
  const resultVar = check.def();
  const idsVar = check.def();
  const dataVar = check.def();
  check.push(`
    // early out if no delta detected
    if (!(${postTicks.map(({ checkVar }) => checkVar).join(' || ')})) {
        return null;
    }
    // compute patches
    ${resultVar} = ${check.inject(allocScriptSyncPatch)}();
    ${resultVar}.id = 0;
    ${idsVar} = ${resultVar}.ids;
    ${dataVar} = ${resultVar}.data;`);

  // generate wrapper for each post tick
  postTicks.forEach(({ id, preBlock, postBlock, patchVar, checkVar }) => {
    preBlock.push(`
            if(${checkVar}) {
                ${idsVar}.push(${id});`);
    postBlock.push(`
                ${dataVar}.push(${patchVar});
            }`);
  });

  // emit result block
  const retBlock = func.block();
  retBlock.push(`
        // done
        return ${resultVar};
    `);
}

// synchronizes reads in a patch from the script and applies it to the engine object
function generateSynchronize<ScriptObject, EngineObject>(
  name: string,
  bindings: Binding<ScriptObject, EngineObject, MuSchema<any>>[],
  block: CodeGenBlock,
  engineTok: string,
  patchTok: string,
) {
  if (bindings.every((b) => !b.emitSynchronize && !b.synchronize)) {
    return;
  }

  const idsTok = block.def();
  const dataTok = block.def();
  const loopTok = block.def();
  const deltaTok = block.def();
  block.push(`
    ${idsTok} = ${patchTok}.ids;
    ${dataTok} = ${patchTok}.data;
    for (${loopTok} = 0; ${loopTok} < ${idsTok}.length; ++${loopTok}) {
        ${deltaTok} = ${dataTok}[${loopTok}];
        switch(${idsTok}[${loopTok}]){`);
  bindings.forEach((b, i) => {
    if (b.emitSynchronize) {
      block.push(`
            case ${i}: // emit sync ${b.name}
                `);
      b.emitSynchronize(block, engineTok, deltaTok);
      block.push(`
                break;`);
    } else if (b.synchronize) {
      block.push(`
            case ${i}: // call sync ${b.name}
                ${block.inject(b.synchronize)}(${engineTok}, ${deltaTok});
                break;`);
    }
  });
  block.push(`
        }
    }`);
}

function generateSyncMethods<ScriptObject, EngineObject>(
  name: string,
  bindings: Binding<ScriptObject, EngineObject, MuSchema<any>>[],
): {
  preTick: (
    script: ScriptObject,
    engine: EngineObject,
    resource: ScriptResourceSync,
  ) => void;
  postTick: (
    script: ScriptObject,
    engine: EngineObject,
    resource: ScriptResourceSync,
  ) => ScriptSyncPatch | null;
  synchronize: (engine: EngineObject, patch: ScriptSyncPatch) => void;
} {
  const context = new CodeGenContext(name);

  const preTick = context.func('preTick');
  const preTickScriptObj = preTick.arg();
  const preTickEngineObj = preTick.arg();
  const preTickResourceObj = preTick.arg();
  const preTickBlock = preTick.block();

  const postTick = context.func('postTick');
  const postTickScriptObj = postTick.arg();
  const postTickEngineObj = postTick.arg();
  const postTickResourceObj = postTick.arg();

  const synchronize = context.func('synchronize');
  const synchronizeEngineObj = synchronize.arg();
  const synchronizePatch = synchronize.arg();
  const synchronizeBlock = synchronize.block();

  generatePreTick(
    name,
    bindings,
    preTickBlock,
    preTickScriptObj,
    preTickEngineObj,
    preTickResourceObj,
  );
  generatePostTick(
    name,
    bindings,
    postTick,
    postTickScriptObj,
    postTickEngineObj,
    postTickResourceObj,
  );
  generateSynchronize(
    name,
    bindings,
    synchronizeBlock,
    synchronizeEngineObj,
    synchronizePatch,
  );

  return context.compile();
}

export class ScriptSynchronizer<ScriptObject, Schema extends MuSchema<any>>
  implements MuSchema<ScriptSyncPatch>
{
  public muType = 'synchronizer';
  public identity: ScriptSyncPatch = { id: 0, ids: [], data: [] };
  public muData;
  public json;
  public pool: ScriptSyncPatch[] = [];

  public schemas: MuSchema<any>[];

  public preTick: (
    script: ScriptObject,
    engine: Schema['identity'],
    resource: ScriptResourceSync,
  ) => void;
  public postTick: (
    script: ScriptObject,
    engine: Schema['identity'],
    resource: ScriptResourceSync,
  ) => ScriptSyncPatch | null;
  public synchronize: (
    engine: Schema['identity'],
    patch: ScriptSyncPatch,
  ) => void;

  constructor(
    public name: string,
    public engineSchema: Schema,
    public bindings: Binding<ScriptObject, Schema['identity'], MuSchema<any>>[],
    public hasComponent:
      | null
      | ((obj: ScriptObject, resources: ScriptResourceSync) => boolean),
    public setComponent: null | ((obj: ScriptObject, s: boolean) => void),
  ) {
    const schemas = (this.schemas = bindings.map((b) => b.schema));
    this.muData = {
      type: 'synchronizer',
      data: schemas.map((s) => s.muData),
    };
    this.json = {
      type: 'synchronizer',
      data: schemas.map((s) => s.json),
    };

    const procs = generateSyncMethods(name, bindings);
    this.preTick = procs.preTick;
    this.postTick = procs.postTick;
    this.synchronize = procs.synchronize;
  }

  public alloc = allocScriptSyncPatch;
  public free(x: ScriptSyncPatch) {
    for (let i = 0; i < x.ids.length; ++i) {
      const id = x.ids[i];
      const data = x.data[i];
      this.schemas[id].free(data);
    }
    x.ids.length = 0;
    x.data.length = 0;
    ScriptSyncPool.push(x);
  }
  public clone(x: ScriptSyncPatch) {
    const result = allocScriptSyncPatch();
    result.id = x.id;
    for (let i = 0; i < x.ids.length; ++i) {
      const id = x.ids[i];
      const data = x.data[i];
      result.ids.push(id);
      result.data.push(this.schemas[id].clone(data));
    }
    return result;
  }

  public equal(x: ScriptSyncPatch, y: ScriptSyncPatch) {
    if (x.id !== y.id || x.ids.length !== y.ids.length) {
      return false;
    }
    for (let i = 0; i < x.ids[i]; ++i) {
      const id = x.ids[i];
      if (id !== y.ids[i] || !this.schemas[id].equal(x.data[i], y.data[i])) {
        return false;
      }
    }
    return true;
  }

  public assign(x: ScriptSyncPatch, y: ScriptSyncPatch): ScriptSyncPatch {
    x.id = y.id;
    for (let i = 0; i < x.ids.length; ++i) {
      const id = x.ids[i];
      const data = x.data[i];
      this.schemas[id].free(data);
    }
    x.ids.length = 0;
    x.data.length = 0;

    for (let i = 0; i < y.ids.length; ++i) {
      const id = y.ids[i];
      const data = y.data[i];
      x.ids.push(id);
      x.data.push(this.schemas[id].clone(data));
    }

    return x;
  }

  public toJSON(x: ScriptSyncPatch) {
    return {
      id: x.id,
      ids: x.ids.slice(),
      data: x.data.map((y, i) => this.schemas[x.ids[i]].toJSON(y)),
    };
  }

  public fromJSON(y: any) {
    const result = allocScriptSyncPatch();
    if (
      Array.isArray(y.ids) &&
      Array.isArray(y.data) &&
      y.ids.length === y.data.length
    ) {
      for (let i = 0; i < y.ids.length; ++i) {
        const id = y.ids[i];
        const data = y.data[i];
        if (
          typeof id === 'number' &&
          (i === 0 || y.ids[i - 1] < id) &&
          0 <= id &&
          id < this.schemas.length
        ) {
          result.ids.push(id);
          result.data.push(this.schemas[id].fromJSON(data));
        } else {
          break;
        }
      }
    }
    result.id = y.id | 0;
    return result;
  }

  public diff(_, target: ScriptSyncPatch, stream: MuWriteStream) {
    stream.grow(8);
    stream.writeUint32(target.id);
    stream.writeUint32(target.ids.length);
    for (let i = 0; i < target.ids.length; ++i) {
      const id = target.ids[i];
      const head = stream.offset;
      stream.grow(4);
      stream.offset += 4;
      const schema = this.schemas[id];
      const hasPatch = schema.diff(schema.identity, target.data[i], stream);
      stream.writeUint32At(head, (id << 1) | +hasPatch);
    }
    return true;
  }

  public patch(_, stream: MuReadStream) {
    const result = allocScriptSyncPatch();
    result.id = stream.readUint32();
    const count = stream.readUint32();
    for (let i = 0; i < count; ++i) {
      const info = stream.readUint32();
      const id = info >> 1;
      const needsPatch = info & 1;
      if (
        id < 0 ||
        id >= this.schemas.length ||
        (i > 0 && id <= result.ids[i - 1])
      ) {
        throw new Error('bad sync packet from script shell');
      }
      const schema = this.schemas[id];
      result.ids.push(id);
      if (needsPatch) {
        result.data.push(schema.patch(schema.identity, stream));
      } else {
        result.data.push(schema.clone(schema.identity));
      }
    }
    return result;
  }
}
