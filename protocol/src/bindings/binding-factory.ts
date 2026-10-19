import { Binding } from './synchronizer';
import {
  MuSchema,
  MuFloat64,
  MuUTF8,
  MuBoolean,
  MuUint32,
  MuVarint,
} from '@box/mudb/schema';
import {
  Vec3Schema,
  Vec4Schema,
  QuatSchema,
  BoundsSchema,
} from '@box/schema/utils/math-schema';
import {
  GameVector3,
  GameRGBColor,
  GameRGBAColor,
  GameQuaternion,
  GameBounds3,
} from '@box/schema/api/js/math';
import { vec3, vec4, quat } from 'gl-matrix';
import { HashSchema } from '@box/schema/content-server/index';
import {
  GameAssetType,
  GameEntity,
  GamePlayer,
  GameSoundEffect,
  GameSkin,
  Gamepad,
} from '@box/schema/api/js/api';
import { ScriptEntityWrapper } from './entity-synchronizer';
import { AudioSampleRDA } from '@box/schema/project/project-rda';
import { CodeGenBlock } from '../codegen';
import {
  PlayerSkinId,
  PlayerSkinIdSchema,
} from '@box/schema/player/player-schema';
import {
  PlayerGamepad,
  PlayerGamepadSchema,
} from '@box/schema/replica/game-private-replica';
import type { RestrictObj, RestrictProps } from '@box/utils/script';

export const WRAPPER_INDEX = new WeakMap<GameEntity, ScriptEntityWrapper>();
export const WRAPPER_PLAYER_INDEX = new WeakMap<
  GamePlayer,
  ScriptEntityWrapper
>();
export const ENTITY_INDEX = new Map<number, ScriptEntityWrapper>();

export type ReplaceReturnType<T extends (...a: any) => any, TNewReturn> = (
  ...a: Parameters<T>
) => TNewReturn;

// Prevents a script from modifying an engine variable
export function constant<T, U, V extends MuSchema<any>>(
  b: Binding<T, U, V>,
): Binding<T, U, V> {
  const x = { ...b };

  // remove all the post tick methods from the binding
  delete x.emitPostTick;
  delete x.deltaPostTick;
  delete x.checkPostTick;
  delete x.synchronize;
  delete x.emitSynchronize;

  return x;
}

export function safePropExpr(obj: string, prop: string | number | Symbol) {
  if (typeof prop === 'string') {
    return `${obj}.${prop}`;
  } else if (typeof prop === 'number') {
    return `${obj}[${prop}]`;
  } else if (typeof prop === 'symbol') {
    throw new Error('symbol not supported');
  }
  return '';
}

export function safeReadBoolExpr(propExpr: string) {
  return `(!!${propExpr})`;
}

export function safeReadNumExpr(
  propExpr: string,
  minVal: number,
  maxVal: number,
) {
  let readExpr = `(+${propExpr} || 0)`;
  if (minVal !== -Infinity) {
    readExpr = `Math.max(${minVal}, ${readExpr})`;
  }
  if (maxVal !== Infinity) {
    readExpr = `Math.min(${maxVal}, ${readExpr})`;
  }
  return readExpr;
}

export function safeReadStrExpr(propExpr: string) {
  return `('' + ${propExpr})`;
}

export function safeReadVec(
  ctor: Function,
  fields: (string | number | Symbol)[],
  minVal: number,
  maxVal: number,
  block: CodeGenBlock,
  propExpr: string,
) {
  const ctorRef = block.inject(ctor);
  const propVal = block.def();
  const fieldVals = fields.map(() => block.def());
  block.push(`
        ${propVal} = ${propExpr};
        if (${propVal} instanceof ${ctorRef}) {
            ${fieldVals
              .map(
                (outVar, i) => `
                ${outVar} = ${safeReadNumExpr(
                  safePropExpr(propVal, fields[i]),
                  minVal,
                  maxVal,
                )};
            `,
              )
              .join('')}
        } else if (Array.isArray(${propVal})) {
            ${fieldVals
              .map(
                (outVar, i) => `
                ${outVar} = ${safeReadNumExpr(
                  safePropExpr(propVal, i),
                  minVal,
                  maxVal,
                )};
            `,
              )
              .join('')}
        } else {
            ${fieldVals.join(' = ')} = 0;
        }`);
  return fieldVals;
}

export function safeWriteVec(
  ctor: Function,
  dstFields: (string | number | Symbol)[],
  srcFields: (string | number | Symbol)[],
  block: CodeGenBlock,
  dstExpr: string,
  srcExpr: string,
) {
  const ctorRef = block.inject(ctor);
  const srcVal = block.def();
  const dstVal = block.def();
  block.push(`
        ${srcVal} = ${srcExpr};
        ${dstVal} = ${dstExpr};
        if (${dstVal} instanceof ${ctorRef}) {
            ${srcFields
              .map((srcProp, i) => {
                const dstProp = dstFields[i];
                return `${safePropExpr(dstVal, dstProp)} = ${safePropExpr(
                  srcVal,
                  srcProp,
                )};`;
              })
              .join('\n')}
        } else {
            ${dstExpr} = new ${ctorRef}(${srcFields
    .map((srcProp) => safePropExpr(srcVal, srcProp))
    .join(', ')});
        }`);
}

export class BindingFactory<ScriptObject, EngineObject> {
  public bindVector<
    ScriptVec,
    ScriptVecObj extends RestrictObj<ScriptObject, ScriptVec>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    EngineVec,
    EngineVecObj extends RestrictObj<EngineObject, EngineVec>,
    EngineProp extends RestrictProps<EngineVecObj, any>,
    VecSchema extends MuSchema<any>,
  >(
    schema: VecSchema,
    ctor: new (...fields: number[]) => ScriptVec,
    scriptProp: ScriptProp,
    scriptFields: (keyof ScriptVec)[],
    engineProp: EngineProp,
    engineFields: (keyof EngineVec)[],
    minVal: number,
    maxVal: number,
  ) {
    return {
      name: `vec (${scriptFields} to ${engineFields}), ${scriptProp}::${engineProp}`,

      schema,

      emitPreTick: (
        block: CodeGenBlock,
        scriptObj: string,
        engineObj: string,
      ) => {
        safeWriteVec(
          ctor,
          scriptFields,
          engineFields,
          block,
          safePropExpr(scriptObj, scriptProp),
          safePropExpr(engineObj, engineProp),
        );
      },

      emitPostTick: (
        check: CodeGenBlock,
        delta: CodeGenBlock,
        scriptObj: string,
        engineObj: string,
        _,
        checkFlag: string,
        patch: string,
      ) => {
        const vecProps = safeReadVec(
          ctor,
          scriptFields,
          minVal,
          maxVal,
          check,
          safePropExpr(scriptObj, scriptProp),
        );

        const engineVal = check.def();
        check.push(`
                    ${engineVal} = ${safePropExpr(engineObj, engineProp)};
                    ${checkFlag} = ${vecProps
          .map(
            (scriptVal, i) =>
              `(${scriptVal} !== ${safePropExpr(engineVal, engineFields[i])})`,
          )
          .join(' || ')};`);

        const schemaRef = delta.inject(schema);
        delta.push(`
                    ${patch} = ${schemaRef}.alloc();
                    ${vecProps
                      .map((prop, i) => `${patch}[${i}] = ${prop};`)
                      .join('\n')}`);
      },

      emitSynchronize: (
        block: CodeGenBlock,
        engineObj: string,
        patchVar: string,
      ) => {
        const engineVal = block.def();
        block.push(`
                    ${engineVal} = ${safePropExpr(engineObj, engineProp)};
                    ${engineFields
                      .map(
                        (prop, i) =>
                          `${safePropExpr(
                            engineVal,
                            prop,
                          )} = ${patchVar}[${i}];`,
                      )
                      .join('\n')}`);
      },
    };
  }

  public nestEngine<EngineProp extends RestrictProps<EngineObject, any>>(
    prop: EngineProp,
    gen: (
      factory: BindingFactory<ScriptObject, EngineObject[EngineProp]>,
    ) => Binding<ScriptObject, EngineObject[EngineProp], any>[],
    checkPred?: (
      check: CodeGenBlock,
      scriptObj: string,
      engineObj: string,
      checkFlag: string,
    ) => void,
  ): Binding<ScriptObject, EngineObject, any>[] {
    const factory = new BindingFactory<
      ScriptObject,
      EngineObject[EngineProp]
    >();
    const wrappedFactory = new BindingFactory<
      ScriptObject,
      EngineObject[EngineProp]
    >();
    Object.getOwnPropertyNames(Object.getPrototypeOf(factory)).forEach(
      (method) => {
        const oldMethod = factory[method];
        wrappedFactory[method] = (...args) => {
          const prev = oldMethod.apply(factory, args);
          const result = { ...prev };
          if ('name' in prev) {
            result.name = `nested:${prop} ${prev.name}`;
          }
          if ('emitPreTick' in result) {
            result.emitPreTick = (
              block: CodeGenBlock,
              scriptObj: string,
              engineObj: string,
            ) => {
              return prev.emitPreTick(
                block,
                scriptObj,
                safePropExpr(engineObj, prop),
              );
            };
          }
          if ('emitPostTick' in result) {
            result.emitPostTick = (
              check: CodeGenBlock,
              delta: CodeGenBlock,
              scriptObj: string,
              engineObj: string,
              resourceTok: string,
              checkFlag: string,
              patch: string,
            ) => {
              if (checkPred) {
                let nestFlag = (<any>check)['nestFlag' + prop];
                if (!nestFlag) {
                  (<any>check)['nestFlag' + prop] = nestFlag = check.def();
                  checkPred(check, scriptObj, engineObj, nestFlag);
                }
                check.push(`
                            // begin nested prop: ${prop}
                            if (${nestFlag}) {
                            `);
                prev.emitPostTick(
                  check,
                  delta,
                  scriptObj,
                  safePropExpr(engineObj, prop),
                  resourceTok,
                  checkFlag,
                  patch,
                );
                check.push(`
                            } else {
                                ${checkFlag} = false;
                            }
                            // end nested prop: ${prop}
                            `);
              } else {
                prev.emitPostTick(
                  check,
                  delta,
                  scriptObj,
                  safePropExpr(engineObj, prop),
                  resourceTok,
                  checkFlag,
                  patch,
                );
              }
            };
          }
          if ('emitSynchronize' in result) {
            result.emitSynchronize = (
              block: CodeGenBlock,
              engineObj: string,
              patchVar: string,
            ) => {
              return prev.emitSynchronize(
                block,
                safePropExpr(engineObj, prop),
                patchVar,
              );
            };
          }
          return result;
        };
      },
    );
    return <any>gen(wrappedFactory);
  }

  public bindVecToProps<
    ScriptVec,
    ScriptVecObj extends RestrictObj<ScriptObject, ScriptVec>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    EngineNums extends RestrictObj<EngineObject, number>,
    VecSchema extends MuSchema<any>,
  >(
    schema: VecSchema,
    ctor: new (...fields: number[]) => ScriptVec,
    scriptProp: ScriptProp,
    scriptFields: (keyof ScriptVec)[],
    engineFields: (keyof EngineNums)[],
    minVal: number,
    maxVal: number,
  ) {
    return {
      name: `prop vec (${scriptFields} to ${engineFields}), ${scriptProp}`,

      schema,

      emitPreTick: (
        block: CodeGenBlock,
        scriptObj: string,
        engineObj: string,
      ) => {
        const ctorRef = block.inject(ctor);
        const dstVal = block.def();
        const dstExpr = safePropExpr(scriptObj, scriptProp);
        block.push(`
                    ${dstVal} = ${dstExpr};
                    if (${dstVal} instanceof ${ctorRef}) {
                        ${engineFields
                          .map((engineProp, i) => {
                            const component = scriptFields[i];
                            return `${safePropExpr(
                              dstVal,
                              component,
                            )} = ${safePropExpr(engineObj, engineProp)};`;
                          })
                          .join('\n')}
                    } else {
                        ${dstExpr} = new ${ctorRef}(${engineFields
          .map((prop) => safePropExpr(engineObj, prop))
          .join(', ')});
                    }`);
      },

      emitPostTick: (
        check: CodeGenBlock,
        delta: CodeGenBlock,
        scriptObj: string,
        engineObj: string,
        _,
        checkFlag: string,
        patch: string,
      ) => {
        const vecProps = safeReadVec(
          ctor,
          scriptFields,
          minVal,
          maxVal,
          check,
          safePropExpr(scriptObj, scriptProp),
        );

        check.push(`
                    ${checkFlag} = ${vecProps
          .map(
            (scriptVal, i) =>
              `(${scriptVal} !== ${safePropExpr(engineObj, engineFields[i])})`,
          )
          .join(' || ')};
                    `);

        const schemaRef = delta.inject(schema);
        delta.push(`
                    ${patch} = ${schemaRef}.alloc();
                    ${vecProps
                      .map((prop, i) => `${patch}[${i}] = ${prop};`)
                      .join('\n')}`);
      },

      emitSynchronize: (
        block: CodeGenBlock,
        engineObj: string,
        patchVar: string,
      ) => {
        block.push(`
                    ${engineFields
                      .map(
                        (prop, i) =>
                          `${safePropExpr(
                            engineObj,
                            prop,
                          )} = ${patchVar}[${i}];`,
                      )
                      .join('\n')}`);
      },
    };
  }

  public schema<
    T extends MuSchema<any>,
    ScriptProp extends RestrictProps<ScriptObject, T['identity']>,
    EngineProp extends RestrictProps<EngineObject, T['identity']>,
  >(
    schema: T,
    scriptProp: ScriptProp,
    engineProp: EngineProp,
  ): Binding<ScriptObject, EngineObject, MuSchema<boolean>> {
    return {
      name: `custom schema ${scriptProp}::${engineProp}`,

      schema,

      emitPreTick: (block, scriptObj, engineObj) => {
        block.push(`if (typeof ${safePropExpr(
          scriptObj,
          scriptProp,
        )} !== 'object') {
                    ${safePropExpr(scriptObj, scriptProp)} = {};
                }
                Object.assign(${safePropExpr(
                  scriptObj,
                  scriptProp,
                )}, ${safePropExpr(engineObj, engineProp)});`);
      },

      emitPostTick: (
        check,
        delta,
        scriptObj,
        engineObj,
        _1,
        checkFlag,
        patch,
      ) => {
        const schemaRef = delta.inject(schema);
        check.push(
          `${patch} = ${schemaRef}.alloc();
                    ${schemaRef}.assign(${patch}, ${safePropExpr(
            scriptObj,
            scriptProp,
          )});
                    ${checkFlag} = !${schemaRef}.equal(${patch},  ${safePropExpr(
            engineObj,
            engineProp,
          )});`,
        );
      },

      emitSynchronize: (block, engineObj, patch) => {
        const schemaRef = block.inject(schema);
        block.push(
          `${schemaRef}.assign(${safePropExpr(
            engineObj,
            engineProp,
          )}, ${patch});`,
        );
      },
    };
  }

  public bool<
    ScriptProp extends RestrictProps<ScriptObject, boolean>,
    EngineProp extends RestrictProps<EngineObject, boolean>,
  >(
    scriptProp: ScriptProp,
    engineProp: EngineProp,
  ): Binding<ScriptObject, EngineObject, MuSchema<boolean>> {
    return {
      name: `bool ${scriptProp}::${engineProp}`,

      schema: new MuBoolean(),

      emitPreTick: (block, scriptObj, engineObj) => {
        block.push(
          `${safePropExpr(scriptObj, scriptProp)} = ${safePropExpr(
            engineObj,
            engineProp,
          )};`,
        );
      },

      emitPostTick: (check, _0, scriptObj, engineObj, _1, checkFlag, patch) => {
        check.push(
          `${patch} = ${safeReadBoolExpr(safePropExpr(scriptObj, scriptProp))};
                    ${checkFlag} = ${safePropExpr(
            engineObj,
            engineProp,
          )} !== ${patch};`,
        );
      },

      emitSynchronize: (block, engineObj, patch) => {
        block.push(`${safePropExpr(engineObj, engineProp)} = ${patch};`);
      },
    };
  }

  public bit<
    ScriptProp extends RestrictProps<ScriptObject, boolean>,
    EngineProp extends RestrictProps<EngineObject, number>,
  >(
    scriptProp: ScriptProp,
    engineProp: EngineProp,
    flag: number,
  ): Binding<ScriptObject, EngineObject, MuSchema<boolean>> {
    return {
      name: `bit ${scriptProp}::${engineProp}`,

      schema: new MuBoolean(),

      emitPreTick: (block, scriptObj, engineObj) => {
        block.push(
          `${safePropExpr(scriptObj, scriptProp)} = !!(${safePropExpr(
            engineObj,
            engineProp,
          )} & 0x${(flag >>> 0).toString(16)});`,
        );
      },

      emitPostTick: (check, _0, scriptObj, engineObj, _1, checkFlag, patch) => {
        check.push(
          `${patch} = ${safeReadBoolExpr(safePropExpr(scriptObj, scriptProp))};
                    ${checkFlag} = !!(${safePropExpr(
            engineObj,
            engineProp,
          )} & ${flag}) !== ${patch};`,
        );
      },

      emitSynchronize: (block, engineObj, patch) => {
        block.push(`
                if (${patch}) {
                    ${safePropExpr(engineObj, engineProp)} |= 0x${(
          flag >>> 0
        ).toString(16)};
                } else {
                    ${safePropExpr(engineObj, engineProp)} &= 0x${(
          ~flag >>> 0
        ).toString(16)};
                }`);
      },
    };
  }

  public num<
    ScriptProp extends RestrictProps<ScriptObject, number>,
    EngineProp extends RestrictProps<EngineObject, number>,
  >(
    scriptProp: ScriptProp,
    engineProp: EngineProp,
    minVal: number = -Infinity,
    maxVal: number = Infinity,
  ): Binding<ScriptObject, EngineObject, MuSchema<number>> {
    return {
      name: `num from ${minVal} to ${maxVal}, ${scriptProp}::${engineProp}`,

      schema: new MuFloat64(),

      emitPreTick: (block, scriptObj, engineObj) => {
        block.push(
          `${safePropExpr(scriptObj, scriptProp)} = ${safePropExpr(
            engineObj,
            engineProp,
          )};`,
        );
      },

      emitPostTick: (check, _0, scriptObj, engineObj, _1, checkFlag, patch) => {
        check.push(
          `${patch} = ${safeReadNumExpr(
            safePropExpr(scriptObj, scriptProp),
            minVal,
            maxVal,
          )};
                    ${checkFlag} = ${safePropExpr(
            engineObj,
            engineProp,
          )} !== ${patch};`,
        );
      },

      emitSynchronize: (block, engineObj, patch) => {
        block.push(`${safePropExpr(engineObj, engineProp)} = ${patch};`);
      },
    };
  }

  public nestedEngineNum<
    ScriptProp extends RestrictProps<ScriptObject, number>,
    EngineProp extends RestrictProps<EngineObject, any>,
    EngineProp2 extends RestrictProps<EngineObject[EngineProp], number>,
  >(
    scriptProp: ScriptProp,
    engineProp: EngineProp,
    engineProp2: EngineProp2,
    minVal: number = -Infinity,
    maxVal: number = Infinity,
  ): Binding<ScriptObject, EngineObject, MuSchema<number>> {
    return {
      name: `num from ${minVal} to ${maxVal}, ${scriptProp}::${engineProp}.${engineProp2}`,

      schema: new MuFloat64(),

      emitPreTick: (block, scriptObj, engineObj) => {
        block.push(
          `${safePropExpr(scriptObj, scriptProp)} = ${safePropExpr(
            safePropExpr(engineObj, engineProp),
            engineProp2,
          )};`,
        );
      },

      emitPostTick: (check, _0, scriptObj, engineObj, _1, checkFlag, patch) => {
        check.push(
          `${patch} = ${safeReadNumExpr(
            safePropExpr(scriptObj, scriptProp),
            minVal,
            maxVal,
          )};
                    ${checkFlag} = ${safePropExpr(
            safePropExpr(engineObj, engineProp),
            engineProp2,
          )} !== ${patch};`,
        );
      },

      emitSynchronize: (block, engineObj, patch) => {
        block.push(
          `${safePropExpr(
            safePropExpr(engineObj, engineProp),
            engineProp2,
          )} = ${patch};`,
        );
      },
    };
  }

  public str<
    ScriptProp extends RestrictProps<ScriptObject, string>,
    EngineProp extends RestrictProps<EngineObject, string>,
  >(
    scriptProp: ScriptProp,
    engineProp: EngineProp,
  ): Binding<ScriptObject, EngineObject, MuSchema<string>> {
    return {
      name: `str, ${scriptProp}::${engineProp}`,

      schema: new MuUTF8(),

      emitPreTick: (block, scriptObj, engineObj) => {
        block.push(
          `${safePropExpr(scriptObj, scriptProp)} = ${safePropExpr(
            engineObj,
            engineProp,
          )};`,
        );
      },

      emitPostTick: (check, _0, scriptObj, engineObj, _1, checkFlag, patch) => {
        check.push(
          `${patch} = ${safeReadStrExpr(safePropExpr(scriptObj, scriptProp))};
                    ${checkFlag} = ${safePropExpr(
            engineObj,
            engineProp,
          )} !== ${patch};`,
        );
      },

      emitSynchronize: (block, engineObj, patch) => {
        block.push(`${safePropExpr(engineObj, engineProp)} = ${patch};`);
      },
    };
  }

  public vec3<
    ScriptVecObj extends RestrictObj<ScriptObject, GameVector3>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    EngineVecObj extends RestrictObj<EngineObject, vec3>,
    EngineProp extends RestrictProps<EngineVecObj, any>,
  >(scriptProp: ScriptProp, engineProp: EngineProp) {
    return this.bindVector<
      GameVector3,
      ScriptVecObj,
      ScriptProp,
      vec3,
      EngineVecObj,
      EngineProp,
      typeof Vec3Schema
    >(
      Vec3Schema,
      GameVector3,
      scriptProp,
      ['x', 'y', 'z'],
      engineProp,
      [0, 1, 2],
      -Infinity,
      Infinity,
    );
  }

  public propVec3<
    ScriptVecObj extends RestrictObj<ScriptObject, GameVector3>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    EngineNum extends RestrictObj<EngineObject, number>,
  >(
    scriptProp: ScriptProp,
    engineProps: (keyof EngineNum)[],
    minVal: number = -Infinity,
    maxVal: number = Infinity,
  ) {
    return this.bindVecToProps<
      GameVector3,
      ScriptVecObj,
      ScriptProp,
      EngineNum,
      typeof Vec3Schema
    >(
      Vec3Schema,
      GameVector3,
      scriptProp,
      ['x', 'y', 'z'],
      engineProps,
      minVal,
      maxVal,
    );
  }

  public xyz<
    ScriptVecObj extends RestrictObj<ScriptObject, GameVector3>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    EngineVecObj extends RestrictObj<
      EngineObject,
      { x: number; y: number; z: number }
    >,
    EngineProp extends RestrictProps<EngineVecObj, any>,
  >(scriptProp: ScriptProp, engineProp: EngineProp) {
    return this.bindVector<
      GameVector3,
      ScriptVecObj,
      ScriptProp,
      { x: number; y: number; z: number },
      EngineVecObj,
      EngineProp,
      typeof Vec3Schema
    >(
      Vec3Schema,
      GameVector3,
      scriptProp,
      ['x', 'y', 'z'],
      engineProp,
      ['x', 'y', 'z'],
      -Infinity,
      Infinity,
    );
  }

  public rgb2rgb<
    ScriptVecObj extends RestrictObj<ScriptObject, GameRGBColor>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    EngineVecObj extends RestrictObj<
      EngineObject,
      { r: number; g: number; b: number }
    >,
    EngineProp extends RestrictProps<EngineVecObj, any>,
  >(scriptProp: ScriptProp, engineProp: EngineProp) {
    return this.bindVector<
      GameRGBColor,
      ScriptVecObj,
      ScriptProp,
      { r: number; g: number; b: number },
      EngineVecObj,
      EngineProp,
      typeof Vec3Schema
    >(
      Vec3Schema,
      GameRGBColor,
      scriptProp,
      ['r', 'g', 'b'],
      engineProp,
      ['r', 'g', 'b'],
      0,
      1,
    );
  }

  public rgba2rgba<
    ScriptVecObj extends RestrictObj<ScriptObject, GameRGBAColor>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    EngineVecObj extends RestrictObj<
      EngineObject,
      { r: number; g: number; b: number; a: number }
    >,
    EngineProp extends RestrictProps<EngineVecObj, any>,
  >(scriptProp: ScriptProp, engineProp: EngineProp) {
    return this.bindVector<
      GameRGBAColor,
      ScriptVecObj,
      ScriptProp,
      { r: number; g: number; b: number; a: number },
      EngineVecObj,
      EngineProp,
      typeof Vec4Schema
    >(
      Vec4Schema,
      GameRGBAColor,
      scriptProp,
      ['r', 'g', 'b', 'a'],
      engineProp,
      ['r', 'g', 'b', 'a'],
      0,
      1,
    );
  }

  public light<
    ScriptVecObj extends RestrictObj<ScriptObject, GameRGBColor>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    EngineVecObj extends RestrictObj<
      EngineObject,
      { r: number; g: number; b: number }
    >,
    EngineProp extends RestrictProps<EngineVecObj, any>,
  >(scriptProp: ScriptProp, engineProp: EngineProp) {
    return this.bindVector<
      GameRGBColor,
      ScriptVecObj,
      ScriptProp,
      { r: number; g: number; b: number },
      EngineVecObj,
      EngineProp,
      typeof Vec3Schema
    >(
      Vec3Schema,
      GameRGBColor,
      scriptProp,
      ['r', 'g', 'b'],
      engineProp,
      ['r', 'g', 'b'],
      0,
      Infinity,
    );
  }

  public rgb<
    ScriptVecObj extends RestrictObj<ScriptObject, GameRGBColor>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    EngineVecObj extends RestrictObj<EngineObject, vec3>,
    EngineProp extends RestrictProps<EngineVecObj, any>,
  >(scriptProp: ScriptProp, engineProp: EngineProp) {
    return this.bindVector<
      GameRGBColor,
      ScriptVecObj,
      ScriptProp,
      vec3,
      EngineVecObj,
      EngineProp,
      typeof Vec3Schema
    >(
      Vec3Schema,
      GameRGBColor,
      scriptProp,
      ['r', 'g', 'b'],
      engineProp,
      [0, 1, 2],
      0,
      1,
    );
  }

  public rgba<
    ScriptVecObj extends RestrictObj<ScriptObject, GameRGBAColor>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    EngineVecObj extends RestrictObj<EngineObject, vec4>,
    EngineProp extends RestrictProps<EngineVecObj, any>,
  >(scriptProp: ScriptProp, engineProp: EngineProp) {
    return this.bindVector<
      GameRGBAColor,
      ScriptVecObj,
      ScriptProp,
      vec4,
      EngineVecObj,
      EngineProp,
      typeof Vec4Schema
    >(
      Vec4Schema,
      GameRGBAColor,
      scriptProp,
      ['r', 'g', 'b', 'a'],
      engineProp,
      [0, 1, 2, 3],
      0,
      1,
    );
  }

  public propQuat<
    ScriptVecObj extends RestrictObj<ScriptObject, GameQuaternion>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    EngineNums extends RestrictObj<EngineObject, number>,
    EngineProp extends RestrictProps<EngineNums, any>,
  >(scriptProp: ScriptProp, engineProps: EngineProp[]) {
    const binding = this.bindVecToProps<
      GameQuaternion,
      ScriptVecObj,
      ScriptProp,
      EngineNums,
      typeof QuatSchema
    >(
      QuatSchema,
      GameQuaternion,
      scriptProp,
      ['w', 'x', 'y', 'z'],
      engineProps,
      -Infinity,
      Infinity,
    );
    const originalPostTick = binding.emitPostTick;
    binding.emitPostTick = (
      check,
      delta,
      scriptObj,
      engineObj,
      _,
      checkFlag,
      patchVar,
    ) => {
      originalPostTick(
        check,
        delta,
        scriptObj,
        engineObj,
        _,
        checkFlag,
        patchVar,
      );

      // add an extra call to normalize after quat is serialized
      const normalize = delta.inject(quat.normalize);
      delta.push(`${normalize}(${patchVar}, ${patchVar})`);
    };
    binding.name = `prop quat ${scriptProp} : ${engineProps.join()}`;
    return binding;
  }

  public bounds<
    ScriptVecObj extends RestrictObj<ScriptObject, GameBounds3>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    EngineVecObj extends RestrictObj<
      EngineObject,
      typeof BoundsSchema.identity
    >,
    EngineProp extends RestrictProps<EngineVecObj, any>,
  >(
    scriptProp: ScriptProp,
    engineProp: EngineProp,
  ): Binding<ScriptObject, EngineObject, MuSchema<{ lo: vec3; hi: vec3 }>> {
    return {
      name: `bounds, ${scriptProp}::${engineProp}`,

      schema: BoundsSchema,

      emitPreTick: (block, scriptObj, engineObj) => {
        const ctor = block.inject(GameBounds3);
        const vec3Ctor = block.inject(GameVector3);
        const scriptVal = block.def();
        const scriptLo = block.def();
        const scriptHi = block.def();
        const engineVal = block.def();
        const engineLo = block.def();
        const engineHi = block.def();
        block.push(`
                    ${scriptVal} = ${safePropExpr(scriptObj, scriptProp)};
                    ${engineVal} = ${safePropExpr(engineObj, engineProp)};
                    ${engineLo} = ${engineVal}.lo;
                    ${engineHi} = ${engineVal}.hi;
                    if (${scriptVal} instanceof ${ctor} && ${scriptVal}.lo instanceof ${vec3Ctor} && ${scriptVal}.hi instanceof ${vec3Ctor}) {
                        ${scriptLo} = ${scriptVal}.lo;
                        ${scriptLo}.x = ${engineLo}[0];
                        ${scriptLo}.y = ${engineLo}[1];
                        ${scriptLo}.z = ${engineLo}[2];
                        ${scriptHi} = ${scriptVal}.hi;
                        ${scriptHi}.x = ${engineHi}[0];
                        ${scriptHi}.y = ${engineHi}[1];
                        ${scriptHi}.z = ${engineHi}[2];
                    } else {
                        ${safePropExpr(scriptObj, scriptProp)} = new ${ctor}(
                            new ${vec3Ctor}(${engineLo}[0], ${engineLo}[1], ${engineLo}[2]),
                            new ${vec3Ctor}(${engineHi}[0], ${engineHi}[1], ${engineHi}[2]));
                    }`);
      },

      emitPostTick: (
        check,
        delta,
        scriptObj,
        engineObj,
        _,
        checkFlag,
        patchVar,
      ) => {
        // check phase
        const scriptVal = check.def();
        const scriptLo = check.def();
        const scriptHi = check.def();
        const engineVal = check.def();
        const engineLo = check.def();
        const engineHi = check.def();
        const lox = check.def();
        const loy = check.def();
        const loz = check.def();
        const hix = check.def();
        const hiy = check.def();
        const hiz = check.def();
        check.push(`
                    ${scriptVal} = ${safePropExpr(scriptObj, scriptProp)};
                    ${scriptLo} = ${scriptVal}.lo;
                    if (${scriptLo}) {
                        ${lox} = ${safeReadNumExpr(
          scriptLo + '.x',
          -Infinity,
          Infinity,
        )};
                        ${loy} = ${safeReadNumExpr(
          scriptLo + '.y',
          -Infinity,
          Infinity,
        )};
                        ${loz} = ${safeReadNumExpr(
          scriptLo + '.z',
          -Infinity,
          Infinity,
        )};
                    } else {
                        ${lox} = ${loy} = ${loz} = 0;
                    }
                    ${scriptHi} = ${scriptVal}.hi;
                    if (${scriptHi}) {
                        ${hix} = ${safeReadNumExpr(
          scriptHi + '.x',
          -Infinity,
          Infinity,
        )};
                        ${hiy} = ${safeReadNumExpr(
          scriptHi + '.y',
          -Infinity,
          Infinity,
        )};
                        ${hiz} = ${safeReadNumExpr(
          scriptHi + '.z',
          -Infinity,
          Infinity,
        )};
                    } else {
                        ${hix} = ${hiy} = ${hiz} = 0;
                    }
                    ${engineVal} = ${safePropExpr(engineObj, engineProp)};
                    ${engineLo} = ${engineVal}.lo;
                    ${engineHi} = ${engineVal}.hi;
                    ${checkFlag} =
                        (${lox} !== ${engineLo}[0]) ||
                        (${loy} !== ${engineLo}[1]) ||
                        (${loz} !== ${engineLo}[2]) ||
                        (${hix} !== ${engineHi}[0]) ||
                        (${hiy} !== ${engineHi}[1]) ||
                        (${hiz} !== ${engineHi}[2]);`);

        // patch phase
        const schemaRef = delta.inject(BoundsSchema);
        delta.push(`
                    ${patchVar} = ${schemaRef}.alloc();
                    ${patchVar}.lo[0] = ${lox};
                    ${patchVar}.lo[1] = ${loy};
                    ${patchVar}.lo[2] = ${loz};
                    ${patchVar}.hi[0] = ${hix};
                    ${patchVar}.hi[1] = ${hiy};
                    ${patchVar}.hi[2] = ${hiz};`);
      },

      emitSynchronize: (block, engineObj, patchVar) => {
        const schemaRef = block.inject(BoundsSchema);
        block.push(
          `${schemaRef}.assign(${safePropExpr(
            engineObj,
            engineProp,
          )}, ${patchVar});`,
        );
      },
    };
  }

  public zoneBounds<
    ScriptVecObj extends RestrictObj<ScriptObject, GameBounds3>,
    ScriptProp extends RestrictProps<ScriptVecObj, any>,
    EngineNums extends RestrictObj<EngineObject, number>,
    EngineProp extends RestrictProps<EngineNums, any>,
  >(
    scriptProp: ScriptProp,
    minX: EngineProp,
    minY: EngineProp,
    minZ: EngineProp,
    maxX: EngineProp,
    maxY: EngineProp,
    maxZ: EngineProp,
  ): Binding<ScriptObject, EngineObject, MuSchema<{ lo: vec3; hi: vec3 }>> {
    return {
      name: `bounds, ${scriptProp}::[${minX},${minY},${minZ},${maxX},${maxY},${maxZ}]`,

      schema: BoundsSchema,

      emitPreTick: (block, scriptObj, engineObj) => {
        const ctor = block.inject(GameBounds3);
        const vec3Ctor = block.inject(GameVector3);
        const scriptVal = block.def();
        const scriptLo = block.def();
        const scriptHi = block.def();
        block.push(`
                    ${scriptVal} = ${safePropExpr(scriptObj, scriptProp)};
                    if (${scriptVal} instanceof ${ctor} && ${scriptVal}.lo instanceof ${vec3Ctor} && ${scriptVal}.hi instanceof ${vec3Ctor}) {
                        ${scriptLo} = ${scriptVal}.lo;
                        ${scriptLo}.x = ${safePropExpr(engineObj, minX)};
                        ${scriptLo}.y = ${safePropExpr(engineObj, minY)};
                        ${scriptLo}.z = ${safePropExpr(engineObj, minZ)};
                        ${scriptHi} = ${scriptVal}.hi;
                        ${scriptHi}.x = ${safePropExpr(engineObj, maxX)};
                        ${scriptHi}.y = ${safePropExpr(engineObj, maxY)};
                        ${scriptHi}.z = ${safePropExpr(engineObj, maxZ)};
                    } else {
                        ${safePropExpr(scriptObj, scriptProp)} = new ${ctor}(
                            new ${vec3Ctor}(${safePropExpr(
          engineObj,
          minX,
        )}, ${safePropExpr(engineObj, minY)}, ${safePropExpr(engineObj, minZ)}),
                            new ${vec3Ctor}(${safePropExpr(
          engineObj,
          maxX,
        )}, ${safePropExpr(engineObj, maxY)}, ${safePropExpr(
          engineObj,
          maxZ,
        )}));
                    }`);
      },

      emitPostTick: (
        check,
        delta,
        scriptObj,
        engineObj,
        _,
        checkFlag,
        patchVar,
      ) => {
        // check phase
        const scriptVal = check.def();
        const scriptLo = check.def();
        const scriptHi = check.def();
        const lox = check.def();
        const loy = check.def();
        const loz = check.def();
        const hix = check.def();
        const hiy = check.def();
        const hiz = check.def();
        check.push(`
                    ${scriptVal} = ${safePropExpr(scriptObj, scriptProp)};
                    ${scriptLo} = ${scriptVal}.lo;
                    if (${scriptLo}) {
                        ${lox} = ${safeReadNumExpr(
          scriptLo + '.x',
          -Infinity,
          Infinity,
        )};
                        ${loy} = ${safeReadNumExpr(
          scriptLo + '.y',
          -Infinity,
          Infinity,
        )};
                        ${loz} = ${safeReadNumExpr(
          scriptLo + '.z',
          -Infinity,
          Infinity,
        )};
                    } else {
                        ${lox} = ${loy} = ${loz} = 0;
                    }
                    ${scriptHi} = ${scriptVal}.hi;
                    if (${scriptHi}) {
                        ${hix} = ${safeReadNumExpr(
          scriptHi + '.x',
          -Infinity,
          Infinity,
        )};
                        ${hiy} = ${safeReadNumExpr(
          scriptHi + '.y',
          -Infinity,
          Infinity,
        )};
                        ${hiz} = ${safeReadNumExpr(
          scriptHi + '.z',
          -Infinity,
          Infinity,
        )};
                    } else {
                        ${hix} = ${hiy} = ${hiz} = 0;
                    }
                    ${checkFlag} =
                        (${lox} !== ${safePropExpr(engineObj, minX)}) ||
                        (${loy} !== ${safePropExpr(engineObj, minY)}) ||
                        (${loz} !== ${safePropExpr(engineObj, minZ)}) ||
                        (${hix} !== ${safePropExpr(engineObj, maxX)}) ||
                        (${hiy} !== ${safePropExpr(engineObj, maxY)}) ||
                        (${hiz} !== ${safePropExpr(engineObj, maxZ)});`);

        // patch phase
        const schemaRef = delta.inject(BoundsSchema);
        delta.push(`
                    ${patchVar} = ${schemaRef}.alloc();
                    ${patchVar}.lo[0] = ${lox};
                    ${patchVar}.lo[1] = ${loy};
                    ${patchVar}.lo[2] = ${loz};
                    ${patchVar}.hi[0] = ${hix};
                    ${patchVar}.hi[1] = ${hiy};
                    ${patchVar}.hi[2] = ${hiz};`);
      },

      emitSynchronize: (block, engineObj, patchVar) => {
        block.push(`
                    ${safePropExpr(engineObj, minX)} = ${patchVar}.lo[0];
                    ${safePropExpr(engineObj, minY)} = ${patchVar}.lo[1];
                    ${safePropExpr(engineObj, minZ)} = ${patchVar}.lo[2];
                    ${safePropExpr(engineObj, maxX)} = ${patchVar}.hi[0];
                    ${safePropExpr(engineObj, maxY)} = ${patchVar}.hi[1];
                    ${safePropExpr(engineObj, maxZ)} = ${patchVar}.hi[2];`);
      },
    };
  }

  public mesh<
    ScriptProp extends RestrictProps<ScriptObject, string>,
    EngineProp extends RestrictProps<EngineObject, number>,
  >(
    scriptProp: ScriptProp,
    engineProp: EngineProp,
  ): Binding<ScriptObject, EngineObject, MuSchema<number>> {
    return {
      name: 'mesh',
      schema: new MuVarint(),

      emitPreTick: (block, scriptObj, engineObj, resources) => {
        block.push(
          `${safePropExpr(
            scriptObj,
            scriptProp,
          )} = ${resources}.getMeshFileName(${safePropExpr(
            engineObj,
            engineProp,
          )});`,
        );
      },

      emitPostTick: (
        check,
        _,
        scriptObj,
        engineObj,
        resources,
        checkFlag,
        patchVar,
      ) => {
        check.push(`
                    ${patchVar} = ${resources}.getMeshId(${safeReadStrExpr(
          safePropExpr(scriptObj, scriptProp),
        )});
                    ${checkFlag} = ${patchVar} !== ${safePropExpr(
          engineObj,
          engineProp,
        )};`);
      },

      emitSynchronize: (block, engineObj, patchVar) => {
        block.push(`${safePropExpr(engineObj, engineProp)} = ${patchVar};`);
      },
    };
  }

  public asset<
    ScriptProp extends RestrictProps<ScriptObject, string>,
    EngineProp extends RestrictProps<EngineObject, string>,
  >(
    scriptProp: ScriptProp,
    engineProp: EngineProp,
    type: GameAssetType,
  ): Binding<ScriptObject, EngineObject, MuSchema<string>> {
    return {
      name: `asset ${type}, ${scriptProp}::${engineProp}`,

      schema: HashSchema,

      emitPreTick: (block, scriptObj, engineObj, resources) => {
        block.push(
          `${safePropExpr(
            scriptObj,
            scriptProp,
          )} = ${resources}.resolveHash(${safePropExpr(
            engineObj,
            engineProp,
          )});`,
        );
      },

      emitPostTick: (
        check,
        _,
        scriptObj,
        engineObj,
        resources,
        checkFlag,
        patchVar,
      ) => {
        const assetRef = check.def();
        check.push(`
                    ${assetRef} = ${safePropExpr(
          resources,
          'pathToHash',
        )}[${safeReadStrExpr(safePropExpr(scriptObj, scriptProp))}];
                    if (${assetRef} && ${assetRef}.type === '${type}') {
                        ${patchVar} = ${assetRef}.hash;
                    } else {
                        ${patchVar} = '';
                    }
                    ${checkFlag} = ${patchVar} !== ${safePropExpr(
          engineObj,
          engineProp,
        )};`);
      },

      emitSynchronize: (block, engineObj, patchVar) => {
        block.push(`${safePropExpr(engineObj, engineProp)} = ${patchVar};`);
      },
    };
  }

  public skin<
    ScriptProp extends RestrictProps<ScriptObject, GameSkin>,
    EngineProp extends RestrictProps<EngineObject, PlayerSkinId>,
  >(
    scriptProp: ScriptProp,
    engineProp: EngineProp,
  ): Binding<ScriptObject, EngineObject, MuSchema<PlayerSkinId>> {
    return {
      name: 'skin',

      schema: PlayerSkinIdSchema,

      emitPreTick: (block, scriptObj, engineObj, resources) => {
        const engineSkin = block.def();
        const scriptSkin = block.def();

        block.push(`
          if (typeof ${safePropExpr(scriptObj, scriptProp)} !== 'object') {
            ${safePropExpr(scriptObj, scriptProp)} = {};
          }
          ${engineSkin} = ${safePropExpr(engineObj, engineProp)};
          ${scriptSkin} = ${safePropExpr(scriptObj, scriptProp)};`);

        Object.keys(PlayerSkinIdSchema.identity).forEach((partName) => {
          block.push(
            `
            ${safePropExpr(
              scriptSkin,
              partName,
            )} = ${resources}.getSkinFileName(${safePropExpr(
              engineSkin,
              partName,
            )});
            `,
          );
        });
      },

      emitPostTick: (
        check,
        delta,
        scriptObj,
        engineObj,
        resources,
        checkFlag,
        patch,
      ) => {
        const schemaRef = delta.inject(PlayerSkinIdSchema);
        const engineSkin = delta.def();
        const scriptSkin = delta.def();
        check.push(`
          ${patch} = ${schemaRef}.alloc();
          ${engineSkin} = ${safePropExpr(engineObj, engineProp)};
          ${scriptSkin} = ${safePropExpr(scriptObj, scriptProp)};
        `);
        Object.keys(PlayerSkinIdSchema.identity).forEach((partName) => {
          check.push(`
          try {
            ${safePropExpr(
              patch,
              partName,
            )} = ${resources}.getSkinId(${safePropExpr(scriptSkin, partName)});
          } catch (err) {
            console.warn(err.message);
            ${safePropExpr(patch, partName)} = ${safePropExpr(
            engineSkin,
            partName,
          )};
          }`);
        });
        check.push(
          ` ${checkFlag} = !${schemaRef}.equal(${patch},  ${safePropExpr(
            engineObj,
            engineProp,
          )});`,
        );
      },

      emitSynchronize: (block, engineObj, patch) => {
        const schemaRef = block.inject(PlayerSkinIdSchema);
        block.push(
          `${schemaRef}.assign(${safePropExpr(
            engineObj,
            engineProp,
          )}, ${patch});`,
        );
      },
    };
  }

  public entity<
    ScriptProp extends RestrictProps<ScriptObject, GameEntity | null>,
    EngineProp extends RestrictProps<EngineObject, number>,
  >(
    scriptProp: ScriptProp,
    engineProp: EngineProp,
  ): Binding<ScriptObject, EngineObject, MuSchema<number>> {
    return {
      name: `entity, ${scriptProp}::${engineProp}`,

      schema: new MuUint32(),

      emitPreTick: (block, scriptObj, engineObj) => {
        const entityIndex = block.inject(ENTITY_INDEX);
        const entityVal = block.def();
        block.push(`
                    ${entityVal} = ${entityIndex}.get(${safePropExpr(
          engineObj,
          engineProp,
        )});
                    if (${entityVal}) {
                        ${safePropExpr(
                          scriptObj,
                          scriptProp,
                        )} = ${entityVal}.entity;
                    } else {
                        ${safePropExpr(scriptObj, scriptProp)} = null;
                    }`);
      },

      emitPostTick: (
        check,
        _0,
        scriptObj,
        engineObj,
        _1,
        checkFlag,
        patchVar,
      ) => {
        const wrapperIndex = check.inject(WRAPPER_INDEX);
        const wrapperRef = check.def();
        check.push(`
                    ${wrapperRef} = ${wrapperIndex}.get(${safePropExpr(
          scriptObj,
          scriptProp,
        )});
                    if (${wrapperRef}) {
                        ${patchVar} = ${wrapperRef}.id;
                    } else {
                        ${patchVar} = 0;
                    }
                    ${checkFlag} = ${patchVar} !== ${safePropExpr(
          engineObj,
          engineProp,
        )};`);
      },

      emitSynchronize: (block, engineObj, patchVar) => {
        block.push(`${safePropExpr(engineObj, engineProp)} = ${patchVar};`);
      },
    };
  }

  public sound<
    ScriptSoundObj extends RestrictObj<ScriptObject, GameSoundEffect>,
    ScriptProp extends RestrictProps<ScriptSoundObj, any>,
    EngineSoundObj extends RestrictObj<
      EngineObject,
      typeof AudioSampleRDA.stateSchema.identity
    >,
    EngineProp extends RestrictProps<EngineSoundObj, any>,
  >(
    scriptProp: ScriptProp,
    engineProp: EngineProp,
  ): Binding<
    ScriptObject,
    EngineObject,
    MuSchema<typeof AudioSampleRDA.stateSchema.identity>
  > {
    return {
      name: `sfx, ${scriptProp}::${engineProp}`,

      schema: AudioSampleRDA.stateSchema,

      emitPreTick: (block, scriptObj, engineObj) => {
        const ctor = block.inject(GameSoundEffect);
        const scriptRef = block.def();
        const engineRef = block.def();
        block.push(`
                    if (!(${safePropExpr(
                      scriptObj,
                      scriptProp,
                    )} instanceof ${ctor})) {
                        ${safePropExpr(scriptObj, scriptProp)} = new ${ctor}();
                    }
                    ${scriptRef} = ${safePropExpr(scriptObj, scriptProp)};
                    ${engineRef} = ${safePropExpr(engineObj, engineProp)};
                    ${scriptRef}.sample = ${engineRef}.sample;
                    ${scriptRef}.radius = ${engineRef}.radius;
                    ${scriptRef}.gain = ${engineRef}.gain;
                    ${scriptRef}.gainRange = ${engineRef}.gainRange;
                    ${scriptRef}.pitch = ${engineRef}.pitch;
                    ${scriptRef}.pitchRange = ${engineRef}.pitchRange;
                `);
      },

      emitPostTick: (
        check,
        delta,
        scriptObj,
        engineObj,
        resources,
        checkFlag,
        patchVar,
      ) => {
        const scriptRef = check.def();
        const sample = check.def();
        const radius = check.def();
        const gain = check.def();
        const gainRange = check.def();
        const pitch = check.def();
        const pitchRange = check.def();
        const engineRef = check.def();

        check.push(`
                    ${scriptRef} = ${safePropExpr(scriptObj, scriptProp)};
                    if (typeof ${scriptRef} === 'object') {
                        ${sample} = ${safeReadStrExpr(scriptRef + '.sample')};
                        ${radius} = ${safeReadNumExpr(
          scriptRef + '.radius',
          0,
          Infinity,
        )};
                        ${gain} = ${safeReadNumExpr(
          scriptRef + '.gain',
          0,
          Infinity,
        )};
                        ${gainRange} = ${safeReadNumExpr(
          scriptRef + '.gainRange',
          0,
          Infinity,
        )};
                        ${pitch} = ${safeReadNumExpr(
          scriptRef + '.pitch',
          0.125,
          Infinity,
        )};
                        ${pitchRange} = ${safeReadNumExpr(
          scriptRef + '.pitchRange',
          0,
          Infinity,
        )};
                    } else {
                        if (typeof ${scriptRef} === 'string') {
                            ${sample} = ${scriptRef};
                        } else {
                            ${sample} = '';
                        }
                        ${gain} = ${pitch} = 1;
                        ${radius} = ${gainRange} = ${gainRange} = 0;
                    }
                    if (!${sample} || !${resources}.resolveAsset(${sample}, '${
          GameAssetType.SOUND
        }')) {
                        ${sample} = '';
                    }
                    ${engineRef} = ${safePropExpr(engineObj, engineProp)};
                    ${checkFlag} =
                        (${sample} !== ${engineRef}.sample) ||
                        (${radius} !== ${engineRef}.radius) ||
                        (${gain} !== ${engineRef}.gain) ||
                        (${pitch} !== ${engineRef}.pitch) ||
                        (${gainRange} !== ${engineRef}.gainRange) ||
                        (${pitchRange} !== ${engineRef}.pitchRange);`);

        const schemaRef = delta.inject(AudioSampleRDA.stateSchema);
        delta.push(`
                    ${patchVar} = ${schemaRef}.alloc();
                    ${patchVar}.sample = ${sample};
                    ${patchVar}.radius = ${radius};
                    ${patchVar}.gain = ${gain};
                    ${patchVar}.gainRange = ${gainRange};
                    ${patchVar}.pitch = ${pitch};
                    ${patchVar}.pitchRange = ${pitchRange};`);
      },

      emitSynchronize: (block, engineObj, patchVar) => {
        const schemaRef = block.inject(AudioSampleRDA.stateSchema);
        block.push(
          `${schemaRef}.assign(${safePropExpr(
            engineObj,
            engineProp,
          )}, ${patchVar});`,
        );
      },
    };
  }

  public enum<
    ScriptProp extends RestrictProps<ScriptObject, string>,
    EngineProp extends RestrictProps<EngineObject, number>,
  >(
    scriptProp: ScriptProp,
    engineProp: EngineProp,
    fieldNames: { [field: string]: number },
  ): Binding<ScriptObject, EngineObject, MuSchema<number>> {
    return {
      name: `enum, ${scriptProp}::${engineProp}`,

      schema: new MuVarint(),

      emitPreTick: (block, scriptObj, engineObj) => {
        block.push(`switch (${safePropExpr(scriptObj, scriptProp)}) {`);
        Object.keys(fieldNames).forEach((field) => {
          block.push(`
                        case ${fieldNames[field]}:
                            ${safePropExpr(engineObj, engineProp)} = '${field}';
                            break;`);
        });
        block.push('}');
      },

      emitPostTick: (
        check,
        delta,
        scriptObj,
        engineObj,
        resources,
        checkFlag,
        patchVar,
      ) => {
        check.push(
          `switch (${safeReadStrExpr(
            safePropExpr(scriptObj, scriptProp),
          )}.toLowerCase()) {`,
        );
        Object.keys(fieldNames).forEach((field) => {
          check.push(`
                        case '${field}':
                            ${patchVar} = ${fieldNames[field]};
                            break;`);
        });
        check.push(`
                    default:
                        ${patchVar} = ${safePropExpr(engineObj, engineProp)};
                        break;
                    }
                    ${checkFlag} = ${patchVar} !== ${safePropExpr(
          engineObj,
          engineProp,
        )};`);
      },

      emitSynchronize: (block, engineObj, patchVar) => {
        block.push(`${safePropExpr(engineObj, engineProp)} = ${patchVar};`);
      },
    };
  }

  public gamepad<
    ScriptProp extends RestrictProps<ScriptObject, Gamepad>,
    EngineProp extends RestrictProps<EngineObject, PlayerGamepad>,
  >(
    scriptProp: ScriptProp,
    engineProp: EngineProp,
    type: GameAssetType,
  ): Binding<ScriptObject, EngineObject, MuSchema<PlayerGamepad>> {
    return {
      name: `asset ${type}, ${scriptProp}::${engineProp}`,

      schema: PlayerGamepadSchema,

      emitPreTick: (block, scriptObj, engineObj, resources) => {
        const engineGamepad = block.def();
        const scriptGamepad = block.def();

        block.push(`
          if (typeof ${safePropExpr(scriptObj, scriptProp)} !== 'object') {
            ${safePropExpr(scriptObj, scriptProp)} = {};
          }
          ${engineGamepad} = ${safePropExpr(engineObj, engineProp)};
          ${scriptGamepad} = ${safePropExpr(scriptObj, scriptProp)};`);

        Object.keys(PlayerGamepadSchema.identity).forEach((partName) => {
          block.push(
            `
            ${safePropExpr(
              scriptGamepad,
              partName,
            )} = ${resources}.resolveHash(${safePropExpr(
              engineGamepad,
              partName,
            )});
            `,
          );
        });
      },
      emitPostTick: (
        check,
        delta,
        scriptObj,
        engineObj,
        resources,
        checkFlag,
        patch,
      ) => {
        const schemaRef = delta.inject(PlayerGamepadSchema);
        const engineGamepad = delta.def();
        const scriptGamepad = delta.def();
        const defaultGamepad = delta.def();
        const path = delta.def();
        const res = delta.def();
        check.push(`
          ${patch} = ${schemaRef}.alloc();
          ${engineGamepad} = ${safePropExpr(engineObj, engineProp)};
          ${scriptGamepad} = ${safePropExpr(scriptObj, scriptProp)};
          ${defaultGamepad} = ${safePropExpr(resources, 'defaultGamepadPath')};
        `);

        Object.keys(PlayerGamepadSchema.identity).forEach((partName) => {
          check.push(`
            ${path} = ${safePropExpr(scriptGamepad, partName)} 
                    || ${safePropExpr(defaultGamepad, partName)};
            ${res} = ${resources}.resolveAsset(${path},GameAssetType.PICTURE);
            if(${res}){
              ${safePropExpr(patch, partName)} = ${res};
            }
          `);
        });
        check.push(
          ` ${checkFlag} = !${schemaRef}.equal(${patch},  ${safePropExpr(
            engineObj,
            engineProp,
          )});`,
        );
      },
      emitSynchronize: (block, engineObj, patch) => {
        const schemaRef = block.inject(PlayerGamepadSchema);
        block.push(
          `${schemaRef}.assign(${safePropExpr(
            engineObj,
            engineProp,
          )}, ${patch});`,
        );
      },
    };
  }
}
