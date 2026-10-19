import { MuSchema, MuArray } from '@box/mudb/schema';
import { MuWriteStream, MuReadStream } from '@box/mudb/stream';

export class RelativeArray<TSchema extends MuSchema<any>>
  implements MuSchema<TSchema['identity'][]>
{
  public identity: TSchema['identity'][];
  public muType = 'relative array';
  public muData: TSchema;
  public json: any;

  public arraySchema: MuArray<TSchema>;

  public alloc: () => TSchema['identity'][];
  public free: (x: TSchema['identity'][]) => void;
  public clone: (x: TSchema['identity'][]) => TSchema['identity'][];
  public equal: (x: TSchema['identity'][], y: TSchema['identity'][]) => boolean;
  public assign: (
    x: TSchema['identity'][],
    y: TSchema['identity'][],
  ) => TSchema['identity'][];
  public toJSON: (x: TSchema['identity'][]) => any[];
  public fromJSON: (x: any) => TSchema['identity'][];

  constructor(
    schema: TSchema,
    capacity: number,
    identity?: TSchema['identity'][],
  ) {
    const arraySchema = (this.arraySchema = new MuArray(
      schema,
      capacity,
      identity,
    ));
    this.json = {
      type: 'relative array',
      value: schema.json,
    };
    this.muData = schema;
    this.identity = arraySchema.identity;

    this.alloc = arraySchema.alloc;
    this.free = arraySchema.free;
    this.clone = arraySchema.clone;
    this.equal = arraySchema.equal;
    this.assign = arraySchema.assign;
    this.toJSON = arraySchema.toJSON;
    this.fromJSON = arraySchema.fromJSON;
  }

  public diff(
    base: TSchema['identity'][],
    target: TSchema['identity'][],
    stream: MuWriteStream,
  ): boolean {
    const prefixOffset = stream.offset;
    const targetLength = target.length;

    const numTrackers = Math.ceil(targetLength / 8);
    stream.grow(4 + numTrackers);

    stream.writeUint32(targetLength);

    let trackerOffset = stream.offset;
    stream.offset = trackerOffset + numTrackers;

    let tracker = 0;
    let numPatch = 0;

    const baseLength = base.length;
    const valueSchema = this.muData;
    let prev = base.length > 0 ? base[0] : valueSchema.identity;
    for (let i = 0; i < target.length; ++i) {
      if (valueSchema.diff(prev, target[i], stream)) {
        tracker |= 1 << (i & 7);
        ++numPatch;
      }

      if ((i & 7) === 7) {
        stream.writeUint8At(trackerOffset++, tracker);
        tracker = 0;
      }

      prev = target[i];
    }

    if (targetLength & 7) {
      stream.writeUint8At(trackerOffset, tracker);
    }

    if (numPatch > 0 || baseLength !== targetLength) {
      return true;
    }
    stream.offset = prefixOffset;
    return false;
  }

  public patch(
    base: TSchema['identity'][],
    stream: MuReadStream,
  ): TSchema['identity'][] {
    const result = this.clone(base);

    const targetLength = stream.readUint32();
    result.length = targetLength;

    let trackerOffset = stream.offset;
    const numTrackers = Math.ceil(targetLength / 8);
    stream.offset = trackerOffset + numTrackers;

    let tracker = 0;

    const valueSchema = this.muData;
    let prev = base.length > 0 ? base[0] : valueSchema.identity;
    for (let i = 0; i < targetLength; ++i) {
      const mod8 = i & 7;

      if (!mod8) {
        tracker = stream.readUint8At(trackerOffset++);
      }

      if ((1 << mod8) & tracker) {
        prev = result[i] = valueSchema.patch(prev, stream);
      } else {
        result[i] = valueSchema.clone(prev);
      }
    }

    return result;
  }
}
