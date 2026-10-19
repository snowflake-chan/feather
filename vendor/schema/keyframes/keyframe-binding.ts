import { GameAssetType, GameEasing, GameEntity } from '../api/js/api';
import {
  GameRGBColor,
  GameRGBAColor,
  GameVector3,
  GameQuaternion,
} from '../api/js/math';
import { HashSchema } from '../content-server';
import {
  MuArray,
  MuBoolean,
  MuQuantizedFloat,
  MuSchema,
  MuSortedArray,
  MuStruct,
  MuUint32,
  MuUint8,
  MuVarint,
} from '@box/mudb/schema/index';
import { RigidBodyFlags } from '../physics/physics-schema';
import { MuRefSchema } from '../utils/ref-schema';
import { compareId, indexEqRange } from '@box/utils/id';

import { CodeGenBlock, CodeGenContext } from './codegen';
import { MuArrayUnion } from './mu-array-union';
import { sortedArrayDelete } from '@box/utils/sorted-array-remove';
import {
  RestrictProps,
  RestrictObj,
  safePropExpr,
  safeReadNumExpr,
  safeReadStrExpr,
  safeReadBoolExpr,
} from '@box/utils/script';
import {
  KeyframeTrackIndex,
  KeyframeTrackIndexSchema,
  rebuildKeyframeTrackIndex,
  updateKeyframeTrackIndex,
} from './track-index';
import {
  AnimationPlaybackMode,
  GenericAnimation,
  KeyframeEaseMode,
} from './type';

export const MAX_ANIMATIONS = 1 << 16;

export const EASE_MAPPING: { [scriptName: string]: KeyframeEaseMode } = {};
EASE_MAPPING[GameEasing.NONE] = KeyframeEaseMode.NONE;
EASE_MAPPING[GameEasing.LINEAR] = KeyframeEaseMode.LINEAR;
EASE_MAPPING[GameEasing.QUADRATIC] = KeyframeEaseMode.QUADRATIC;
EASE_MAPPING[GameEasing.SINE] = KeyframeEaseMode.SINE;
EASE_MAPPING[GameEasing.EXP] = KeyframeEaseMode.EXP;
EASE_MAPPING[GameEasing.BACK] = KeyframeEaseMode.BACK;
EASE_MAPPING[GameEasing.ELASTIC] = KeyframeEaseMode.ELASTIC;
EASE_MAPPING[GameEasing.BOUNCE] = KeyframeEaseMode.BOUNCE;
EASE_MAPPING[GameEasing.CIRCLE] = KeyframeEaseMode.CIRCLE;

export const INV_EASE_MAPPING: { [val: number]: string } = {};
Object.keys(EASE_MAPPING).forEach((id) => {
  INV_EASE_MAPPING[EASE_MAPPING[id]] = id;
});

// callbacks for parsing keyframe data into scripts
export interface KeyframeScriptParserAPI {
  pathToHash: (path: string, type: GameAssetType) => string;
  hashToPath: (hash: string) => string;
  fileToMeshId: (file: string) => number;
  meshIdToFile: (meshId: number) => string;
  entityToId: (entity: GameEntity) => number;
  idToEntity: (id: number) => GameEntity | null;
  positionToRigidBodyPosition: (
    targetId: number,
    x: number,
    y: number,
    z: number,
  ) => {
    x: number;
    y: number;
    z: number;
  };
  rigidBodyPositionToPosition: (
    targetId: number,
    x: number,
    y: number,
    z: number,
  ) => {
    x: number;
    y: number;
    z: number;
  };
}

function compareTargetId<T extends { targetId: number }>(a: T, b: T) {
  return a.targetId - b.targetId;
}

export interface GenericKeyframe {
  tick: number;
  easeIn: KeyframeEaseMode;
  easeOut: KeyframeEaseMode;
  components: any;
}

export interface GenericAnimationIndex {
  dirty: boolean;
  tracker: KeyframeTrackIndex;
  components: any;
}

export interface KeyframePropBinding<
  KeyframeType,
  ComponentType,
  PropSchemea extends MuSchema<any>,
> {
  schema: PropSchemea;

  emitParse: (
    block: CodeGenBlock,
    id: number,
    idEntries: string,
    dataEntries: string,
    keyframe: string,
    parseAPI: string,
    targetId: string,
  ) => void;
  emitSerialize: (
    block: CodeGenBlock,
    data: string,
    keyframe: string,
    parseAPI: string,
    targetId: string,
  ) => void;
  emitInterpolate0: (
    block: CodeGenBlock,
    component: string,
    prop: string,
  ) => void;
  emitInterpolate1: (
    block: CodeGenBlock,
    component: string,
    prop0: string,
    prop1: string,
    weight0: string,
    weight1: string,
  ) => void;
  emitClear: (block: CodeGenBlock, dst: string) => void;
}

export interface KeyframeComponentBinding<
  KeyframeType,
  ComponentType,
  ComponentSchema extends MuArrayUnion<[...MuSchema<unknown>[]]>,
  ComponentName extends string,
> {
  name: ComponentName;
  schema: ComponentSchema;

  emitParse: (
    block: CodeGenBlock,
    data: string,
    keyframe: string,
    parseAPI: string,
    targetId: string,
  ) => void;
  emitSerialize: (
    block: CodeGenBlock,
    data: string,
    keyframe: string,
    parseAPI: string,
    targetId: string,
  ) => void;
  emitInterpolate0: (
    block: CodeGenBlock,
    component: string,
    typeData: string,
    propData: string,
    frame0: string,
    frame1: string,
  ) => void;
  emitInterpolate1: (
    block: CodeGenBlock,
    component: string,
    typeData: string,
    propData: string,
    prev0: string,
    prev1: string,
    next0: string,
    next1: string,
    weight0: string,
    weight1: string,
  ) => void;
  emitClear: (
    block: CodeGenBlock,
    typeData: string,
    lo: string,
    hi: string,
    dst: string,
  ) => void;
}

type UnwrapSchema<List extends [...unknown[]]> = List extends [
  { schema: infer Schema },
  ...infer Tail,
]
  ? [Schema, ...UnwrapSchema<Tail>]
  : [];
type UnwrapComponentIndex<List extends [...unknown[]]> = List extends [
  { name: infer ComponentName },
  ...infer Tail,
]
  ? ComponentName extends string
    ? {
        [name in ComponentName]: MuStruct<{
          id: MuArray<MuVarint>;
          frameOffset: MuArray<MuVarint>;
          dataOffset: MuArray<MuVarint>;
          typeData: MuArray<MuVarint>;
          animData: MuArray<MuRefSchema<any>>;
        }>;
      } & UnwrapComponentIndex<Tail>
    : {}
  : {};
type UnwrapInterpolatorsArray<
  IndexType,
  List extends [...unknown[]],
> = List extends [
  KeyframeComponentBinding<any, infer ComponentType, any, infer ComponentName>,
  ...infer Tail,
]
  ? ComponentName extends string
    ? {
        [name in ComponentName]: (
          index: IndexType,
          components: ComponentType[],
        ) => void;
      } & UnwrapInterpolatorsArray<IndexType, Tail>
    : {}
  : {};
type UnwrapInterpolatorsSingleton<
  IndexType,
  List extends [...unknown[]],
> = List extends [
  KeyframeComponentBinding<any, infer ComponentType, any, infer ComponentName>,
  ...infer Tail,
]
  ? ComponentName extends string
    ? {
        [name in ComponentName]: (
          index: IndexType,
          components: ComponentType,
        ) => void;
      } & UnwrapInterpolatorsSingleton<IndexType, Tail>
    : {}
  : {};
type UnwrapInterpolators<
  Singleton extends boolean,
  IndexType,
  List extends [...unknown[]],
> = Singleton extends true
  ? UnwrapInterpolatorsSingleton<IndexType, List>
  : UnwrapInterpolatorsArray<IndexType, List>;
type UnwrapResettorArray<
  IndexType,
  List extends [...unknown[]],
> = List extends [
  KeyframeComponentBinding<any, infer ComponentType, any, infer ComponentName>,
  ...infer Tail,
]
  ? ComponentName extends string
    ? {
        [name in ComponentName]: (
          index: IndexType,
          dst: ComponentType[],
        ) => void;
      } & UnwrapResettorArray<IndexType, Tail>
    : {}
  : {};
type UnwrapResettorSingleton<
  IndexType,
  List extends [...unknown[]],
> = List extends [
  KeyframeComponentBinding<any, infer ComponentType, any, infer ComponentName>,
  ...infer Tail,
]
  ? ComponentName extends string
    ? {
        [name in ComponentName]: (index: IndexType, dst: ComponentType) => void;
      } & UnwrapResettorSingleton<IndexType, Tail>
    : {}
  : {};
type UnwrapResettor<
  Singleton extends boolean,
  IndexType,
  List extends [...unknown[]],
> = Singleton extends true
  ? UnwrapResettorSingleton<IndexType, List>
  : UnwrapResettorArray<IndexType, List>;
type VectorStructSchema<List extends [...unknown[]]> = List extends [
  string,
  ...infer Tail,
]
  ? { [id in List[0]]: MuQuantizedFloat } & VectorStructSchema<Tail>
  : {};
type UnwrapFlagSchema<List extends [...unknown[]]> = List extends [
  KeyframeComponentBinding<any, any, any, infer ComponentName>,
  ...infer Tail,
]
  ? { [name in ComponentName]: MuVarint } & UnwrapFlagSchema<Tail>
  : {};

export class KeyframeComponentBindingFactory<
  KeyframeType,
  ComponentType,
  ComponentName extends string,
> {
  constructor(
    public readonly name: ComponentName,
    public readonly defaultValue: ComponentType,
    public ctxt: CodeGenContext,
    public enginePrefix: string,
  ) {}

  private _engineProp(component: string, prop: string | number | Symbol) {
    return safePropExpr(component + this.enginePrefix, prop);
  }

  private _commonVectorBinding<
    ScriptVec,
    ScriptVecObj extends RestrictObj<KeyframeType, ScriptVec>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    ScriptFields extends [...(keyof ScriptVec)[]],
    SchemaProps extends [...unknown[]],
  >(
    ctor: new (...fields: number[]) => ScriptVec,
    scriptProp: ScriptProp,
    scriptFields: ScriptFields,
    schemaProps: SchemaProps,
    identity: number[],
    precision: number,
    minVal: number,
    maxVal: number,
  ) {
    const schemaArgs = <any>{};
    for (let i = 0; i < schemaProps.length; ++i) {
      schemaArgs[(<any>schemaProps)[i]] = new MuQuantizedFloat(
        precision,
        identity[i],
      );
    }
    const schema: MuStruct<VectorStructSchema<SchemaProps>> = new MuStruct(
      schemaArgs,
    );
    return {
      schema,

      emitParse: (
        block: CodeGenBlock,
        id: number,
        idEntries: string,
        dataEntries: string,
        keyframe: string,
      ) => {
        const fieldProp = safePropExpr(keyframe, scriptProp);
        const vecVal = block.def();
        const schemaRef = block.inject(schema);
        const outVal = block.def();
        block.push(`
                    /* parse prop ${scriptProp} -> ${schemaProps.join()} */
                    if ('${scriptProp}' in ${keyframe}) {
                        ${idEntries}.push(${id});
                        ${outVal} = ${schemaRef}.alloc();
                        ${dataEntries}.push(${outVal});
                        ${vecVal} = ${fieldProp};
                        if (Array.isArray(${vecVal})) {`);
        // emit array read
        for (let i = 0; i < schemaProps.length; ++i) {
          block.push(`
                            ${outVal}.${schemaProps[i]} = ${safeReadNumExpr(
            safePropExpr(vecVal, i),
            minVal,
            maxVal,
          )};`);
        }
        block.push(`
                        } else if (typeof ${vecVal} === 'object') {`);
        // emit object read
        for (let i = 0; i < schemaProps.length; ++i) {
          block.push(`
                            ${outVal}.${schemaProps[i]} = ${safeReadNumExpr(
            safePropExpr(vecVal, scriptFields[i]),
            minVal,
            maxVal,
          )};`);
        }
        block.push(`
                        } else if (typeof ${vecVal} === 'number') {
                            ${vecVal} = ${safeReadNumExpr(
          vecVal,
          minVal,
          maxVal,
        )};`);
        // emit number read
        for (let i = 0; i < schemaProps.length; ++i) {
          block.push(`
                            ${outVal}.${schemaProps[i]} = ${vecVal};`);
        }
        block.push(`
                        } else {
                            ${schemaRef}.assign(${outVal}, ${schemaRef}.identity);
                        }
                    }`);
      },

      emitSerialize: (block: CodeGenBlock, prop: string, keyframe: string) => {
        const ctorRef = block.inject(ctor);
        block.push(`
                    /* emit serialize ${scriptProp} -> ${schemaProps.join()} */
                    ${safePropExpr(
                      keyframe,
                      scriptProp,
                    )} = new ${ctorRef}(${schemaProps
          .map((p) => prop + '.' + p)
          .join(', ')});`);
      },
    };
  }

  public bindVecToProps<
    ScriptVec,
    ScriptVecObj extends RestrictObj<KeyframeType, ScriptVec>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    ScriptFields extends [...(keyof ScriptVec)[]],
    EngineProps extends [...RestrictProps<ComponentType, number>[]],
  >(
    ctor: new (...fields: number[]) => ScriptVec,
    scriptProp: ScriptProp,
    scriptFields: ScriptFields,
    engineProps: EngineProps,
    precision: number,
    minVal: number,
    maxVal: number,
  ) {
    const identity: number[] = engineProps.map(
      (p) => +(<any>this.defaultValue)[p],
    );
    const baseBinding = this._commonVectorBinding<
      ScriptVec,
      ScriptVecObj,
      ScriptProp,
      ScriptFields,
      EngineProps
    >(
      ctor,
      scriptProp,
      scriptFields,
      engineProps,
      identity,
      precision,
      minVal,
      maxVal,
    );
    return <
      KeyframePropBinding<
        KeyframeType,
        ComponentType,
        typeof baseBinding['schema']
      >
    >{
      ...baseBinding,

      emitInterpolate0: (
        block: CodeGenBlock,
        component: string,
        prop: string,
      ) => {
        block.push(`
                    /* emit interpolate0 ${engineProps.join()} */`);
        for (let i = 0; i < engineProps.length; ++i) {
          block.push(`
                    ${this._engineProp(component, engineProps[i])} = ${prop}.${
            engineProps[i]
          };`);
        }
      },

      emitInterpolate1: (
        block: CodeGenBlock,
        component: string,
        prop0: string,
        prop1: string,
        weight0: string,
        weight1: string,
      ) => {
        block.push(`
                    /* emit interpolate1 ${engineProps.join()} */`);
        for (let i = 0; i < engineProps.length; ++i) {
          block.push(`
                    ${this._engineProp(
                      component,
                      engineProps[i],
                    )} = ${weight0} * ${prop0}.${
            engineProps[i]
          } + ${weight1} * ${prop1}.${engineProps[i]};`);
        }
      },

      emitClear: (block: CodeGenBlock, dst: string) => {
        block.push(`
                    /* emit clear ${engineProps.length} */`);
        for (let i = 0; i < engineProps.length; ++i) {
          block.push(`
                    ${this._engineProp(dst, engineProps[i])} = ${
            identity[i]
          };`);
        }
      },
    };
  }

  public bindVecToVec<
    ScriptVec,
    ScriptVecObj extends RestrictObj<KeyframeType, ScriptVec>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    ScriptFields extends [...RestrictProps<ScriptVec, any>[]],
    EngineObj extends RestrictObj<ComponentType, Float32Array>,
    EngineProp extends RestrictProps<EngineObj, any>,
  >(
    ctor: new (...fields: number[]) => ScriptVec,
    scriptProp: ScriptProp,
    scriptFields: ScriptFields,
    engineProp: EngineProp,
    precision: number,
    minVal: number,
    maxVal: number,
  ) {
    const identity: number[] = (<any>this.defaultValue)[engineProp];
    const baseBinding = this._commonVectorBinding<
      ScriptVec,
      ScriptVecObj,
      ScriptProp,
      ScriptFields,
      ScriptFields
    >(
      ctor,
      scriptProp,
      scriptFields,
      scriptFields,
      identity,
      precision,
      minVal,
      maxVal,
    );
    return <
      KeyframePropBinding<
        KeyframeType,
        ComponentType,
        typeof baseBinding['schema']
      >
    >{
      ...baseBinding,

      emitInterpolate0: (
        block: CodeGenBlock,
        component: string,
        prop: string,
      ) => {
        const cval = block.def();
        block.push(`
                    /* emit interpolate0 ${engineProp} */
                    ${cval} = ${this._engineProp(component, engineProp)};`);
        for (let i = 0; i < scriptFields.length; ++i) {
          block.push(`
                    ${cval}[${i}] = ${prop}.${scriptFields[i]};`);
        }
      },

      emitInterpolate1: (
        block: CodeGenBlock,
        component: string,
        prop0: string,
        prop1: string,
        weight0: string,
        weight1: string,
      ) => {
        const cval = block.def();
        block.push(`
                    /* emit interpolate1 ${engineProp} */
                    ${cval} = ${this._engineProp(component, engineProp)};`);
        for (let i = 0; i < scriptFields.length; ++i) {
          block.push(`
                    ${cval}[${i}] = ${weight0} * ${prop0}.${scriptFields[i]} + ${weight1} * ${prop1}.${scriptFields[i]};`);
        }
      },

      emitClear: (block: CodeGenBlock, dst: string) => {
        const cval = block.def();
        block.push(`
                    /* emit clear ${engineProp} */
                    ${cval} = ${this._engineProp(dst, engineProp)};`);
        for (let i = 0; i < scriptFields.length; ++i) {
          block.push(`
                    ${cval}[${i}] = ${identity[i]};`);
        }
      },
    };
  }

  public vec3<
    ScriptVecObj extends RestrictObj<KeyframeType, GameVector3>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    EngineObj extends RestrictObj<ComponentType, Float32Array>,
    EngineProp extends RestrictProps<EngineObj, any>,
  >(
    scriptProp: ScriptProp,
    engineProp: EngineProp,
    precision: number = 1 / 256,
    minVal: number = -Infinity,
    maxVal: number = Infinity,
  ) {
    return this.bindVecToVec<
      GameVector3,
      ScriptVecObj,
      ScriptProp,
      ['x', 'y', 'z'],
      EngineObj,
      EngineProp
    >(
      GameVector3,
      scriptProp,
      ['x', 'y', 'z'],
      engineProp,
      precision,
      minVal,
      maxVal,
    );
  }

  public propVec3<
    ScriptVecObj extends RestrictObj<KeyframeType, GameVector3>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    EngineProps extends [...(keyof RestrictObj<ComponentType, number>)[]],
  >(
    scriptProp: ScriptProp,
    engineProps: EngineProps,
    precision: number = 1 / 256,
    minVal: number = -Infinity,
    maxVal: number = Infinity,
  ) {
    return this.bindVecToProps<
      GameVector3,
      ScriptVecObj,
      ScriptProp,
      ['x', 'y', 'z'],
      EngineProps
    >(
      GameVector3,
      scriptProp,
      ['x', 'y', 'z'],
      engineProps,
      precision,
      minVal,
      maxVal,
    );
  }

  public rgb<
    ScriptVecObj extends RestrictObj<KeyframeType, GameRGBColor>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    EngineObj extends RestrictObj<ComponentType, Float32Array>,
    EngineProp extends RestrictProps<EngineObj, any>,
  >(scriptProp: ScriptProp, engineProp: EngineProp) {
    return this.bindVecToVec<
      GameRGBColor,
      ScriptVecObj,
      ScriptProp,
      ['r', 'g', 'b'],
      EngineObj,
      EngineProp
    >(GameRGBColor, scriptProp, ['r', 'g', 'b'], engineProp, 1 / 256, 0, 1);
  }

  public propRGB<
    ScriptVecObj extends RestrictObj<KeyframeType, GameRGBColor>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    EngineProps extends [...(keyof RestrictObj<ComponentType, number>)[]],
  >(scriptProp: ScriptProp, engineProps: EngineProps) {
    return this.bindVecToProps<
      GameRGBColor,
      ScriptVecObj,
      ScriptProp,
      ['r', 'g', 'b'],
      EngineProps
    >(GameRGBColor, scriptProp, ['r', 'g', 'b'], engineProps, 1 / 256, 0, 1);
  }

  public rgba<
    ScriptVecObj extends RestrictObj<KeyframeType, GameRGBAColor>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    EngineObj extends RestrictObj<ComponentType, Float32Array>,
    EngineProp extends RestrictProps<EngineObj, any>,
  >(scriptProp: ScriptProp, engineProp: EngineProp) {
    return this.bindVecToVec<
      GameRGBAColor,
      ScriptVecObj,
      ScriptProp,
      ['r', 'g', 'b', 'a'],
      EngineObj,
      EngineProp
    >(
      GameRGBAColor,
      scriptProp,
      ['r', 'g', 'b', 'a'],
      engineProp,
      1 / 256,
      0,
      1,
    );
  }

  public propRGBA<
    ScriptVecObj extends RestrictObj<KeyframeType, GameRGBAColor>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    EngineProps extends [...(keyof RestrictObj<ComponentType, number>)[]],
  >(scriptProp: ScriptProp, engineProps: EngineProps) {
    return this.bindVecToProps<
      GameRGBAColor,
      ScriptVecObj,
      ScriptProp,
      ['r', 'g', 'b', 'a'],
      EngineProps
    >(
      GameRGBAColor,
      scriptProp,
      ['r', 'g', 'b', 'a'],
      engineProps,
      1 / 256,
      0,
      1,
    );
  }

  public light<
    ScriptVecObj extends RestrictObj<KeyframeType, GameRGBColor>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    EngineObj extends RestrictObj<ComponentType, Float32Array>,
    EngineProp extends RestrictProps<EngineObj, any>,
  >(scriptProp: ScriptProp, engineProp: EngineProp) {
    return this.bindVecToVec<
      GameRGBColor,
      ScriptVecObj,
      ScriptProp,
      ['r', 'g', 'b'],
      EngineObj,
      EngineProp
    >(
      GameRGBColor,
      scriptProp,
      ['r', 'g', 'b'],
      engineProp,
      1 / 64,
      0,
      Infinity,
    );
  }

  public propLight<
    ScriptVecObj extends RestrictObj<KeyframeType, GameRGBColor>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    EngineProps extends [...(keyof RestrictObj<ComponentType, number>)[]],
  >(scriptProp: ScriptProp, engineProps: EngineProps) {
    return this.bindVecToProps<
      GameRGBColor,
      ScriptVecObj,
      ScriptProp,
      ['r', 'g', 'b'],
      EngineProps
    >(
      GameRGBColor,
      scriptProp,
      ['r', 'g', 'b'],
      engineProps,
      1 / 64,
      0,
      Infinity,
    );
  }

  public propQuat<
    ScriptVecObj extends RestrictObj<KeyframeType, GameQuaternion>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    EngineProps extends [...(keyof RestrictObj<ComponentType, number>)[]],
  >(scriptProp: ScriptProp, engineProps: EngineProps) {
    const base = this.bindVecToProps<
      GameQuaternion,
      ScriptVecObj,
      ScriptProp,
      ['w', 'x', 'y', 'z'],
      EngineProps
    >(
      GameQuaternion,
      scriptProp,
      ['w', 'x', 'y', 'z'],
      engineProps,
      1 / 128,
      -1,
      1,
    );

    // Custom quaternion parse method, need to normalize
    base.emitParse = (
      block: CodeGenBlock,
      id: number,
      idEntries: string,
      dataEntries: string,
      keyframe: string,
    ) => {
      const fieldProp = safePropExpr(keyframe, scriptProp);
      const vecVal = block.def();
      const schemaRef = block.inject(base.schema);
      const outVal = block.def();
      block.push(`
                /* parse prop ${scriptProp} -> ${engineProps.join()} */
                if ('${scriptProp}' in ${keyframe}) {
                    ${idEntries}.push(${id});
                    ${outVal} = ${schemaRef}.alloc();
                    ${dataEntries}.push(${outVal});
                    ${vecVal} = ${fieldProp};
                    if (Array.isArray(${vecVal})) {`);
      // emit array read
      for (let i = 0; i < engineProps.length; ++i) {
        block.push(`
                        ${outVal}.${engineProps[i]} = ${safeReadNumExpr(
          safePropExpr(vecVal, i),
          -1,
          1,
        )};`);
      }
      block.push(`
                    } else if (typeof ${vecVal} === 'object') {`);
      // emit object read
      for (let i = 0; i < engineProps.length; ++i) {
        block.push(`
                        ${outVal}.${engineProps[i]} = ${safeReadNumExpr(
          safePropExpr(vecVal, ['w', 'x', 'y', 'z'][i]),
          -1,
          1,
        )};`);
      }

      // normalize output
      const s = block.def();
      block.push(`
                    } else {
                        ${schemaRef}.assign(${outVal}, ${schemaRef}.identity);
                    }
                    ${s} = Math.pow(${outVal}.${engineProps[0]}, 2) + Math.pow(${outVal}.${engineProps[1]}, 2) + Math.pow(${outVal}.${engineProps[2]}, 2) + Math.pow(${outVal}.${engineProps[3]}, 2);
                    if (${s} > 0.0001) {
                        ${s} = 1 / Math.sqrt(${s});
                        ${outVal}.${engineProps[0]} *= ${s};
                        ${outVal}.${engineProps[1]} *= ${s};
                        ${outVal}.${engineProps[2]} *= ${s};
                        ${outVal}.${engineProps[3]} *= ${s};
                    } else {
                        ${schemaRef}.assign(${outVal}, ${schemaRef}.identity);
                    }
                }`);
    };

    // Need to normalize quaternion interpolation
    base.emitInterpolate1 = (
      block: CodeGenBlock,
      component: string,
      prop0: string,
      prop1: string,
      weight0: string,
      weight1: string,
    ) => {
      const w = block.def();
      const x = block.def();
      const y = block.def();
      const z = block.def();
      const w0 = block.def();
      const x0 = block.def();
      const y0 = block.def();
      const z0 = block.def();
      const w1 = block.def();
      const x1 = block.def();
      const y1 = block.def();
      const z1 = block.def();
      const dot = block.def();
      const s = block.def();
      block.push(`
                /* emit interpolate1 ${engineProps.join()} */
                ${w0} = ${prop0}.${engineProps[0]};
                ${x0} = ${prop0}.${engineProps[1]};
                ${y0} = ${prop0}.${engineProps[2]};
                ${z0} = ${prop0}.${engineProps[3]};
                ${w1} = ${prop1}.${engineProps[0]};
                ${x1} = ${prop1}.${engineProps[1]};
                ${y1} = ${prop1}.${engineProps[2]};
                ${z1} = ${prop1}.${engineProps[3]};
                ${dot} = ${w0} * ${w1} + ${x0} * ${x1} + ${y0} * ${y1} + ${z0} * ${z1};
                if (${dot} < 0) {
                    ${w} = -${weight0} * ${w0} + ${weight1} * ${w1};
                    ${x} = -${weight0} * ${x0} + ${weight1} * ${x1};
                    ${y} = -${weight0} * ${y0} + ${weight1} * ${y1};
                    ${z} = -${weight0} * ${z0} + ${weight1} * ${z1};
                } else {
                    ${w} = ${weight0} * ${w0} + ${weight1} * ${w1};
                    ${x} = ${weight0} * ${x0} + ${weight1} * ${x1};
                    ${y} = ${weight0} * ${y0} + ${weight1} * ${y1};
                    ${z} = ${weight0} * ${z0} + ${weight1} * ${z1};
                }
                ${s} = Math.pow(${w}, 2) + Math.pow(${x}, 2) + Math.pow(${y}, 2) + Math.pow(${z}, 2);
                if (${s} > 0.0001) {
                    ${s} = 1 / Math.sqrt(${s});
                    ${this._engineProp(
                      component,
                      engineProps[0],
                    )} = ${s} * ${w};
                    ${this._engineProp(
                      component,
                      engineProps[1],
                    )} = ${s} * ${x};
                    ${this._engineProp(
                      component,
                      engineProps[2],
                    )} = ${s} * ${y};
                    ${this._engineProp(
                      component,
                      engineProps[3],
                    )} = ${s} * ${z};
                } else {
                    ${this._engineProp(component, engineProps[0])} = ${+this
        .defaultValue[engineProps[0]]};
                    ${this._engineProp(component, engineProps[1])} = ${+this
        .defaultValue[engineProps[1]]};
                    ${this._engineProp(component, engineProps[2])} = ${+this
        .defaultValue[engineProps[2]]};
                    ${this._engineProp(component, engineProps[3])} = ${+this
        .defaultValue[engineProps[3]]};
                }`);
    };

    return base;
  }

  public entity<
    ScriptProp extends RestrictProps<KeyframeType, GameEntity | null>,
    EngineProp extends RestrictProps<ComponentType, number>,
  >(
    scriptProp: ScriptProp,
    engineProp: EngineProp,
  ): KeyframePropBinding<KeyframeType, ComponentType, MuVarint> {
    const defaultValue = this.defaultValue[engineProp];
    return {
      schema: new MuVarint(),

      emitParse: (
        block: CodeGenBlock,
        id: number,
        idEntries: string,
        dataEntries: string,
        keyframe: string,
        parseAPI: string,
      ) => {
        block.push(`
                    /* emit parse ${scriptProp} -> ${engineProp} */
                    if ('${scriptProp}' in ${keyframe}) {
                        ${idEntries}.push(${id});
                        ${dataEntries}.push(${parseAPI}.entityToId(${safePropExpr(
          keyframe,
          scriptProp,
        )}));
                    }`);
      },

      emitSerialize: (
        block: CodeGenBlock,
        prop: string,
        keyframe: string,
        parseAPI: string,
      ) => {
        block.push(`
                    /* emit parse ${scriptProp} -> ${engineProp} */
                    ${safePropExpr(
                      keyframe,
                      scriptProp,
                    )} = ${parseAPI}.idToEntity(${prop});`);
      },

      emitInterpolate0: (
        block: CodeGenBlock,
        component: string,
        prop: string,
      ) => {
        block.push(`
                    ${this._engineProp(component, engineProp)} = ${prop};`);
      },

      emitInterpolate1: (
        block: CodeGenBlock,
        component: string,
        prop0: string,
      ) => {
        block.push(`
                    ${this._engineProp(component, engineProp)} = ${prop0};`);
      },

      emitClear: (block: CodeGenBlock, dst: string) => {
        block.push(`
                    ${this._engineProp(dst, engineProp)} = ${defaultValue};`);
      },
    };
  }

  public enum<
    EnumType extends string,
    ScriptProp extends RestrictProps<KeyframeType, EnumType>,
    EngineEnumType extends number,
    EngineProp extends RestrictProps<ComponentType, EngineEnumType>,
  >(
    scriptProp: ScriptProp,
    engineProp: EngineProp,
    enumVals: { [id: string]: number },
  ): KeyframePropBinding<KeyframeType, ComponentType, MuVarint> {
    const defaultValue = this.defaultValue[engineProp];
    return {
      schema: new MuVarint(),

      emitParse: (
        block: CodeGenBlock,
        id: number,
        idEntries: string,
        dataEntries: string,
        keyframe: string,
      ) => {
        block.push(`
                    /* emit parse ${scriptProp} -> ${engineProp} */
                    if ('${scriptProp}' in ${keyframe})
                    switch (${safeReadStrExpr(
                      safePropExpr(keyframe, scriptProp),
                    )}.toLowerCase()) {`);
        Object.keys(enumVals).forEach((p) => {
          block.push(`
                        case '${p}':
                            ${idEntries}.push(${id});
                            ${dataEntries}.push(${enumVals[p]});
                            break;`);
        });
        block.push(`
                    }`);
      },

      emitSerialize: (block: CodeGenBlock, prop: string, keyframe: string) => {
        const inverseIndex: any = {};
        Object.keys(enumVals).forEach((p) => {
          inverseIndex[enumVals[p]] = p;
        });
        block.push(`
                    /* emit parse ${scriptProp} -> ${engineProp} */
                    ${safePropExpr(keyframe, scriptProp)} = ${block.inject(
          inverseIndex,
        )}[${prop}];`);
      },

      emitInterpolate0: (
        block: CodeGenBlock,
        component: string,
        prop: string,
      ) => {
        block.push(`
                    ${this._engineProp(component, engineProp)} = ${prop};`);
      },

      emitInterpolate1: (
        block: CodeGenBlock,
        component: string,
        prop0: string,
      ) => {
        block.push(`
                    ${this._engineProp(component, engineProp)} = ${prop0};`);
      },

      emitClear: (block: CodeGenBlock, dst: string) => {
        block.push(`
                    ${this._engineProp(dst, engineProp)} = ${defaultValue};`);
      },
    };
  }

  public num<
    ScriptProp extends RestrictProps<KeyframeType, number>,
    EngineProp extends RestrictProps<ComponentType, number>,
  >(
    scriptProp: ScriptProp,
    engineProp: EngineProp,
    precision = 1 / 16,
    minVal = -Infinity,
    maxVal = Infinity,
    schema?: MuSchema<number>,
  ): KeyframePropBinding<KeyframeType, ComponentType, MuSchema<number>> {
    return {
      schema:
        schema ||
        new MuQuantizedFloat(precision, (<any>this.defaultValue)[engineProp]),

      emitParse: (
        block: CodeGenBlock,
        id: number,
        idEntries: string,
        dataEntries: string,
        keyframe: string,
      ) => {
        const fieldProp = safePropExpr(keyframe, scriptProp);
        block.push(`
                    /* parse prop ${scriptProp} -> ${engineProp} */
                    if ('${scriptProp}' in ${keyframe}) {
                        ${idEntries}.push(${id});
                        ${dataEntries}.push(${safeReadNumExpr(
          fieldProp,
          minVal,
          maxVal,
        )});
                    }`);
      },

      emitSerialize: (block: CodeGenBlock, prop: string, keyframe: string) => {
        block.push(`
                    /* serialize prop ${engineProp} -> ${scriptProp} */
                    ${safePropExpr(keyframe, scriptProp)} = ${prop};`);
      },

      emitInterpolate0: (
        block: CodeGenBlock,
        component: string,
        prop: string,
      ) => {
        block.push(`
                    ${this._engineProp(component, engineProp)} = ${prop};`);
      },

      emitInterpolate1: (
        block: CodeGenBlock,
        component: string,
        prop0: string,
        prop1: string,
        weight0: string,
        weight1: string,
      ) => {
        block.push(`
                    ${this._engineProp(
                      component,
                      engineProp,
                    )} = ${weight0} * ${prop0} + ${weight1} * ${prop1};`);
      },

      emitClear: (block: CodeGenBlock, dst: string) => {
        block.push(`
                    ${this._engineProp(dst, engineProp)} = ${
          this.defaultValue[engineProp]
        };`);
      },
    };
  }

  public physPosition() {
    const scriptProp = 'position';
    const schemaProps = ['x', 'y', 'z'];
    const scriptFields = ['x', 'y', 'z'];
    const minVal: number = -Infinity;
    const maxVal: number = Infinity;

    const base = this.propVec3<any, typeof scriptProp, any>(
      scriptProp,
      schemaProps,
      1 / 64,
    );

    base.emitParse = (
      block: CodeGenBlock,
      id: number,
      idEntries: string,
      dataEntries: string,
      keyframe: string,
      parseAPI: string,
      targetId: string,
    ) => {
      const fieldProp = safePropExpr(keyframe, scriptProp);
      const vecVal = block.def();
      const schemaRef = block.inject(base.schema);
      const outVal = block.def();
      block.push(`
                  /* parse prop ${scriptProp} -> ${schemaProps.join()} */
                  if ('${scriptProp}' in ${keyframe}) {
                      ${idEntries}.push(${id});
                      ${outVal} = ${schemaRef}.alloc();
                      ${dataEntries}.push(${outVal});
                      ${vecVal} = ${fieldProp};
                      if (Array.isArray(${vecVal})) {`);
      // emit array read
      for (let i = 0; i < schemaProps.length; ++i) {
        block.push(`
                          ${outVal}.${schemaProps[i]} = ${safeReadNumExpr(
          safePropExpr(vecVal, i),
          minVal,
          maxVal,
        )};`);
      }
      block.push(`
                      } else if (typeof ${vecVal} === 'object') {`);
      // emit object read
      for (let i = 0; i < schemaProps.length; ++i) {
        block.push(`
                          ${outVal}.${schemaProps[i]} = ${safeReadNumExpr(
          safePropExpr(vecVal, scriptFields[i]),
          minVal,
          maxVal,
        )};`);
      }
      block.push(`
                      } else if (typeof ${vecVal} === 'number') {
                          ${vecVal} = ${safeReadNumExpr(
        vecVal,
        minVal,
        maxVal,
      )};`);
      // emit number read
      for (let i = 0; i < schemaProps.length; ++i) {
        block.push(`
                          ${outVal}.${schemaProps[i]} = ${vecVal};`);
      }
      block.push(`
                      } else {
                          ${schemaRef}.assign(${outVal}, ${schemaRef}.identity);
                      }
                      ${schemaRef}.assign(${outVal}, ${parseAPI}.positionToRigidBodyPosition(${targetId}, ${outVal}.x, ${outVal}.y, ${outVal}.z));
                  }`);
    };

    base.emitSerialize = (
      block: CodeGenBlock,
      prop: string,
      keyframe: string,
      parseAPI: string,
      targetId: string,
    ) => {
      const ctorRef = block.inject(GameVector3);
      const outVal = block.def();
      block.push(`
        /* emit serialize ${scriptProp} -> ${schemaProps.join()} */
        ${outVal} = ${parseAPI}.rigidBodyPositionToPosition(${targetId}, ${prop}.x, ${prop}.y, ${prop}.z);
        ${safePropExpr(
          keyframe,
          scriptProp,
        )} = new ${ctorRef}(${outVal}.x, ${outVal}.y, ${outVal}.z);`);
    };

    base.emitInterpolate0 = (
      block: CodeGenBlock,
      component: string,
      prop: string,
    ) => {
      block.push(`
                /* emit position interpolate0 */
                ${component}.flags |= ${RigidBodyFlags.ANIMATED};
                ${component}.vx = ${prop}.x - ${component}.px;
                ${component}.vy = ${prop}.y - ${component}.py;
                ${component}.vz = ${prop}.z - ${component}.pz;`);
    };
    base.emitInterpolate1 = (
      block: CodeGenBlock,
      component: string,
      prop0: string,
      prop1: string,
      weight0: string,
      weight1: string,
    ) => {
      block.push(`
                /* emit position interpolate1 */
                ${component}.flags |= ${RigidBodyFlags.ANIMATED};
                ${component}.vx = ${weight0} * ${prop0}.x + ${weight1} * ${prop1}.x - ${component}.px;
                ${component}.vy = ${weight0} * ${prop0}.y + ${weight1} * ${prop1}.y - ${component}.py;
                ${component}.vz = ${weight0} * ${prop0}.z + ${weight1} * ${prop1}.z - ${component}.pz;`);
    };

    return base;
  }

  public physOrientation() {
    const base = this.propQuat<any, 'meshOrientation', any>('meshOrientation', [
      'x',
      'y',
      'z',
      'w',
    ]);
    base.emitInterpolate0 = (
      block: CodeGenBlock,
      component: string,
      prop: string,
    ) => {
      block.push(`
                /* emit orientation interpolate0 */
                ${component}.flags |= ${RigidBodyFlags.ANIMATED};
                ${component}.ax = 2 * (${component}.qw * ${prop}.x - ${component}.qx * ${prop}.w - ${component}.qy * ${prop}.z + ${component}.qz * ${prop}.y);
                ${component}.ay = 2 * (${component}.qw * ${prop}.y + ${component}.qx * ${prop}.z - ${component}.qy * ${prop}.w - ${component}.qz * ${prop}.x);
                ${component}.az = 2 * (${component}.qw * ${prop}.z - ${component}.qx * ${prop}.y + ${component}.qy * ${prop}.x - ${component}.qz * ${prop}.w);`);
    };
    base.emitInterpolate1 = (
      block: CodeGenBlock,
      component: string,
      prop0: string,
      prop1: string,
      weight0: string,
      weight1: string,
    ) => {
      const w = block.def();
      const x = block.def();
      const y = block.def();
      const z = block.def();
      const w0 = block.def();
      const x0 = block.def();
      const y0 = block.def();
      const z0 = block.def();
      const w1 = block.def();
      const x1 = block.def();
      const y1 = block.def();
      const z1 = block.def();
      const dot = block.def();
      const s = block.def();
      block.push(`
                /* emit orientation interpolate1 */
                ${component}.flags |= ${RigidBodyFlags.ANIMATED};

                ${x0} = ${prop0}.x;
                ${y0} = ${prop0}.y;
                ${z0} = ${prop0}.z;
                ${w0} = ${prop0}.w;
                ${x1} = ${prop1}.x;
                ${y1} = ${prop1}.y;
                ${z1} = ${prop1}.z;
                ${w1} = ${prop1}.w;
                ${dot} = ${w0} * ${w1} + ${x0} * ${x1} + ${y0} * ${y1} + ${z0} * ${z1};
                if (${dot} < 0) {
                    ${w} = -${weight0} * ${w0} + ${weight1} * ${w1};
                    ${x} = -${weight0} * ${x0} + ${weight1} * ${x1};
                    ${y} = -${weight0} * ${y0} + ${weight1} * ${y1};
                    ${z} = -${weight0} * ${z0} + ${weight1} * ${z1};
                } else {
                    ${w} = ${weight0} * ${w0} + ${weight1} * ${w1};
                    ${x} = ${weight0} * ${x0} + ${weight1} * ${x1};
                    ${y} = ${weight0} * ${y0} + ${weight1} * ${y1};
                    ${z} = ${weight0} * ${z0} + ${weight1} * ${z1};
                }
                ${s} = Math.pow(${w}, 2) + Math.pow(${x}, 2) + Math.pow(${y}, 2) + Math.pow(${z}, 2);
                if (${s} > 0.0001) {
                    ${s} = 1 / Math.sqrt(${s});
                    ${x} *= ${s};
                    ${y} *= ${s};
                    ${z} *= ${s};
                    ${w} *= ${s};

                    ${component}.ax = 2 * (${component}.qw * ${x} - ${component}.qx * ${w} - ${component}.qy * ${z} + ${component}.qz * ${y});
                    ${component}.ay = 2 * (${component}.qw * ${y} + ${component}.qx * ${z} - ${component}.qy * ${w} - ${component}.qz * ${x});
                    ${component}.az = 2 * (${component}.qw * ${z} - ${component}.qx * ${y} + ${component}.qy * ${x} - ${component}.qz * ${w});
                } else {
                  ${component}.ax = -2 * ${component}.qx;
                  ${component}.ay = -2 * ${component}.qy;
                  ${component}.az = -2 * ${component}.qz;
                }`);
    };

    return base;
  }

  public meshColor() {
    const schema = new MuUint32(0xffffffff);
    return {
      schema,
      emitParse: (
        block: CodeGenBlock,
        id: number,
        idEntries: string,
        dataEntries: string,
        keyframe: string,
      ) => {
        const r = block.def();
        const g = block.def();
        const b = block.def();
        const a = block.def();
        const propVal = block.def();
        block.push(`
                    if ('meshColor' in ${keyframe}) {
                        ${idEntries}.push(${id});
                        ${propVal} = ${keyframe}.meshColor;
                        if (Array.isArray(${propVal})) {
                            ${r} = (${safeReadNumExpr(
          safePropExpr(propVal, 0),
          0,
          1,
        )} * 255) >>> 0;
                            ${g} = (${safeReadNumExpr(
          safePropExpr(propVal, 1),
          0,
          1,
        )} * 255) >>> 0;
                            ${b} = (${safeReadNumExpr(
          safePropExpr(propVal, 2),
          0,
          1,
        )} * 255) >>> 0;
                            if (${propVal}.length >= 4) {
                                ${a} = (${safeReadNumExpr(
          safePropExpr(propVal, 3),
          0,
          1,
        )} * 255) >>> 0;
                            } else {
                                ${a} = 0xff;
                            }
                            ${dataEntries}.push((${r} | (${g} << 8) | (${b} << 16) | (${a} << 24)) >>> 0);
                        } else if (typeof ${propVal} === 'object') {
                            if ('r' in ${propVal}) {
                                ${r} = ${safeReadNumExpr(
          safePropExpr(propVal, 'r'),
          0,
          1,
        )};
                            } else if ('red' in ${propVal}) {
                                ${r} = ${safeReadNumExpr(
          safePropExpr(propVal, 'red'),
          0,
          1,
        )};
                            } else {
                                ${r} = 1;
                            }
                            if ('g' in ${propVal}) {
                                ${r} = ${safeReadNumExpr(
          safePropExpr(propVal, 'g'),
          0,
          1,
        )};
                            } else if ('green' in ${propVal}) {
                                ${r} = ${safeReadNumExpr(
          safePropExpr(propVal, 'green'),
          0,
          1,
        )};
                            } else {
                                ${r} = 1;
                            }
                            if ('b' in ${propVal}) {
                                ${r} = ${safeReadNumExpr(
          safePropExpr(propVal, 'b'),
          0,
          1,
        )};
                            } else if ('blue' in ${propVal}) {
                                ${r} = ${safeReadNumExpr(
          safePropExpr(propVal, 'blue'),
          0,
          1,
        )};
                            } else {
                                ${r} = 1;
                            }
                            if ('a' in ${propVal}) {
                                ${r} = ${safeReadNumExpr(
          safePropExpr(propVal, 'a'),
          0,
          1,
        )};
                            } else if ('alpha' in ${propVal}) {
                                ${r} = ${safeReadNumExpr(
          safePropExpr(propVal, 'alpha'),
          0,
          1,
        )};
                            } else {
                                ${r} = 1;
                            }
                            ${dataEntries}.push((
                                ((${r} * 0xff) << 0)  |
                                ((${g} * 0xff) << 8)  |
                                ((${b} * 0xff) << 16) |
                                ((${a} * 0xff) << 24)) >>> 0);
                        } else if (typeof ${propVal} === 'number') {
                            ${dataEntries}.push(${propVal} >>> 0);
                        } else {
                            ${dataEntries}.push(0);
                        }
                    }`);
      },
      emitSerialize: (block: CodeGenBlock, prop: string, keyframe: string) => {
        const ctor = block.inject(GameRGBAColor);
        block.push(`
                    ${keyframe}.meshColor = new ${ctor}(
                        (${prop} & 0xff)       / 0xff,
                        (${prop} & 0xff00)     / 0xff00,
                        (${prop} & 0xff0000)   / 0xff0000,
                        (${prop} & 0xff000000) / 0xff000000);`);
      },
      emitInterpolate0: (
        block: CodeGenBlock,
        component: string,
        prop: string,
      ) => {
        block.push(`
                    ${component}.red   =  ${prop}         & 0xff;
                    ${component}.green = (${prop} >>> 8)  & 0xff;
                    ${component}.blue  = (${prop} >>> 16) & 0xff;
                    ${component}.alpha = (${prop} >>> 24);`);
      },
      emitInterpolate1: (
        block: CodeGenBlock,
        component: string,
        prop0: string,
        prop1: string,
        weight0: string,
        weight1: string,
      ) => {
        block.push(`
                    ${component}.red   = (${weight0} * ( ${prop0}         & 0xff) + ${weight1} * ( ${prop1}         & 0xff)) >>> 0;
                    ${component}.green = (${weight0} * ((${prop0} >>> 8)  & 0xff) + ${weight1} * ((${prop1} >>> 8 ) & 0xff)) >>> 0;
                    ${component}.blue  = (${weight0} * ((${prop0} >>> 16) & 0xff) + ${weight1} * ((${prop1} >>> 16) & 0xff)) >>> 0;
                    ${component}.alpha = (${weight0} * ( ${prop0} >>> 24        ) + ${weight1} * ( ${prop1} >>> 24        )) >>> 0;`);
      },
      emitClear: (block: CodeGenBlock, component: string) => {
        block.push(`
                    ${component}.red =
                    ${component}.green =
                    ${component}.blue =
                    ${component}.alpha = 0xff;`);
      },
    };
  }

  public particleColor() {
    const schema = new MuStruct({
      color0: new MuUint32(0xffffffff),
      color1: new MuUint32(0xffffffff),
      color2: new MuUint32(0xffffffff),
      color3: new MuUint32(0xffffffff),
      color4: new MuUint32(0xffffffff),
    });

    return {
      schema,
      emitParse: (
        block: CodeGenBlock,
        id: number,
        idEntries: string,
        dataEntries: string,
        keyframe: string,
      ) => {
        const r = block.def();
        const g = block.def();
        const b = block.def();
        const intensity = block.def();
        const c = block.def();
        const schemaRef = block.inject(schema);
        const schemaVal = block.def();
        const to8Bit = block.inject(function unitTo8Bit(x: number) {
          return (255 * Math.max(0, Math.min(1, x))) >>> 0;
        });
        block.push(`
                if ('particleColor' in ${keyframe}) {
                    ${schemaVal} = ${schemaRef}.alloc();
                    ${idEntries}.push(${id});
                    ${dataEntries}.push(${schemaVal});`);
        for (let i = 0; i < 5; ++i) {
          block.push(`
                    ${r} = 1;
                    ${g} = 1;
                    ${b} = 1;
                    ${c} = ${keyframe}.particleColor;
                    if (Array.isArray(${c})) {
                        ${c} = ${c}[${i}];
                    }
                    if (typeof ${c} === 'number') {
                        ${r} = (${c} & 0xff) / 0xff;
                        ${g} = (${c} & 0xff00) / 0xff00;
                        ${b} = (${c} & 0xff0000) / 0xff0000;
                    } else if (Array.isArray(${c})) {
                        ${r} = ${safeReadNumExpr(safePropExpr(c, 0), 0, 65025)};
                        ${g} = ${safeReadNumExpr(safePropExpr(c, 1), 0, 65025)};
                        ${b} = ${safeReadNumExpr(safePropExpr(c, 2), 0, 65025)};
                    } else if (typeof ${c} === 'object') {
                        ${r} = ${safeReadNumExpr(
            safePropExpr(c, 'r'),
            0,
            65025,
          )};
                        ${g} = ${safeReadNumExpr(
            safePropExpr(c, 'g'),
            0,
            65025,
          )};
                        ${b} = ${safeReadNumExpr(
            safePropExpr(c, 'b'),
            0,
            65025,
          )};
                    }
                    ${intensity} = Math.max(1, Math.min(256, Math.ceil(Math.max(${r}, ${g}, ${b})))) || 1;
                    ${r} = ${to8Bit}(${r} / ${intensity});
                    ${g} = ${to8Bit}(${g} / ${intensity});
                    ${b} = ${to8Bit}(${b} / ${intensity});
                    ${schemaVal}.color${i} = (${r} | (${g} << 8) | (${b} << 16) | ((${intensity} - 1) << 24));`);
        }
        block.push(`
                }`);
      },
      emitSerialize: (block: CodeGenBlock, prop: string, keyframe: string) => {
        const colorProps = [
          block.def(),
          block.def(),
          block.def(),
          block.def(),
          block.def(),
        ];
        const colorScale = [
          block.def(),
          block.def(),
          block.def(),
          block.def(),
          block.def(),
        ];
        for (let i = 0; i < 5; ++i) {
          block.push(`
                    ${colorProps[i]} = ${prop}.color${i};
                    ${colorScale[i]} = (${colorProps[i]} >>> 24) + 1;`);
        }
        block.push(`
                    ${keyframe}.particleColor = [`);
        const colorCtor = block.inject(GameRGBColor);
        for (let i = 0; i < 5; ++i) {
          block.push(`
                        new ${colorCtor}(
                            ${colorScale[i]} * (${colorProps[i]} & 0xff) / 0xff,
                            ${colorScale[i]} * (${colorProps[i]} & 0xff00) / 0xff00,
                            ${colorScale[i]} * (${colorProps[i]} & 0xff0000) / 0xff0000),`);
        }
        block.push(`
                    ];`);
      },
      emitInterpolate0: (
        block: CodeGenBlock,
        component: string,
        prop: string,
      ) => {
        block.push(`
                    ${component}.color0 = ${prop}.color0;
                    ${component}.color1 = ${prop}.color1;
                    ${component}.color2 = ${prop}.color2;
                    ${component}.color3 = ${prop}.color3;
                    ${component}.color4 = ${prop}.color4;`);
      },
      emitInterpolate1: (
        block: CodeGenBlock,
        component: string,
        prop0: string,
        prop1: string,
        weight0: string,
        weight1: string,
      ) => {
        const p0 = block.def();
        const p1 = block.def();
        const bytes = [block.def(), block.def(), block.def(), block.def()];
        for (let i = 0; i < 5; ++i) {
          block.push(`
                        ${p0} = ${prop0}.color${i};
                        ${p1} = ${prop1}.color${i};`);
          for (let j = 0; j < 4; ++j) {
            block.push(`
                        ${
                          bytes[j]
                        } = (Math.min(0xff, Math.max(0, ${weight0} * ((${p0} >>> ${
              8 * j
            }) & 0xff) + ${weight1} * ((${p1} >>> ${8 * j}) & 0xff))) << ${
              8 * j
            }) >>> 0;`);
          }
          block.push(`
                        ${component}.color${i} = ${bytes[0]} | ${bytes[1]} | ${bytes[2]} | ${bytes[3]};`);
        }
      },
      emitClear: (block: CodeGenBlock, component: string) => {
        block.push(`
                    ${component}.color0 =
                    ${component}.color1 =
                    ${component}.color2 =
                    ${component}.color3 =
                    ${component}.color4 = 0xffffffff;`);
      },
    };
  }

  public particleSize() {
    const schema = new MuStruct({
      size0: new MuQuantizedFloat(1 / 64, 1),
      size1: new MuQuantizedFloat(1 / 64, 1),
      size2: new MuQuantizedFloat(1 / 64, 1),
      size3: new MuQuantizedFloat(1 / 64, 1),
      size4: new MuQuantizedFloat(1 / 64, 1),
    });
    return {
      schema,
      emitParse: (
        block: CodeGenBlock,
        id: number,
        idEntries: string,
        dataEntries: string,
        keyframe: string,
      ) => {
        const sizeVal = block.def();
        const schemaRef = block.inject(schema);
        const schemaVal = block.def();
        block.push(`
                    if ('particleSize' in ${keyframe}) {
                        ${sizeVal} = ${safePropExpr(keyframe, 'particleSize')};
                        if(Array.isArray(${sizeVal})) {
                            ${idEntries}.push(${id});
                            ${schemaVal} = ${schemaRef}.alloc();
                            ${schemaVal}.size0 = ${safeReadNumExpr(
          safePropExpr(sizeVal, 0),
          0,
          100,
        )};
                            ${schemaVal}.size1 = ${safeReadNumExpr(
          safePropExpr(sizeVal, 1),
          0,
          100,
        )};
                            ${schemaVal}.size2 = ${safeReadNumExpr(
          safePropExpr(sizeVal, 2),
          0,
          100,
        )};
                            ${schemaVal}.size3 = ${safeReadNumExpr(
          safePropExpr(sizeVal, 3),
          0,
          100,
        )};
                            ${schemaVal}.size4 = ${safeReadNumExpr(
          safePropExpr(sizeVal, 4),
          0,
          100,
        )};
                            ${dataEntries}.push(${schemaVal});
                        } else if (typeof ${sizeVal} === 'number') {
                            ${idEntries}.push(${id});
                            ${schemaVal} = ${schemaRef}.alloc();
                            ${schemaVal}.size0 = ${schemaVal}.size1 = ${schemaVal}.size2 = ${schemaVal}.size3 = ${schemaVal}.size4 = ${safeReadNumExpr(
          sizeVal,
          0,
          100,
        )};
                            ${dataEntries}.push(${schemaVal});
                        }
                    }`);
      },
      emitSerialize: (
        block: CodeGenBlock,
        component: string,
        keyframe: string,
      ) => {
        block.push(`
                    ${safePropExpr(keyframe, 'particleSize')} = [
                        ${component}.size0,
                        ${component}.size1,
                        ${component}.size2,
                        ${component}.size3,
                        ${component}.size4,
                    ];`);
      },
      emitInterpolate0: (
        block: CodeGenBlock,
        component: string,
        prop: string,
      ) => {
        block.push(`
                    ${component}.size0 = ${prop}.size0;
                    ${component}.size1 = ${prop}.size1;
                    ${component}.size2 = ${prop}.size2;
                    ${component}.size3 = ${prop}.size3;
                    ${component}.size4 = ${prop}.size4;`);
      },
      emitInterpolate1: (
        block: CodeGenBlock,
        component: string,
        prop0: string,
        prop1: string,
        weight0: string,
        weight1: string,
      ) => {
        block.push(`
                    ${component}.size0 = ${weight0} * ${prop0}.size0 + ${weight1} * ${prop1}.size0;
                    ${component}.size1 = ${weight0} * ${prop0}.size1 + ${weight1} * ${prop1}.size1;
                    ${component}.size2 = ${weight0} * ${prop0}.size2 + ${weight1} * ${prop1}.size2;
                    ${component}.size3 = ${weight0} * ${prop0}.size3 + ${weight1} * ${prop1}.size3;
                    ${component}.size4 = ${weight0} * ${prop0}.size4 + ${weight1} * ${prop1}.size4;`);
      },
      emitClear: (block: CodeGenBlock, component: string) => {
        block.push(`
                    ${component}.size0 = 1;
                    ${component}.size1 = 1;
                    ${component}.size2 = 1;
                    ${component}.size3 = 1;
                    ${component}.size4 = 1;`);
      },
    };
  }

  private _booleanBase<ScriptProp extends RestrictProps<KeyframeType, boolean>>(
    prop: ScriptProp,
    defaultValue: boolean,
  ) {
    return {
      schema: new MuBoolean(defaultValue),

      emitParse: (
        block: CodeGenBlock,
        id: number,
        idEntries: string,
        dataEntries: string,
        keyframe: string,
      ) => {
        block.push(`
                    if ('${prop}' in ${keyframe}) {
                        ${idEntries}.push(${id});
                        ${dataEntries}.push(${safeReadBoolExpr(
          safePropExpr(keyframe, prop),
        )});
                    }`);
      },

      emitSerialize: (
        block: CodeGenBlock,
        component: string,
        keyframe: string,
      ) => {
        block.push(`
                    ${safePropExpr(keyframe, prop)} = ${component};`);
      },
    };
  }

  public bit<
    ScriptProp extends RestrictProps<KeyframeType, boolean>,
    EngineProp extends RestrictProps<ComponentType, number>,
  >(
    scriptProp: ScriptProp,
    engineProp: EngineProp,
    flag: number,
  ): KeyframePropBinding<KeyframeType, ComponentType, MuBoolean> {
    const defaultValue = !!((<any>this.defaultValue[engineProp]) & flag);

    const emitInterpolate = (
      block: CodeGenBlock,
      component: string,
      prop: string,
    ) => {
      block.push(`
                if (${prop}) {
                    ${this._engineProp(component, engineProp)} |= ${flag};
                } else {
                    ${this._engineProp(component, engineProp)} &= ${~flag};
                }`);
    };

    return {
      ...this._booleanBase(scriptProp, defaultValue),

      emitInterpolate0: emitInterpolate,
      emitInterpolate1: emitInterpolate,

      emitClear: (block: CodeGenBlock, dst: string) => {
        if (defaultValue) {
          block.push(`
                    ${this._engineProp(dst, engineProp)} |= ${flag};`);
        } else {
          block.push(`
                    ${this._engineProp(dst, engineProp)} &= ${~flag};`);
        }
      },
    };
  }

  public bool<
    ScriptProp extends RestrictProps<KeyframeType, boolean>,
    EngineProp extends RestrictProps<ComponentType, boolean>,
  >(scriptProp: ScriptProp, engineProp: EngineProp) {
    const defaultValue = !!this.defaultValue[engineProp];

    const emitInterpolate = (
      block: CodeGenBlock,
      component: string,
      prop: string,
    ) => {
      block.push(`
                ${this._engineProp(component, engineProp)} = ${prop};`);
    };

    return {
      ...this._booleanBase(scriptProp, defaultValue),

      emitInterpolate0: emitInterpolate,
      emitInterpolate1: emitInterpolate,

      emitClear: (block: CodeGenBlock, dst: string) => {
        block.push(`
                    ${this._engineProp(dst, engineProp)} = ${defaultValue};`);
      },
    };
  }

  public mesh<
    ScriptProp extends RestrictProps<KeyframeType, string>,
    EngineProp extends RestrictProps<ComponentType, number>,
  >(
    scriptProp: ScriptProp,
    engineProp: EngineProp,
  ): KeyframePropBinding<KeyframeType, ComponentType, MuVarint> {
    const interpolate = (
      block: CodeGenBlock,
      component: string,
      prop: string,
    ) => {
      block.push(`
                ${this._engineProp(component, engineProp)} = ${prop};`);
    };
    return {
      schema: new MuVarint(),

      emitParse: (
        block: CodeGenBlock,
        id: number,
        idEntries: string,
        dataEntries: string,
        keyframe: string,
        parseAPI: string,
      ) => {
        const fieldProp = safePropExpr(keyframe, scriptProp);
        block.push(`
                    /* parse prop ${scriptProp} -> ${engineProp} */
                    if ('${scriptProp}' in ${keyframe}) {
                        ${idEntries}.push(${id});
                        ${dataEntries}.push(${parseAPI}.fileToMeshId(${safeReadStrExpr(
          fieldProp,
        )}));
                    }`);
      },

      emitSerialize: (
        block: CodeGenBlock,
        prop: string,
        keyframe: string,
        parseAPI: string,
      ) => {
        block.push(`
                    /* serialize prop ${engineProp} -> ${scriptProp} */
                    ${safePropExpr(
                      keyframe,
                      scriptProp,
                    )} = ${parseAPI}.meshIdToFile(${prop});`);
      },

      emitInterpolate0: interpolate,
      emitInterpolate1: interpolate,
      emitClear: (block: CodeGenBlock, dst: string) => {
        block.push(`
                    ${this._engineProp(dst, engineProp)} = 0;`);
      },
    };
  }

  public asset<
    ScriptProp extends RestrictProps<KeyframeType, string>,
    EngineProp extends RestrictProps<ComponentType, string>,
  >(scriptProp: ScriptProp, engineProp: EngineProp, type: GameAssetType) {
    const defaultValue: any = this.defaultValue[engineProp];
    return {
      schema: HashSchema,

      emitParse: (
        block: CodeGenBlock,
        id: number,
        idEntries: string,
        dataEntries: string,
        keyframe: string,
        parseAPI: string,
      ) => {
        block.push(`
                    /* emit parse ${scriptProp} -> ${engineProp} */
                    if ('${scriptProp}' in ${keyframe}) {
                        ${idEntries}.push(${id});
                        ${dataEntries}.push(${parseAPI}.pathToHash(${safeReadStrExpr(
          safePropExpr(keyframe, scriptProp),
        )}, '${type}'));
                    }`);
      },

      emitSerialize: (
        block: CodeGenBlock,
        prop: string,
        keyframe: string,
        parseAPI: string,
      ) => {
        block.push(`
                    /* emit parse ${scriptProp} -> ${engineProp} */
                    ${safePropExpr(
                      keyframe,
                      scriptProp,
                    )} = ${parseAPI}.hashToPath(${prop});`);
      },

      emitInterpolate0: (
        block: CodeGenBlock,
        component: string,
        prop: string,
      ) => {
        block.push(`
                    ${this._engineProp(component, engineProp)} = ${prop};`);
      },

      emitInterpolate1: (
        block: CodeGenBlock,
        component: string,
        prop0: string,
      ) => {
        block.push(`
                    ${this._engineProp(component, engineProp)} = ${prop0};`);
      },

      emitClear: (block: CodeGenBlock, dst: string) => {
        block.push(`
                    ${this._engineProp(dst, engineProp)} = '${defaultValue}';`);
      },
    };
  }

  public nestEngine<
    EngineProp extends RestrictProps<ComponentType, any>,
    ResultType extends [
      ...KeyframePropBinding<
        KeyframeType,
        ComponentType[EngineProp],
        MuSchema<unknown>
      >[],
    ],
  >(
    prop: EngineProp,
    gen: (
      factory: KeyframeComponentBindingFactory<
        KeyframeType,
        ComponentType[EngineProp],
        ComponentName
      >,
    ) => ResultType,
  ): {
    [index in keyof ResultType]: ResultType[index] extends KeyframePropBinding<
      KeyframeType,
      ComponentType[EngineProp],
      infer T
    >
      ? KeyframePropBinding<KeyframeType, ComponentType, T>
      : never;
  } {
    return <any>(
      gen(
        new KeyframeComponentBindingFactory<
          KeyframeType,
          ComponentType[EngineProp],
          ComponentName
        >(
          <any>(this.name + '.' + prop),
          this.defaultValue[prop],
          this.ctxt,
          this.enginePrefix + '.' + prop,
        ),
      )
    );
  }

  public bind<
    PropSchemaList extends [
      ...KeyframePropBinding<KeyframeType, ComponentType, MuSchema<unknown>>[],
    ],
  >(
    ...bindings: PropSchemaList
  ): KeyframeComponentBinding<
    KeyframeType,
    ComponentType,
    MuArrayUnion<UnwrapSchema<PropSchemaList>>,
    ComponentName
  > {
    const schemas: UnwrapSchema<PropSchemaList> = <any>(
      bindings.map((v) => v.schema)
    );
    const ComponentSchema = new MuArrayUnion(...schemas);
    return {
      name: this.name,
      schema: ComponentSchema,

      emitParse: (
        block: CodeGenBlock,
        data: string,
        keyframeSpec: string,
        parseAPI: string,
        targetId: string,
      ) => {
        block.push(`
                    /* Begin parse ${this.name} component */`);

        const idEntries = block.def();
        const dataEntries = block.def();
        block.push(`
                    ${idEntries} = ${data}.id;
                    ${dataEntries} = ${data}.data;`);

        bindings.forEach((binding, id) => {
          binding.emitParse(
            block,
            id,
            idEntries,
            dataEntries,
            keyframeSpec,
            parseAPI,
            targetId,
          );
        });

        block.push(`
                    /* End parse ${this.name} component */`);
      },

      emitSerialize: (
        block: CodeGenBlock,
        component: string,
        keyframe: string,
        parseAPI: string,
        targetId: string,
      ) => {
        block.push(`
                    /* Begin serialize ${this.name} component */`);
        const ptrRef = block.def();
        const idEntries = block.def();
        const dataEntries = block.def();
        block.push(`
                    ${ptrRef} = 0;
                    ${idEntries} = ${component}.id;
                    ${dataEntries} = ${component}.data;`);
        bindings.forEach((binding, id) => {
          const propRef = block.def();
          block.push(`
                    if (${ptrRef} < ${idEntries}.length && ${idEntries}[${ptrRef}] === ${id}) {
                        ${propRef} = ${dataEntries}[${ptrRef}++];`);
          binding.emitSerialize(block, propRef, keyframe, parseAPI, targetId);
          block.push(`
                    }`);
        });
        block.push(`
                    /* End serialize ${this.name} component */`);
      },

      emitInterpolate0: (
        block: CodeGenBlock,
        component: string,
        typeData: string,
        propData: string,
        frame0: string,
        frame1: string,
      ) => {
        const ptr = block.def();
        block.push(`
                        ${ptr} = ${frame0};`);
        bindings.forEach((binding, id) => {
          const prop = block.def();
          block.push(`
                        if(${ptr} < ${frame1} && ${typeData}[${ptr}] === ${id}) {
                            ${prop} = ${propData}[${ptr}++];`);
          binding.emitInterpolate0(block, component, prop);
          block.push(`
                        }`);
        });
      },

      emitInterpolate1: (
        block: CodeGenBlock,
        component: string,
        typeData: string,
        propData: string,
        prev0: string,
        prev1: string,
        next0: string,
        next1: string,
        weight0: string,
        weight1: string,
      ) => {
        const pptr = block.def();
        const nptr = block.def();
        block.push(`
                    ${pptr} = ${prev0};
                    ${nptr} = ${next0};`);
        bindings.forEach((binding, id) => {
          const pprop = block.def();
          const nprop = block.def();
          block.push(`
                    if (${pptr} < ${prev1} && ${typeData}[${pptr}] === ${id}) {
                        ${pprop} = ${propData}[${pptr}++];
                        if (${nptr} < ${next1} && ${typeData}[${nptr}] === ${id}) {
                            ${nprop} = ${propData}[${nptr}++];`);
          binding.emitInterpolate1(
            block,
            component,
            pprop,
            nprop,
            weight0,
            weight1,
          );
          block.push(`
                        } else {`);
          binding.emitInterpolate0(block, component, pprop);
          block.push(`
                        }
                    } else if (${nptr} < ${next1} && ${typeData}[${nptr}] === ${id}) {
                        ${nptr} += 1;
                    }`);
        });
      },

      emitClear: (
        block: CodeGenBlock,
        typeData: string,
        lo: string,
        hi: string,
        dst: string,
      ) => {
        const ptr = block.def();
        block.push(`
                        ${ptr} = ${lo};`);
        bindings.forEach((binding, id) => {
          block.push(`
                        if(${ptr} < ${hi} && ${typeData}[${ptr}] === ${id}) {`);
          binding.emitClear(block, dst);
          block.push(`
                        }`);
        });
      },
    };
  }
}

function compareTick<T extends { tick: number }>(a: T, b: T) {
  return a.tick - b.tick;
}

export interface KeyframeType {
  duration?: number;
  easeIn?: GameEasing;
  easeOut?: GameEasing;
}

export interface AnimationBinding<
  KT extends KeyframeType,
  AnimationSchema extends MuSchema<GenericAnimation>,
  AnimationIndexSchema extends MuSchema<GenericAnimationIndex>,
  Interpolators,
  Copiers,
  FlagSchema extends MuSchema<any>,
> {
  schema: AnimationSchema;
  setSchema: MuSortedArray<AnimationSchema>;
  syncSchema: MuStruct<{
    removes: MuSortedArray<MuVarint>;
    upserts: MuSortedArray<AnimationSchema>;
  }>;
  indexSchema: AnimationIndexSchema;
  flagSchema: FlagSchema;

  parse: (
    keyframes: Partial<KT>[],
    out: AnimationSchema['identity'],
    parseAPI: KeyframeScriptParserAPI,
  ) => void;
  serialize: (
    anim: AnimationSchema['identity'],
    parseAPI: KeyframeScriptParserAPI,
  ) => Partial<KT>[];
  tick: (
    animations: AnimationSchema['identity'][],
    tick: number,
    deltaTick: number,
    out: AnimationIndexSchema['identity'],
  ) => void;
  accumFlags: (
    animations: AnimationSchema['identity'],
    flags: FlagSchema['identity'],
    step: number,
  ) => void;
  interpolate: Interpolators;
  clear: Copiers;
}

export type GenericAnimationBinding = AnimationBinding<
  any,
  any,
  any,
  any,
  any,
  any
>;

export class AnimationBindingFactory<
  KeyframeType extends {
    duration?: number;
  },
> {
  public ctxt: CodeGenContext;

  constructor(public name: string) {
    this.ctxt = new CodeGenContext(name);
  }

  public component<ComponentType, ComponentName extends string>(
    name: ComponentName,
    defaultValue: ComponentType,
  ) {
    return new KeyframeComponentBindingFactory<
      KeyframeType,
      ComponentType,
      ComponentName
    >(name, defaultValue, this.ctxt, '');
  }

  public keyframe<
    ComponentSpec extends [
      ...KeyframeComponentBinding<
        KeyframeType,
        unknown,
        MuArrayUnion<[...MuSchema<unknown>[]]>,
        any
      >[],
    ],
  >(...components: ComponentSpec) {
    return components;
  }

  public create<
    Singleton extends boolean,
    PropSpec extends {
      [id: string]: MuSchema<any>;
    },
    KeyframePropSpec extends {
      [id: string]: MuSchema<any>;
    },
    ComponentSpec extends [
      ...KeyframeComponentBinding<
        KeyframeType,
        unknown,
        MuArrayUnion<[...MuSchema<unknown>[]]>,
        any
      >[],
    ],
  >(spec: {
    singleton: Singleton;
    props: PropSpec;
    keyframe: {
      components: ComponentSpec;
      props: KeyframePropSpec;
    };
  }) {
    const KeyframeComponentSchemas = new MuArrayUnion<
      UnwrapSchema<ComponentSpec>
    >(...(<any>spec.keyframe.components.map((v) => v.schema)));
    const KeyframeSchema = new MuStruct({
      tick: new MuQuantizedFloat(1 / 64, 0),
      easeIn: <MuSchema<KeyframeEaseMode>>new MuUint8(KeyframeEaseMode.NONE),
      easeOut: <MuSchema<KeyframeEaseMode>>new MuUint8(KeyframeEaseMode.NONE),
      components: KeyframeComponentSchemas,
      ...spec.props,
    });
    const AnimationSchema = new MuStruct({
      id: new MuVarint(),
      targetId: new MuVarint(),

      startTick: new MuQuantizedFloat(1 / 16, 0),
      endTicks: new MuQuantizedFloat(1 / 16, 0),
      cycleTicks: new MuQuantizedFloat(1 / 16, 16),
      cyclePhase: new MuQuantizedFloat(1 / 256, 0),
      cycleCount: new MuQuantizedFloat(1 / 1024, 1),
      playbackMode: <MuSchema<AnimationPlaybackMode>>(
        new MuUint8(AnimationPlaybackMode.FORWARD)
      ),

      keyframes: new MuSortedArray(KeyframeSchema, Infinity, compareTick),
      ...spec.props,
    });
    const AnimationSetSchema = new MuSortedArray(
      AnimationSchema,
      Infinity,
      compareId,
    );
    const AnimationSyncSchema = new MuStruct({
      removes: new MuSortedArray(new MuVarint(), Infinity, (a, b) => a - b),
      upserts: AnimationSetSchema,
    });

    // construct index schema
    const ComponentSchemas: UnwrapComponentIndex<ComponentSpec> = <any>{};
    spec.keyframe.components.forEach((c) => {
      ComponentSchemas[c.name] = new MuStruct({
        // id for each animation on this component (index into tracker array)
        id: new MuArray(new MuVarint(), Infinity),

        // start of frame data for animation
        frameOffset: new MuArray(new MuVarint(), Infinity),

        // start offset for each keyframe's type and prop animation data
        dataOffset: new MuArray(new MuVarint(), Infinity),

        // type and prop data respectively for each keyframe
        typeData: new MuArray(new MuVarint(), Infinity),
        animData: new MuArray(new MuRefSchema<any>(), Infinity),
      });
    });
    const AnimationIndexSchema = new MuStruct({
      dirty: new MuBoolean(true),
      tracker: KeyframeTrackIndexSchema,
      components: new MuStruct(ComponentSchemas),
    });

    //create flag schema
    const flagTypes: { [id: string]: MuVarint } = {};
    spec.keyframe.components.forEach(({ name }) => {
      flagTypes[name] = new MuVarint(0);
    });
    const FlagSchema: MuStruct<UnwrapFlagSchema<ComponentSpec>> = <any>(
      new MuStruct(flagTypes)
    );

    const ctxt = this.ctxt;

    // generate parse func
    {
      const parseFunc = this.ctxt.func('parse');
      const scriptFrame = parseFunc.arg();
      const engineFrame = parseFunc.arg();
      const baseTick = parseFunc.arg();
      const parseAPI = parseFunc.arg();
      const durationDefault = parseFunc.arg();
      const targetId = parseFunc.arg();

      const entry = parseFunc.block();
      const ids = parseFunc.def();
      const data = parseFunc.def();

      entry.push(`
                ${engineFrame}.tick = ${baseTick} + ('duration' in ${scriptFrame} ? Math.max(+${scriptFrame}.duration || 0, 0) : ${durationDefault});
                ${ids} = ${engineFrame}.components.id;
                ${data} = ${engineFrame}.components.data;`);

      const easeTable = entry.inject(EASE_MAPPING);
      ['easeIn', 'easeOut'].forEach((easing) => {
        const keyTok = entry.def();
        entry.push(`
                if ('${easing}' in ${scriptFrame}) {
                    ${keyTok} = (${scriptFrame}.${easing} + '').toLowerCase();
                    if (${keyTok} in ${easeTable}) {
                        ${engineFrame}.${easing} = ${easeTable}[${keyTok}];
                    } else {
                        ${engineFrame}.${easing} = ${KeyframeEaseMode.NONE};
                    }
                } else {
                    ${engineFrame}.${easing} = ${KeyframeEaseMode.NONE};
                }`);
      });

      spec.keyframe.components.forEach((component, id) => {
        const componentSchema = component.schema;
        const schemaRef = ctxt.inject(componentSchema);

        const block = parseFunc.block();
        const componentData = block.def();
        block.push(`
                    ${componentData} = ${schemaRef}.alloc();
                    ${componentData}.id.length = ${componentData}.data.length = 0;`);
        component.emitParse(
          block,
          componentData,
          scriptFrame,
          parseAPI,
          targetId,
        );
        block.push(`
                    if (${componentData}.id.length === 0) {
                        ${schemaRef}.free(${componentData});
                    } else {
                        ${ids}.push(${id});
                        ${data}.push(${componentData});
                    }`);
      });
    }

    // generate serialize func
    {
      const serializeFunc = this.ctxt.func('serialize');
      const engineFrame = serializeFunc.arg();
      const curTick = serializeFunc.arg();
      const parseAPI = serializeFunc.arg();
      const targetId = serializeFunc.arg();

      const scriptFrame = serializeFunc.def();
      const ptrRef = serializeFunc.def();
      const idRef = serializeFunc.def();
      const dataRef = serializeFunc.def();

      const entry = serializeFunc.block();

      const invTable = entry.inject(INV_EASE_MAPPING);
      entry.push(`
                ${scriptFrame} = {
                    duration: ${engineFrame}.tick - ${curTick},
                    easeIn: ${invTable}[${engineFrame}.easeIn],
                    easeOut: ${invTable}[${engineFrame}.easeOut],
                };
                ${ptrRef} = 0;
                ${idRef} = ${engineFrame}.components.id;
                ${dataRef} = ${engineFrame}.components.data;`);

      spec.keyframe.components.forEach((component, id) => {
        const block = serializeFunc.block();
        const dataEntry = block.def();
        block.push(`
                    if (${ptrRef} < ${idRef}.length && ${idRef}[${ptrRef}] === ${id}) {
                        ${dataEntry} = ${dataRef}[${ptrRef}++];`);
        component.emitSerialize(
          block,
          dataEntry,
          scriptFrame,
          parseAPI,
          targetId,
        );
        block.push(`
                    }`);
      });

      const exit = serializeFunc.block();
      exit.push(`
                return ${scriptFrame};`);
    }

    // test flags func
    {
      const func = ctxt.func('testFlags');
      const frame = func.arg();
      const flags = func.arg();

      const ptrRef = func.def();
      const idRef = func.def();
      const entry = func.block();

      entry.push(`
                ${ptrRef} = 0;
                ${idRef} = ${frame}.components.id;`);

      spec.keyframe.components.forEach((component, id) => {
        const block = func.block();
        block.push(`
                if (${ptrRef} < ${idRef}.length && ${idRef}[${ptrRef}] === ${id}) {
                    ${ptrRef}++;
                    ${flags}.${component.name} = 1;
                }`);
      });
    }

    // add flags func
    {
      const func = ctxt.func('accumFlags');
      const dst = func.arg();
      const src = func.arg();
      const step = func.arg();

      const block = func.block();

      spec.keyframe.components.forEach((component) => {
        block.push(`
                if (${src}.${component.name}) {
                    ${dst}.${component.name} += ${step};
                }`);
      });
    }

    // generate index func
    {
      const indexFunc = this.ctxt.func('appendIndex');
      const id = indexFunc.arg();
      const keyframes = indexFunc.arg();
      const componentTables = indexFunc.arg();

      // Set up blocks
      const preBlock = indexFunc.block();
      const frameLoopStart = indexFunc.block();
      const bodyBlock = indexFunc.block();
      const frameLoopEnd = indexFunc.block();
      const postBlock = indexFunc.block();

      // set up keyframe loop
      const keyframeLoopIndex = indexFunc.def();
      const curKeyframe = indexFunc.def();
      const curIds = indexFunc.def();
      const curData = indexFunc.def();
      const idPtr = indexFunc.def();
      frameLoopStart.push(`
                for(${keyframeLoopIndex} = 0; ${keyframeLoopIndex} < ${keyframes}.length; ++${keyframeLoopIndex}) {
                    ${curKeyframe} = ${keyframes}[${keyframeLoopIndex}].components;
                    ${curIds} = ${curKeyframe}.id;
                    ${curData} = ${curKeyframe}.data;
                    ${idPtr} = 0;`);
      frameLoopEnd.push(`
                }`);

      // emit keyframe data
      spec.keyframe.components.forEach((c, componentId) => {
        const table = indexFunc.def();
        const idIndex = indexFunc.def();
        const frameOffset = indexFunc.def();
        const dataOffset = indexFunc.def();
        const typeData = indexFunc.def();
        const animData = indexFunc.def();
        const dataStart = indexFunc.def();
        const frameStart = indexFunc.def();

        preBlock.push(`
                ${table} = ${componentTables}.${c.name};
                ${idIndex} = ${table}.id;
                ${frameOffset} = ${table}.frameOffset;
                ${dataOffset} = ${table}.dataOffset;
                ${typeData} = ${table}.typeData;
                ${animData} = ${table}.animData;
                ${dataStart} = ${typeData}.length;
                ${frameStart} = ${dataOffset}.length`);

        // append info
        const appendIndex = indexFunc.def();
        const keyframeTypes = indexFunc.def();
        const keyframeData = indexFunc.def();
        bodyBlock.push(`
                    ${dataOffset}.push(${typeData}.length);
                    if (${curIds}[${idPtr}] === ${componentId}) {
                        ${keyframeTypes} = ${curData}[${idPtr}].id;
                        for (${appendIndex} = 0; ${appendIndex} < ${keyframeTypes}.length; ++${appendIndex}) {
                            ${typeData}.push(${keyframeTypes}[${appendIndex}]);
                        }
                        ${keyframeData} = ${curData}[${idPtr}].data;
                        for (${appendIndex} = 0; ${appendIndex} < ${keyframeData}.length; ++${appendIndex}) {
                            ${animData}.push(${keyframeData}[${appendIndex}]);
                        }
                        ${idPtr} += 1;
                    }`);

        postBlock.push(`
                if (${typeData}.length <= ${dataStart}) {
                    ${dataOffset}.length = ${frameStart};
                } else {
                    ${idIndex}.push(${id});
                    ${frameOffset}.push(${frameStart});
                }`);
      });
    }

    {
      // append sentinel indices to tables
      const indexFunc = this.ctxt.func('appendSentinels');
      const componentTable = indexFunc.arg();
      const body = indexFunc.block();
      spec.keyframe.components.forEach((c) => {
        const table = indexFunc.def();
        body.push(`
                    /* ${c.name} */
                    ${table} = ${componentTable}.${c.name};
                    ${table}.frameOffset.push(${table}.dataOffset.length);
                    ${table}.dataOffset.push(${table}.typeData.length);
                    `);
      });
    }

    // Interpolators
    spec.keyframe.components.forEach((c) => {
      const func = this.ctxt.func('interpolate_' + c.name);
      const index = func.arg();
      const components = func.arg();

      const indexEq = this.ctxt.inject(indexEqRange);

      const block = func.block();
      block.push(`
                var tracker = ${index}.tracker;
                var targetId = tracker.targetId;
                var prevFrames = tracker.prevFrame;
                var nextFrames = tracker.nextFrame;
                var prevWeight = tracker.prevWeight;
                var nextWeight = tracker.nextWeight;

                var keyframe = ${index}.components.${c.name};
                var ids = keyframe.id;
                var frameOffset = keyframe.frameOffset;
                var dataOffset = keyframe.dataOffset;
                var typeData = keyframe.typeData;
                var animData = keyframe.animData;`);

      if (spec.singleton) {
        block.push(`
                var component = ${components};`);
      } else {
        block.push(`
                var N = ${components}.length - 1;
                var ptr = 0;`);
      }

      block.push(`
                for (var i = 0; i < ids.length; ++i) {
                    var id = ids[i];

                    /* check if animation active */
                    var prevFrame = prevFrames[id];
                    if (prevFrame < 0) {
                        continue;
                    }

                    var frameStart = frameOffset[i];

                    /* read range for prev frame */
                    var prevFrame0 = dataOffset[frameStart + prevFrame];
                    var prevFrame1 = dataOffset[frameStart + prevFrame + 1];
                    if (prevFrame1 <= prevFrame0) {
                        continue;
                    }`);

      if (!spec.singleton) {
        block.push(`
                    /* find component */
                    var componentIndex = ${indexEq}(${components}, targetId[id], ptr, N);
                    if (componentIndex < 0) {
                        continue;
                    }
                    ptr = componentIndex;
                    var component = ${components}[componentIndex];`);
      }

      block.push(`
                    /* read range for next frame */
                    var nextFrame = nextFrames[id];
                    var nextFrame0 = nextFrame >= 0 ? dataOffset[frameStart + nextFrame] : 0;
                    var nextFrame1 = nextFrame >= 0 ? dataOffset[frameStart + nextFrame + 1] : 0;

                    if (nextFrame1 <= nextFrame0) {
                        /* clamp */`);

      // clamp block
      c.emitInterpolate0(
        block,
        'component',
        'typeData',
        'animData',
        'prevFrame0',
        'prevFrame1',
      );

      block.push(`
                    } else {
                        /* interpolate */
                        var weight0 = prevWeight[id];
                        var weight1 = nextWeight[id]`);
      // interpolate block
      c.emitInterpolate1(
        block,
        'component',
        'typeData',
        'animData',
        'prevFrame0',
        'prevFrame1',
        'nextFrame0',
        'nextFrame1',
        'weight0',
        'weight1',
      );
      block.push(`
                    }
                }`);
    });

    // copiers
    spec.keyframe.components.forEach((c) => {
      const func = this.ctxt.func('clear_' + c.name);

      const index = func.arg();
      const dstComponents = func.arg();
      const indexEq = this.ctxt.inject(indexEqRange);

      const block = func.block();
      block.push(`
                var tracker = ${index}.tracker;
                var targetId = tracker.targetId;
                var prevFrames = tracker.prevFrame;

                var keyframe = ${index}.components.${c.name};
                var ids = keyframe.id;
                var frameOffset = keyframe.frameOffset;
                var dataOffset = keyframe.dataOffset;
                var typeData = keyframe.typeData;

                var dstHi = ${dstComponents}.length - 1;
                var dstLo = 0;

                for (var i = 0; i < ids.length; ++i) {
                    var id = ids[i];

                    /* check if animation active */
                    var prevFrame = prevFrames[id];
                    if (prevFrame < 0) {
                        continue;
                    }

                    var frameStart = frameOffset[i];

                    /* read range for prev frame */
                    var prevFrame0 = dataOffset[frameStart + prevFrame];
                    var prevFrame1 = dataOffset[frameStart + prevFrame + 1];
                    if (prevFrame1 <= prevFrame0) {
                        continue;
                    }`);
      if (spec.singleton) {
        c.emitClear(
          block,
          'typeData',
          'prevFrame0',
          'prevFrame1',
          dstComponents,
        );
      } else {
        block.push(`
                    /* find dst component */
                    var dstIndex = ${indexEq}(${dstComponents}, targetId[id], dstLo, dstHi);
                    if (dstIndex < 0) {
                        continue;
                    }
                    dstLo = dstIndex;
                    var dstComponent = ${dstComponents}[dstIndex];`);
        c.emitClear(
          block,
          'typeData',
          'prevFrame0',
          'prevFrame1',
          'dstComponent',
        );
      }
      block.push(`
                }`);
    });

    const procs = ctxt.compile();

    // copy out special methods
    const Interpolators: UnwrapInterpolators<
      Singleton,
      typeof AnimationIndexSchema.identity,
      ComponentSpec
    > = <any>{};
    const Resettors: UnwrapResettor<
      Singleton,
      typeof AnimationIndexSchema.identity,
      ComponentSpec
    > = <any>{};
    spec.keyframe.components.forEach((c) => {
      Interpolators[c.name] = procs['interpolate_' + c.name];
      Resettors[c.name] = procs['clear_' + c.name];
    });

    const tmpFlags = FlagSchema.alloc();

    return <
      AnimationBinding<
        KeyframeType,
        typeof AnimationSchema,
        typeof AnimationIndexSchema,
        typeof Interpolators,
        typeof Resettors,
        typeof FlagSchema
      >
    >{
      schema: AnimationSchema,
      setSchema: AnimationSetSchema,
      syncSchema: AnimationSyncSchema,
      indexSchema: AnimationIndexSchema,
      flagSchema: FlagSchema,

      parse: (
        keyframeSpec: Partial<KeyframeType>[],
        out: typeof AnimationSchema.identity,
        parseAPI: KeyframeScriptParserAPI,
      ) => {
        if (!Array.isArray(keyframeSpec)) {
          throw new Error('Missing or invalid keyframes');
        }
        const keyframes = out.keyframes;
        while (keyframes.length > keyframeSpec.length) {
          KeyframeSchema.free(<any>keyframes.pop());
        }
        while (keyframes.length < keyframeSpec.length) {
          keyframes.push(KeyframeSchema.alloc());
        }
        let curTick = 0;
        for (let i = 0; i < keyframeSpec.length; ++i) {
          const inFrame = keyframeSpec[i];
          if (typeof inFrame !== 'object' || inFrame === null) {
            throw new Error(`Keyframe ${i} is invalid`);
          }
          const outFrame = keyframes[i];
          KeyframeSchema.assign(outFrame, KeyframeSchema.identity);

          // if animation is are not wrapping, then last frame should have a default duration of 0 to prevent awkward pause
          let step = 1;
          if (
            (out.playbackMode === AnimationPlaybackMode.FORWARD ||
              out.playbackMode === AnimationPlaybackMode.REVERSE ||
              out.playbackMode === AnimationPlaybackMode.MIRROR ||
              out.playbackMode === AnimationPlaybackMode.MIRROR_REVERSE) &&
            i === keyframeSpec.length - 1
          ) {
            step = 0;
          }

          procs.parse(inFrame, outFrame, curTick, parseAPI, step, out.targetId);
          curTick = outFrame.tick;
        }
      },

      serialize: (
        anim: typeof AnimationSchema.identity,
        parseAPI: KeyframeScriptParserAPI,
      ) => {
        const result: Partial<KeyframeType>[] = new Array(
          anim.keyframes.length,
        );
        let curTick = 0;
        for (let i = 0; i < anim.keyframes.length; ++i) {
          const frame = anim.keyframes[i];
          result[i] = procs.serialize(frame, curTick, parseAPI, anim.targetId);
          curTick = frame.tick;
        }
        return result;
      },

      tick: (
        animations: typeof AnimationSchema.identity[],
        tick: number,
        deltaTick: number,
        index: typeof AnimationIndexSchema.identity,
      ) => {
        // check if we need to rebuild index
        if (index.dirty) {
          // clear index
          AnimationIndexSchema.assign(index, AnimationIndexSchema.identity);

          // sort by target id
          animations.sort(compareTargetId);

          // rebuild tick index
          rebuildKeyframeTrackIndex(animations, index.tracker);

          // rebuild component indexes
          for (let i = 0; i < animations.length; ++i) {
            const anim = animations[i];
            procs.appendIndex(i, anim.keyframes, index.components);
          }
          procs.appendSentinels(index.components);

          // clear dirty flag
          index.dirty = false;

          // restore animation table to sorted order
          animations.sort(compareId);

          // update tracker tick
          updateKeyframeTrackIndex(index.tracker, tick, deltaTick);
        } else {
          // if tick changed, then set tick
          updateKeyframeTrackIndex(index.tracker, tick, deltaTick);
        }
      },

      accumFlags: (
        anim: typeof AnimationSchema.identity,
        flags: typeof FlagSchema.identity,
        step: number,
      ) => {
        FlagSchema.assign(tmpFlags, FlagSchema.identity);
        const frames = anim.keyframes;
        for (let i = 0; i < frames.length; ++i) {
          procs.testFlags(frames[i], tmpFlags);
        }
        procs.accumFlags(flags, tmpFlags, step);
      },

      interpolate: Interpolators,
      clear: Resettors,
    };
  }
}

export function animEndTick<Animation extends GenericAnimation>(
  animation: Animation,
) {
  if (animation.cycleCount > 0) {
    return (
      animation.startTick +
      Math.max(
        animation.cycleTicks * (animation.cycleCount - animation.cyclePhase),
        0,
      ) +
      animation.endTicks +
      1
    );
  } else {
    return Infinity;
  }
}

export function applySyncPacket<Binding extends GenericAnimationBinding>(
  binding: Binding,
  animations: Binding['setSchema']['identity'],
  packet: Binding['syncSchema']['identity'],
) {
  // early out: no animation updates
  if (packet.removes.length === 0 && packet.upserts.length === 0) {
    return false;
  }
  // apply any deletes
  if (packet.removes.length > 0) {
    sortedArrayDelete(binding.schema, animations, packet.removes);
  }
  // if no upserts, early out
  if (packet.upserts.length === 0) {
    return true;
  }
  // special case: animations empty, so avoid init to prevent edge cases
  if (animations.length <= 0) {
    animations.push.apply(animations, packet.upserts);
    packet.upserts.length = 0;
    return true;
  }
  // generic case, need to merge animations into array
  let needsSort = false;
  const hi = animations.length - 1;
  let lo = 0;
  let ptr = 0;
  for (let i = 0; i < packet.upserts.length; ++i) {
    const anim = packet.upserts[i];
    const id = anim.id;
    // search for any existing animation in set
    const index = indexEqRange(animations, id, lo, hi);
    if (index < 0) {
      // (insert) push animation to end of array
      needsSort = needsSort || anim.id < animations[hi].id;
      animations.push(anim);
    } else {
      // (update) swap with upserted animation
      lo = index;
      packet.upserts[ptr++] = animations[index];
      animations[index] = anim;
    }
  }
  packet.upserts.length = ptr;
  // if needed resort animation array
  if (needsSort) {
    animations.sort(compareId);
  }
  return true;
}
