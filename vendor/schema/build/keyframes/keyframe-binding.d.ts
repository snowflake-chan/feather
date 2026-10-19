import { GameAssetType, GameEasing, GameEntity } from '../api/js/api';
import { GameRGBColor, GameRGBAColor, GameVector3, GameQuaternion } from '../api/js/math';
import { MuArray } from '@box/mudb/schema/array';
import { MuBoolean } from '@box/mudb/schema/boolean';
import { MuQuantizedFloat } from '@box/mudb/schema/quantized-float';
import { MuSchema } from '@box/mudb/schema/schema';
import { MuSortedArray } from '@box/mudb/schema/sorted-array';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUint32 } from '@box/mudb/schema/uint32';
import { MuVarint } from '@box/mudb/schema/varint';
import { MuRefSchema } from '../utils/ref-schema';
import { CodeGenBlock, CodeGenContext } from './codegen';
import { MuArrayUnion } from './mu-array-union';
import { RestrictProps, RestrictObj } from '@box/utils/script';
import { KeyframeTrackIndex } from './track-index';
import { AnimationPlaybackMode, GenericAnimation, KeyframeEaseMode } from './type';
export declare const MAX_ANIMATIONS: number;
export declare const EASE_MAPPING: {
    [scriptName: string]: KeyframeEaseMode;
};
export declare const INV_EASE_MAPPING: {
    [val: number]: string;
};
export interface KeyframeScriptParserAPI {
    pathToHash: (path: string, type: GameAssetType) => string;
    hashToPath: (hash: string) => string;
    fileToMeshId: (file: string) => number;
    meshIdToFile: (meshId: number) => string;
    entityToId: (entity: GameEntity) => number;
    idToEntity: (id: number) => GameEntity | null;
    positionToRigidBodyPosition: (targetId: number, x: number, y: number, z: number) => {
        x: number;
        y: number;
        z: number;
    };
    rigidBodyPositionToPosition: (targetId: number, x: number, y: number, z: number) => {
        x: number;
        y: number;
        z: number;
    };
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
export interface KeyframePropBinding<KeyframeType, ComponentType, PropSchemea extends MuSchema<any>> {
    schema: PropSchemea;
    emitParse: (block: CodeGenBlock, id: number, idEntries: string, dataEntries: string, keyframe: string, parseAPI: string, targetId: string) => void;
    emitSerialize: (block: CodeGenBlock, data: string, keyframe: string, parseAPI: string, targetId: string) => void;
    emitInterpolate0: (block: CodeGenBlock, component: string, prop: string) => void;
    emitInterpolate1: (block: CodeGenBlock, component: string, prop0: string, prop1: string, weight0: string, weight1: string) => void;
    emitClear: (block: CodeGenBlock, dst: string) => void;
}
export interface KeyframeComponentBinding<KeyframeType, ComponentType, ComponentSchema extends MuArrayUnion<[...MuSchema<unknown>[]]>, ComponentName extends string> {
    name: ComponentName;
    schema: ComponentSchema;
    emitParse: (block: CodeGenBlock, data: string, keyframe: string, parseAPI: string, targetId: string) => void;
    emitSerialize: (block: CodeGenBlock, data: string, keyframe: string, parseAPI: string, targetId: string) => void;
    emitInterpolate0: (block: CodeGenBlock, component: string, typeData: string, propData: string, frame0: string, frame1: string) => void;
    emitInterpolate1: (block: CodeGenBlock, component: string, typeData: string, propData: string, prev0: string, prev1: string, next0: string, next1: string, weight0: string, weight1: string) => void;
    emitClear: (block: CodeGenBlock, typeData: string, lo: string, hi: string, dst: string) => void;
}
type UnwrapSchema<List extends [...unknown[]]> = List extends [
    {
        schema: infer Schema;
    },
    ...infer Tail
] ? [Schema, ...UnwrapSchema<Tail>] : [];
type UnwrapComponentIndex<List extends [...unknown[]]> = List extends [
    {
        name: infer ComponentName;
    },
    ...infer Tail
] ? ComponentName extends string ? {
    [name in ComponentName]: MuStruct<{
        id: MuArray<MuVarint>;
        frameOffset: MuArray<MuVarint>;
        dataOffset: MuArray<MuVarint>;
        typeData: MuArray<MuVarint>;
        animData: MuArray<MuRefSchema<any>>;
    }>;
} & UnwrapComponentIndex<Tail> : {} : {};
type UnwrapInterpolatorsArray<IndexType, List extends [...unknown[]]> = List extends [
    KeyframeComponentBinding<any, infer ComponentType, any, infer ComponentName>,
    ...infer Tail
] ? ComponentName extends string ? {
    [name in ComponentName]: (index: IndexType, components: ComponentType[]) => void;
} & UnwrapInterpolatorsArray<IndexType, Tail> : {} : {};
type UnwrapInterpolatorsSingleton<IndexType, List extends [...unknown[]]> = List extends [
    KeyframeComponentBinding<any, infer ComponentType, any, infer ComponentName>,
    ...infer Tail
] ? ComponentName extends string ? {
    [name in ComponentName]: (index: IndexType, components: ComponentType) => void;
} & UnwrapInterpolatorsSingleton<IndexType, Tail> : {} : {};
type UnwrapInterpolators<Singleton extends boolean, IndexType, List extends [...unknown[]]> = Singleton extends true ? UnwrapInterpolatorsSingleton<IndexType, List> : UnwrapInterpolatorsArray<IndexType, List>;
type UnwrapResettorArray<IndexType, List extends [...unknown[]]> = List extends [
    KeyframeComponentBinding<any, infer ComponentType, any, infer ComponentName>,
    ...infer Tail
] ? ComponentName extends string ? {
    [name in ComponentName]: (index: IndexType, dst: ComponentType[]) => void;
} & UnwrapResettorArray<IndexType, Tail> : {} : {};
type UnwrapResettorSingleton<IndexType, List extends [...unknown[]]> = List extends [
    KeyframeComponentBinding<any, infer ComponentType, any, infer ComponentName>,
    ...infer Tail
] ? ComponentName extends string ? {
    [name in ComponentName]: (index: IndexType, dst: ComponentType) => void;
} & UnwrapResettorSingleton<IndexType, Tail> : {} : {};
type UnwrapResettor<Singleton extends boolean, IndexType, List extends [...unknown[]]> = Singleton extends true ? UnwrapResettorSingleton<IndexType, List> : UnwrapResettorArray<IndexType, List>;
type VectorStructSchema<List extends [...unknown[]]> = List extends [
    string,
    ...infer Tail
] ? {
    [id in List[0]]: MuQuantizedFloat;
} & VectorStructSchema<Tail> : {};
type UnwrapFlagSchema<List extends [...unknown[]]> = List extends [
    KeyframeComponentBinding<any, any, any, infer ComponentName>,
    ...infer Tail
] ? {
    [name in ComponentName]: MuVarint;
} & UnwrapFlagSchema<Tail> : {};
export declare class KeyframeComponentBindingFactory<KeyframeType, ComponentType, ComponentName extends string> {
    readonly name: ComponentName;
    readonly defaultValue: ComponentType;
    ctxt: CodeGenContext;
    enginePrefix: string;
    constructor(name: ComponentName, defaultValue: ComponentType, ctxt: CodeGenContext, enginePrefix: string);
    private _engineProp;
    private _commonVectorBinding;
    bindVecToProps<ScriptVec, ScriptVecObj extends RestrictObj<KeyframeType, ScriptVec>, ScriptProp extends RestrictProps<ScriptVecObj, any>, ScriptFields extends [...(keyof ScriptVec)[]], EngineProps extends [...RestrictProps<ComponentType, number>[]]>(ctor: new (...fields: number[]) => ScriptVec, scriptProp: ScriptProp, scriptFields: ScriptFields, engineProps: EngineProps, precision: number, minVal: number, maxVal: number): KeyframePropBinding<KeyframeType, ComponentType, MuStruct<VectorStructSchema<EngineProps>>>;
    bindVecToVec<ScriptVec, ScriptVecObj extends RestrictObj<KeyframeType, ScriptVec>, ScriptProp extends RestrictProps<ScriptVecObj, any>, ScriptFields extends [...RestrictProps<ScriptVec, any>[]], EngineObj extends RestrictObj<ComponentType, Float32Array>, EngineProp extends RestrictProps<EngineObj, any>>(ctor: new (...fields: number[]) => ScriptVec, scriptProp: ScriptProp, scriptFields: ScriptFields, engineProp: EngineProp, precision: number, minVal: number, maxVal: number): KeyframePropBinding<KeyframeType, ComponentType, MuStruct<VectorStructSchema<ScriptFields>>>;
    vec3<ScriptVecObj extends RestrictObj<KeyframeType, GameVector3>, ScriptProp extends RestrictProps<ScriptVecObj, any>, EngineObj extends RestrictObj<ComponentType, Float32Array>, EngineProp extends RestrictProps<EngineObj, any>>(scriptProp: ScriptProp, engineProp: EngineProp, precision?: number, minVal?: number, maxVal?: number): KeyframePropBinding<KeyframeType, ComponentType, MuStruct<{
        x: MuQuantizedFloat;
    } & {
        y: MuQuantizedFloat;
    } & {
        z: MuQuantizedFloat;
    }>>;
    propVec3<ScriptVecObj extends RestrictObj<KeyframeType, GameVector3>, ScriptProp extends RestrictProps<ScriptVecObj, any>, EngineProps extends [...(keyof RestrictObj<ComponentType, number>)[]]>(scriptProp: ScriptProp, engineProps: EngineProps, precision?: number, minVal?: number, maxVal?: number): KeyframePropBinding<KeyframeType, ComponentType, MuStruct<VectorStructSchema<EngineProps>>>;
    rgb<ScriptVecObj extends RestrictObj<KeyframeType, GameRGBColor>, ScriptProp extends RestrictProps<ScriptVecObj, any>, EngineObj extends RestrictObj<ComponentType, Float32Array>, EngineProp extends RestrictProps<EngineObj, any>>(scriptProp: ScriptProp, engineProp: EngineProp): KeyframePropBinding<KeyframeType, ComponentType, MuStruct<{
        r: MuQuantizedFloat;
    } & {
        g: MuQuantizedFloat;
    } & {
        b: MuQuantizedFloat;
    }>>;
    propRGB<ScriptVecObj extends RestrictObj<KeyframeType, GameRGBColor>, ScriptProp extends RestrictProps<ScriptVecObj, any>, EngineProps extends [...(keyof RestrictObj<ComponentType, number>)[]]>(scriptProp: ScriptProp, engineProps: EngineProps): KeyframePropBinding<KeyframeType, ComponentType, MuStruct<VectorStructSchema<EngineProps>>>;
    rgba<ScriptVecObj extends RestrictObj<KeyframeType, GameRGBAColor>, ScriptProp extends RestrictProps<ScriptVecObj, any>, EngineObj extends RestrictObj<ComponentType, Float32Array>, EngineProp extends RestrictProps<EngineObj, any>>(scriptProp: ScriptProp, engineProp: EngineProp): KeyframePropBinding<KeyframeType, ComponentType, MuStruct<{
        r: MuQuantizedFloat;
    } & {
        g: MuQuantizedFloat;
    } & {
        b: MuQuantizedFloat;
    } & {
        a: MuQuantizedFloat;
    }>>;
    propRGBA<ScriptVecObj extends RestrictObj<KeyframeType, GameRGBAColor>, ScriptProp extends RestrictProps<ScriptVecObj, any>, EngineProps extends [...(keyof RestrictObj<ComponentType, number>)[]]>(scriptProp: ScriptProp, engineProps: EngineProps): KeyframePropBinding<KeyframeType, ComponentType, MuStruct<VectorStructSchema<EngineProps>>>;
    light<ScriptVecObj extends RestrictObj<KeyframeType, GameRGBColor>, ScriptProp extends RestrictProps<ScriptVecObj, any>, EngineObj extends RestrictObj<ComponentType, Float32Array>, EngineProp extends RestrictProps<EngineObj, any>>(scriptProp: ScriptProp, engineProp: EngineProp): KeyframePropBinding<KeyframeType, ComponentType, MuStruct<{
        r: MuQuantizedFloat;
    } & {
        g: MuQuantizedFloat;
    } & {
        b: MuQuantizedFloat;
    }>>;
    propLight<ScriptVecObj extends RestrictObj<KeyframeType, GameRGBColor>, ScriptProp extends RestrictProps<ScriptVecObj, any>, EngineProps extends [...(keyof RestrictObj<ComponentType, number>)[]]>(scriptProp: ScriptProp, engineProps: EngineProps): KeyframePropBinding<KeyframeType, ComponentType, MuStruct<VectorStructSchema<EngineProps>>>;
    propQuat<ScriptVecObj extends RestrictObj<KeyframeType, GameQuaternion>, ScriptProp extends RestrictProps<ScriptVecObj, any>, EngineProps extends [...(keyof RestrictObj<ComponentType, number>)[]]>(scriptProp: ScriptProp, engineProps: EngineProps): KeyframePropBinding<KeyframeType, ComponentType, MuStruct<VectorStructSchema<EngineProps>>>;
    entity<ScriptProp extends RestrictProps<KeyframeType, GameEntity | null>, EngineProp extends RestrictProps<ComponentType, number>>(scriptProp: ScriptProp, engineProp: EngineProp): KeyframePropBinding<KeyframeType, ComponentType, MuVarint>;
    enum<EnumType extends string, ScriptProp extends RestrictProps<KeyframeType, EnumType>, EngineEnumType extends number, EngineProp extends RestrictProps<ComponentType, EngineEnumType>>(scriptProp: ScriptProp, engineProp: EngineProp, enumVals: {
        [id: string]: number;
    }): KeyframePropBinding<KeyframeType, ComponentType, MuVarint>;
    num<ScriptProp extends RestrictProps<KeyframeType, number>, EngineProp extends RestrictProps<ComponentType, number>>(scriptProp: ScriptProp, engineProp: EngineProp, precision?: number, minVal?: number, maxVal?: number, schema?: MuSchema<number>): KeyframePropBinding<KeyframeType, ComponentType, MuSchema<number>>;
    physPosition(): KeyframePropBinding<KeyframeType, ComponentType, MuStruct<{} | {
        [x: string]: MuQuantizedFloat;
    }>>;
    physOrientation(): KeyframePropBinding<KeyframeType, ComponentType, MuStruct<{} | {
        [x: string]: MuQuantizedFloat;
    }>>;
    meshColor(): {
        schema: MuUint32;
        emitParse: (block: CodeGenBlock, id: number, idEntries: string, dataEntries: string, keyframe: string) => void;
        emitSerialize: (block: CodeGenBlock, prop: string, keyframe: string) => void;
        emitInterpolate0: (block: CodeGenBlock, component: string, prop: string) => void;
        emitInterpolate1: (block: CodeGenBlock, component: string, prop0: string, prop1: string, weight0: string, weight1: string) => void;
        emitClear: (block: CodeGenBlock, component: string) => void;
    };
    particleColor(): {
        schema: MuStruct<{
            color0: MuUint32;
            color1: MuUint32;
            color2: MuUint32;
            color3: MuUint32;
            color4: MuUint32;
        }>;
        emitParse: (block: CodeGenBlock, id: number, idEntries: string, dataEntries: string, keyframe: string) => void;
        emitSerialize: (block: CodeGenBlock, prop: string, keyframe: string) => void;
        emitInterpolate0: (block: CodeGenBlock, component: string, prop: string) => void;
        emitInterpolate1: (block: CodeGenBlock, component: string, prop0: string, prop1: string, weight0: string, weight1: string) => void;
        emitClear: (block: CodeGenBlock, component: string) => void;
    };
    particleSize(): {
        schema: MuStruct<{
            size0: MuQuantizedFloat;
            size1: MuQuantizedFloat;
            size2: MuQuantizedFloat;
            size3: MuQuantizedFloat;
            size4: MuQuantizedFloat;
        }>;
        emitParse: (block: CodeGenBlock, id: number, idEntries: string, dataEntries: string, keyframe: string) => void;
        emitSerialize: (block: CodeGenBlock, component: string, keyframe: string) => void;
        emitInterpolate0: (block: CodeGenBlock, component: string, prop: string) => void;
        emitInterpolate1: (block: CodeGenBlock, component: string, prop0: string, prop1: string, weight0: string, weight1: string) => void;
        emitClear: (block: CodeGenBlock, component: string) => void;
    };
    private _booleanBase;
    bit<ScriptProp extends RestrictProps<KeyframeType, boolean>, EngineProp extends RestrictProps<ComponentType, number>>(scriptProp: ScriptProp, engineProp: EngineProp, flag: number): KeyframePropBinding<KeyframeType, ComponentType, MuBoolean>;
    bool<ScriptProp extends RestrictProps<KeyframeType, boolean>, EngineProp extends RestrictProps<ComponentType, boolean>>(scriptProp: ScriptProp, engineProp: EngineProp): {
        emitInterpolate0: (block: CodeGenBlock, component: string, prop: string) => void;
        emitInterpolate1: (block: CodeGenBlock, component: string, prop: string) => void;
        emitClear: (block: CodeGenBlock, dst: string) => void;
        schema: MuBoolean;
        emitParse: (block: CodeGenBlock, id: number, idEntries: string, dataEntries: string, keyframe: string) => void;
        emitSerialize: (block: CodeGenBlock, component: string, keyframe: string) => void;
    };
    mesh<ScriptProp extends RestrictProps<KeyframeType, string>, EngineProp extends RestrictProps<ComponentType, number>>(scriptProp: ScriptProp, engineProp: EngineProp): KeyframePropBinding<KeyframeType, ComponentType, MuVarint>;
    asset<ScriptProp extends RestrictProps<KeyframeType, string>, EngineProp extends RestrictProps<ComponentType, string>>(scriptProp: ScriptProp, engineProp: EngineProp, type: GameAssetType): {
        schema: import("@box/mudb/schema").MuASCII;
        emitParse: (block: CodeGenBlock, id: number, idEntries: string, dataEntries: string, keyframe: string, parseAPI: string) => void;
        emitSerialize: (block: CodeGenBlock, prop: string, keyframe: string, parseAPI: string) => void;
        emitInterpolate0: (block: CodeGenBlock, component: string, prop: string) => void;
        emitInterpolate1: (block: CodeGenBlock, component: string, prop0: string) => void;
        emitClear: (block: CodeGenBlock, dst: string) => void;
    };
    nestEngine<EngineProp extends RestrictProps<ComponentType, any>, ResultType extends [
        ...KeyframePropBinding<KeyframeType, ComponentType[EngineProp], MuSchema<unknown>>[]
    ]>(prop: EngineProp, gen: (factory: KeyframeComponentBindingFactory<KeyframeType, ComponentType[EngineProp], ComponentName>) => ResultType): {
        [index in keyof ResultType]: ResultType[index] extends KeyframePropBinding<KeyframeType, ComponentType[EngineProp], infer T> ? KeyframePropBinding<KeyframeType, ComponentType, T> : never;
    };
    bind<PropSchemaList extends [
        ...KeyframePropBinding<KeyframeType, ComponentType, MuSchema<unknown>>[]
    ]>(...bindings: PropSchemaList): KeyframeComponentBinding<KeyframeType, ComponentType, MuArrayUnion<UnwrapSchema<PropSchemaList>>, ComponentName>;
}
export interface KeyframeType {
    duration?: number;
    easeIn?: GameEasing;
    easeOut?: GameEasing;
}
export interface AnimationBinding<KT extends KeyframeType, AnimationSchema extends MuSchema<GenericAnimation>, AnimationIndexSchema extends MuSchema<GenericAnimationIndex>, Interpolators, Copiers, FlagSchema extends MuSchema<any>> {
    schema: AnimationSchema;
    setSchema: MuSortedArray<AnimationSchema>;
    syncSchema: MuStruct<{
        removes: MuSortedArray<MuVarint>;
        upserts: MuSortedArray<AnimationSchema>;
    }>;
    indexSchema: AnimationIndexSchema;
    flagSchema: FlagSchema;
    parse: (keyframes: Partial<KT>[], out: AnimationSchema['identity'], parseAPI: KeyframeScriptParserAPI) => void;
    serialize: (anim: AnimationSchema['identity'], parseAPI: KeyframeScriptParserAPI) => Partial<KT>[];
    tick: (animations: AnimationSchema['identity'][], tick: number, deltaTick: number, out: AnimationIndexSchema['identity']) => void;
    accumFlags: (animations: AnimationSchema['identity'], flags: FlagSchema['identity'], step: number) => void;
    interpolate: Interpolators;
    clear: Copiers;
}
export type GenericAnimationBinding = AnimationBinding<any, any, any, any, any, any>;
export declare class AnimationBindingFactory<KeyframeType extends {
    duration?: number;
}> {
    name: string;
    ctxt: CodeGenContext;
    constructor(name: string);
    component<ComponentType, ComponentName extends string>(name: ComponentName, defaultValue: ComponentType): KeyframeComponentBindingFactory<KeyframeType, ComponentType, ComponentName>;
    keyframe<ComponentSpec extends [
        ...KeyframeComponentBinding<KeyframeType, unknown, MuArrayUnion<[...MuSchema<unknown>[]]>, any>[]
    ]>(...components: ComponentSpec): ComponentSpec;
    create<Singleton extends boolean, PropSpec extends {
        [id: string]: MuSchema<any>;
    }, KeyframePropSpec extends {
        [id: string]: MuSchema<any>;
    }, ComponentSpec extends [
        ...KeyframeComponentBinding<KeyframeType, unknown, MuArrayUnion<[...MuSchema<unknown>[]]>, any>[]
    ]>(spec: {
        singleton: Singleton;
        props: PropSpec;
        keyframe: {
            components: ComponentSpec;
            props: KeyframePropSpec;
        };
    }): AnimationBinding<KeyframeType, MuStruct<{
        id: MuVarint;
        targetId: MuVarint;
        startTick: MuQuantizedFloat;
        endTicks: MuQuantizedFloat;
        cycleTicks: MuQuantizedFloat;
        cyclePhase: MuQuantizedFloat;
        cycleCount: MuQuantizedFloat;
        playbackMode: MuSchema<AnimationPlaybackMode>;
        keyframes: MuSortedArray<MuStruct<{
            tick: MuQuantizedFloat;
            easeIn: MuSchema<KeyframeEaseMode>;
            easeOut: MuSchema<KeyframeEaseMode>;
            components: MuArrayUnion<UnwrapSchema<ComponentSpec>>;
        } & PropSpec>>;
    } & PropSpec>, MuStruct<{
        dirty: MuBoolean;
        tracker: MuStruct<{
            targetId: MuArray<MuVarint>;
            wrapMode: MuArray<MuSchema<AnimationPlaybackMode>>;
            cycleLength: MuArray<import("@box/mudb/schema").MuFloat64>;
            loopCount: MuArray<import("@box/mudb/schema").MuFloat64>;
            loopPhase: MuArray<import("@box/mudb/schema").MuFloat64>;
            tickOffset: MuArray<MuQuantizedFloat>;
            tickScale: MuArray<import("@box/mudb/schema").MuFloat64>;
            dataOffset: MuArray<MuVarint>;
            data: MuArray<import("@box/mudb/schema").MuFloat64>;
            inEasing: MuArray<MuSchema<KeyframeEaseMode>>;
            outEasing: MuArray<MuSchema<KeyframeEaseMode>>;
            prevFrame: MuArray<MuVarint>;
            nextFrame: MuArray<MuVarint>;
            prevWeight: MuArray<import("@box/mudb/schema").MuFloat64>;
            nextWeight: MuArray<import("@box/mudb/schema").MuFloat64>;
        }>;
        components: MuStruct<UnwrapComponentIndex<ComponentSpec>>;
    }>, UnwrapInterpolators<Singleton, import("@box/mudb/schema/struct").Struct<{
        dirty: MuBoolean;
        tracker: MuStruct<{
            targetId: MuArray<MuVarint>;
            wrapMode: MuArray<MuSchema<AnimationPlaybackMode>>;
            cycleLength: MuArray<import("@box/mudb/schema").MuFloat64>;
            loopCount: MuArray<import("@box/mudb/schema").MuFloat64>;
            loopPhase: MuArray<import("@box/mudb/schema").MuFloat64>;
            tickOffset: MuArray<MuQuantizedFloat>;
            tickScale: MuArray<import("@box/mudb/schema").MuFloat64>;
            dataOffset: MuArray<MuVarint>;
            data: MuArray<import("@box/mudb/schema").MuFloat64>;
            inEasing: MuArray<MuSchema<KeyframeEaseMode>>;
            outEasing: MuArray<MuSchema<KeyframeEaseMode>>;
            prevFrame: MuArray<MuVarint>;
            nextFrame: MuArray<MuVarint>;
            prevWeight: MuArray<import("@box/mudb/schema").MuFloat64>;
            nextWeight: MuArray<import("@box/mudb/schema").MuFloat64>;
        }>;
        components: MuStruct<UnwrapComponentIndex<ComponentSpec>>;
    }>, ComponentSpec>, UnwrapResettor<Singleton, import("@box/mudb/schema/struct").Struct<{
        dirty: MuBoolean;
        tracker: MuStruct<{
            targetId: MuArray<MuVarint>;
            wrapMode: MuArray<MuSchema<AnimationPlaybackMode>>;
            cycleLength: MuArray<import("@box/mudb/schema").MuFloat64>;
            loopCount: MuArray<import("@box/mudb/schema").MuFloat64>;
            loopPhase: MuArray<import("@box/mudb/schema").MuFloat64>;
            tickOffset: MuArray<MuQuantizedFloat>;
            tickScale: MuArray<import("@box/mudb/schema").MuFloat64>;
            dataOffset: MuArray<MuVarint>;
            data: MuArray<import("@box/mudb/schema").MuFloat64>;
            inEasing: MuArray<MuSchema<KeyframeEaseMode>>;
            outEasing: MuArray<MuSchema<KeyframeEaseMode>>;
            prevFrame: MuArray<MuVarint>;
            nextFrame: MuArray<MuVarint>;
            prevWeight: MuArray<import("@box/mudb/schema").MuFloat64>;
            nextWeight: MuArray<import("@box/mudb/schema").MuFloat64>;
        }>;
        components: MuStruct<UnwrapComponentIndex<ComponentSpec>>;
    }>, ComponentSpec>, MuStruct<UnwrapFlagSchema<ComponentSpec>>>;
}
export declare function animEndTick<Animation extends GenericAnimation>(animation: Animation): number;
export declare function applySyncPacket<Binding extends GenericAnimationBinding>(binding: Binding, animations: Binding['setSchema']['identity'], packet: Binding['syncSchema']['identity']): boolean;
export {};
