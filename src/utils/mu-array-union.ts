import { isMuPrimitiveType } from '@box/mudb/schema/is-primitive';
import { MuSchema } from '@box/mudb/schema/schema';
import { MuReadStream, MuWriteStream } from '@box/mudb/stream';
import { CodeGenContext } from './codegen';

export type ArrayUnionInstance<SubTypes extends [...MuSchema<unknown>[]]> = {
  id: number[];
  data: SubTypes[number]['identity'][];
};

enum Ops {
  INSERT_IDENTITY,
  INSERT,
  PATCH,
  COPY,
  STOP,
}

let counter = 0;

export class MuArrayUnion<SubTypes extends [...MuSchema<unknown>[]]>
  implements MuSchema<ArrayUnionInstance<SubTypes>>
{
  public readonly muType = 'array-union';

  public readonly identity: ArrayUnionInstance<SubTypes> = { id: [], data: [] };
  public readonly muData: SubTypes;
  public readonly json: { type: 'array-union'; data: SubTypes[number]['json'] };

  public pool: ArrayUnionInstance<SubTypes>[] = [];

  public clone: MuSchema<ArrayUnionInstance<SubTypes>>['clone'];
  public assign: MuSchema<ArrayUnionInstance<SubTypes>>['assign'];
  public diff: MuSchema<ArrayUnionInstance<SubTypes>>['diff'];
  public patch: MuSchema<ArrayUnionInstance<SubTypes>>['patch'];

  constructor(...subtypes: SubTypes) {
    this.muData = subtypes;
    this.json = {
      type: 'array-union',
      data: subtypes.map((t) => t.json),
    };

    const context = new CodeGenContext('array_union_' + counter++);
    {
      // generate source code for clone
      const clone = context.func('clone');
      const src = clone.arg();

      const body = clone.block();

      const ret = body.def();
      const ids = body.def();
      const outData = body.def();
      const inData = body.def();
      const ptr = body.def();

      body.push(`
            ${ret} = ${body.inject(this.pool)}.pop();
            ${ids} = ${src}.id;
            ${inData} = ${src}.data;
            if (${ret}) {
                ${ret}.id = ${ids}.slice();
                ${ret}.data.length = 0;
            } else {
                ${ret} = {
                    id: ${ids}.slice(),
                    data: [],
                };
            }
            ${outData} = ${ret}.data;
            ${ptr} = 0;`);

      for (let i = 0; i < subtypes.length; ++i) {
        body.push(`
            if (${ptr} < ${ids}.length && ${ids}[${ptr}] === ${i}) {`);
        if (isMuPrimitiveType(subtypes[i].muType)) {
          body.push(`
                ${outData}.push(${inData}[${ptr}++]);`);
        } else {
          body.push(`
                ${outData}.push(${body.inject(
            subtypes[i],
          )}.clone(${inData}[${ptr}++]));`);
        }
        body.push(`
            }`);
      }
      body.push(`
            return ${ret}`);
    }
    {
      // source code for assign
      const assign = context.func('assign');

      const dst = assign.arg();
      const src = assign.arg();

      const copy = assign.block();
      const write = assign.block();

      const sids = assign.def();
      const sdata = assign.def();
      const sptr = assign.def();
      const dids = assign.def();
      const ddata = assign.def();
      const dptr = assign.def();
      const optr = assign.def();

      copy.push(`
            ${sids} = ${src}.id;
            ${sdata} = ${src}.data;
            ${sptr} = 0;
            ${dids} = ${dst}.id;
            ${ddata} = ${dst}.data;
            ${dptr} = 0;
            ${optr} = 0;`);

      write.push(`
            ${dids}.length = ${ddata}.length = ${optr};
            ${optr} = 0;`);

      subtypes.forEach((schema, id) => {
        const flag = assign.def();
        const value = assign.def();

        if (isMuPrimitiveType(schema.muType)) {
          copy.push(`
            if (${sptr} < ${sids}.length && ${sids}[${sptr}] === ${id}) {
                ${flag} = true;
                ${value} = ${sdata}[${sptr}++];
                ${optr}++;
            } else {
                ${flag} = false;
            }
            if (${dptr} < ${dids}.length && ${dids}[${dptr}] === ${id}) {
                ${dptr}++;
            }`);
        } else {
          const schemaRef = copy.inject(schema);
          copy.push(`
            if (${sptr} < ${sids}.length && ${sids}[${sptr}] === ${id}) {
                ${flag} = true;
                ${optr}++;
                if (${dptr} < ${dids}.length && ${dids}[${dptr}] === ${id}) {
                    ${value} = ${schemaRef}.assign(${ddata}[${dptr}++], ${sdata}[${sptr}++]);
                } else {
                    ${value} = ${schemaRef}.clone(${sdata}[${sptr}++]);
                }
            } else {
                ${flag} = false;
                if (${dptr} < ${dids}.length && ${dids}[${dptr}] === ${id}) {
                    ${schemaRef}.free(${ddata}[${dptr}++]);
                }
            }`);
        }
        write.push(`
            if (${flag}) {
                ${dids}[${optr}] = ${id};
                ${ddata}[${optr}] = ${value};
                ${optr}++;
            }`);
      });

      write.push(`
            return ${dst};`);
    }
    {
      // source code for diff
      const diff = context.func('diff');

      const base = diff.arg();
      const target = diff.arg();
      const out = diff.arg();

      const body = diff.block();

      const bptr = diff.def();
      const bids = diff.def();
      const bdata = diff.def();
      const tptr = diff.def();
      const tids = diff.def();
      const tdata = diff.def();
      const delta = diff.def();
      const startPtr = diff.def();

      body.push(`
            ${out}.grow(${subtypes.length * 20});
            ${bids} = ${base}.id;
            ${bdata} = ${base}.data;
            ${bptr} = 0;
            ${tids} = ${target}.id;
            ${tdata} = ${target}.data;
            ${tptr} = 0;
            ${delta} = false;
            ${startPtr} = ${out}.offset;`);

      function emitDiff(
        id: number,
        schema: MuSchema<any>,
        bval: string,
        tval: string,
      ) {
        const tmpPtr = body.def();
        const endPtr = body.def();
        body.push(`
                    ${tmpPtr} = ${out}.offset;
                    ${out}.writeVarint(${(id << 4) | Ops.COPY});
                    if (${body.inject(schema)}.diff(${bval}, ${tval}, ${out})) {
                        ${delta} = true;
                        ${endPtr} = ${out}.offset;
                        ${out}.offset = ${tmpPtr};
                        ${out}.writeVarint(${(id << 4) | Ops.PATCH});
                        ${out}.offset = ${endPtr};
                    }`);
      }

      function emitClone(id: number, schema: MuSchema<any>, tval: string) {
        if (isMuPrimitiveType(schema.muType)) {
          body.push(`
                    if (${tval} === ${body.inject(schema.identity)}) {
                        ${out}.writeVarint(${(id << 4) | Ops.INSERT_IDENTITY});
                    } else {
                        ${out}.writeVarint(${(id << 4) | Ops.INSERT});
                        ${body.inject(schema)}.diff(${body.inject(
            schema.identity,
          )}, ${tval}, ${out});
                    }`);
        } else {
          const tmpPtr = body.def();
          const endPtr = body.def();
          body.push(`
                    ${tmpPtr} = ${out}.offset;
                    ${out}.writeVarint(${(id << 4) | Ops.INSERT_IDENTITY});
                    if (${body.inject(schema)}.diff(${body.inject(
            schema.identity,
          )}, ${tval}, ${out})) {
                        ${endPtr} = ${out}.offset;
                        ${out}.offset = ${tmpPtr};
                        ${out}.writeVarint(${(id << 4) | Ops.INSERT});
                        ${out}.offset = ${endPtr};
                    }`);
        }
      }

      subtypes.forEach((schema, id) => {
        const bval = body.def();
        const tval = body.def();

        body.push(`
            if (${tptr} < ${tids}.length && ${tids}[${tptr}] === ${id}) {
                ${tval} = ${tdata}[${tptr}++];
                if (${bptr} < ${bids}.length && ${bids}[${bptr}] === ${id}) {
                    ${bval} = ${bdata}[${bptr}++];`);
        emitDiff(id, schema, bval, tval);
        body.push(`
                } else {
                    ${delta} = true;`);
        emitClone(id, schema, tval);
        body.push(`
                }
            } else if (${bptr} < ${bids}.length && ${bids}[${bptr}] === ${id}) {
                ${bptr}++;
                ${delta} = true;
            }`);
      });

      body.push(`
            if (${delta}) {
                ${out}.writeVarint(${Ops.STOP});
            } else {
                ${out}.offset = ${startPtr};
            }
            return ${delta};`);
    }
    {
      // source code for patch
      const patch = context.func('patch');

      const base = patch.arg();
      const inp = patch.arg();

      const body = patch.block();

      const result = patch.def();
      const oids = patch.def();
      const odata = patch.def();

      const bids = patch.def();
      const bdata = patch.def();
      const bptr = patch.def();

      const curId = patch.def();
      const curOp = patch.def();

      body.push(`
            ${result} = ${body.inject(this.pool)}.pop() || { id: [], data: [] };
            ${oids} = ${result}.id;
            ${odata} = ${result}.data;
            ${bids} = ${base}.id;
            ${bdata} = ${base}.data;
            ${bptr} = 0;
            ${oids}.length = ${odata}.length = 0;`);

      function emitRead() {
        body.push(`
                ${curId} = ${inp}.readVarint();
                ${curOp} = ${curId} & 0x7;
                if (${curOp} === ${Ops.STOP}) {
                    return ${result};
                }
                ${curId} = ${curId} >>> 4;`);
      }

      emitRead();

      function emitPatchInsert(schema: MuSchema<any>) {
        body.push(`
                    ${odata}.push(${body.inject(schema)}.patch(${body.inject(
          schema.identity,
        )}, ${inp}));`);
      }

      function emitPatchInsertIdentity(schema: MuSchema<any>) {
        if (isMuPrimitiveType(schema.muType)) {
          if (typeof schema.identity === 'string') {
            body.push(`
                    ${odata}.push(${body.inject(schema.identity)});`);
          } else {
            body.push(`
                    ${odata}.push(${schema.identity});`);
          }
        } else {
          body.push(`
                    ${odata}.push(${body.inject(schema)}.clone(${body.inject(
            schema.identity,
          )}));`);
        }
      }

      function emitPatchPatch(schema: MuSchema<any>, bval: string) {
        body.push(`
                    ${odata}.push(${body.inject(
          schema,
        )}.patch(${bval}, ${inp}));`);
      }

      function emitPatchCopy(schema: MuSchema<any>, bval: string) {
        if (isMuPrimitiveType(schema.muType)) {
          body.push(`
                    ${odata}.push(${bval});`);
        } else {
          body.push(`
                    ${odata}.push(${body.inject(schema)}.clone(${bval}));`);
        }
      }

      subtypes.forEach((schema, id) => {
        const bval = body.def();
        body.push(`
            if (${curId} === ${id}) {
                ${oids}.push(${id});
                if (${curOp} === ${Ops.INSERT}) {`);
        emitPatchInsert(schema);
        body.push(`
                } else if (${curOp} === ${Ops.INSERT_IDENTITY}) {`);
        emitPatchInsertIdentity(schema);
        body.push(`
                } else {
                    if (${bptr} >= ${bids}.length || ${bids}[${bptr}] !== ${id}) {
                        throw new Error('Invalid base item for schema ' + ${id});
                    }
                    ${bval} = ${bdata}[${bptr}++];
                    if (${curOp} === ${Ops.PATCH}) {`);
        emitPatchPatch(schema, bval);
        body.push(`
                    } else if (${curOp} === ${Ops.COPY}) {`);
        emitPatchCopy(schema, bval);
        body.push(`
                    }
                }`);
        emitRead();
        body.push(`
            } else if (${bptr} < ${bids}.length && ${bids}[${bptr}] === ${id}) {
                ${bptr}++;
            }`);
      });

      body.push(`
            return ${result};`);
    }

    const procs = context.compile();
    this.clone = procs.clone;
    this.assign = procs.assign;
    this.diff = procs.diff;
    this.patch = procs.patch;
  }

  public alloc(): ArrayUnionInstance<SubTypes> {
    return (
      this.pool.pop() || {
        id: [],
        data: [],
      }
    );
  }

  public free(instance: ArrayUnionInstance<SubTypes>) {
    for (let i = 0; i < instance.data.length; ++i) {
      const schema = this.muData[instance.id[i]];
      schema.free(instance.data[i]);
    }
    instance.data.length = instance.id.length = 0;
    this.pool.push(instance);
  }

  public equal(
    a: ArrayUnionInstance<SubTypes>,
    b: ArrayUnionInstance<SubTypes>,
  ): boolean {
    if (a.id.length !== b.id.length) {
      return false;
    }
    for (let i = 0; i < a.id.length; ++i) {
      if (a.id[i] !== b.id[i]) {
        return false;
      }
    }
    for (let i = 0; i < a.id.length; ++i) {
      if (!this.muData[a.id[i]].equal(a.data[i], b.data[i])) {
        return false;
      }
    }
    return true;
  }

  public toJSON(instance: ArrayUnionInstance<SubTypes>): {
    id: number[];
    data: any;
  } {
    return {
      id: instance.id.slice(),
      data: instance.data.map((x, i) => this.muData[instance.id[i]].toJSON(x)),
    };
  }

  public fromJSON(json: any): ArrayUnionInstance<SubTypes> {
    const result = this.alloc();
    if (
      typeof json === 'object' &&
      Array.isArray(json.id) &&
      Array.isArray(json.data) &&
      json.id.length === json.data.length
    ) {
      const ids = json.id;
      const data = json.data;
      for (let i = 0; i < ids.length; ++i) {
        const id = ids[i];
        const obj = data[i];
        const schema = this.muData[id];
        if (schema) {
          result.id.push(+id);
          result.data.push(schema.fromJSON(obj));
        }
      }
    }
    return result;
  }
}
