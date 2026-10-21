import {
  IconBasic,
  IconDelete,
  IconEffect,
  IconFilter,
  IconLoading,
  IconMusic,
  IconPhysics,
  IconSunshine,
} from '@box/icons/build';
import { AssetType } from '@box/schema/project/project-rda';
import { getById } from '@box/utils/id';
import type { JSX } from 'react';
import * as React from 'react';
import { IntlShape, injectIntl } from 'react-intl';
import imgScene from 'src/assets/img_scene.png';
import { editor } from 'src/client/edit/edit-client';
import { EditorUIEvent } from 'src/client/edit/schema';
import { BAKE_CHUNK_SHIFT, bakeShadow } from 'src/engine/utils/shadow';
import { calc_class_name } from 'src/utils/classname';
import { rgbToColor } from 'src/utils/color';
import { hashURL } from 'src/utils/hash-url';
import { hourMinuteToNumber, numberToHourMinute } from 'src/utils/time';
import { Button } from 'src/views/components/edit/button';
import {
  NumberProperty,
  RadioProperty,
} from '../../../components/edit/property';
import { Image } from '../../../components/image';
import { DetailPanel } from '../detailPanel/index';
import { RainDirectionPicker } from '../rainDirection';
import CollisionPanel from './collisionFilterGroupPanel';
import { GeneralSetting } from './generalSetting';
import style from './index.module.css';
import { SoundEffect } from './soundEffect';

enum EnvSettingType {
  Tone,
  Physics,
  Time,
  Effect,
}

type envSettings = {
  gravity: number;
  wind: number;
  timeOfDay: number;
  staticTime: boolean;
};

enum EffectType {
  snow = 1,
  fog = 2,
  rain = 3,
  // lighting,
}

type direction = {
  x: number;
  y: number;
  z: number;
};

type Props = {
  intl: IntlShape;
  isRunning: boolean;
  showMusicLibrary: (param: [EditorUIEvent, string[]]) => void;
};

enum physicsPanelType {
  Normal,
  CollisionFilter,
}

type State = {
  isStatic: boolean;
  sunPhase: number;
  sunFrequency: number;
  /**
   * @deprecated
   * 月相暂时无用，可能未来可期
   * 先删除面板设置，后续观察
   */
  lunarPhase: number;
  useGlobalLight: boolean;
  globalLight: number;
  velocityDamping: number;
  gravity: number;
  onEffectPage: EffectType;
  snowSpeed: number;
  snowDensity: number;
  snowColor: string;
  rainSize: number;
  rainDensity: number;
  rainSpeed: number;
  rainColor: string;
  rainInterference: number;
  rainDirection: direction;
  deleteBakedShadow: boolean;
  uploadingBakedShadow: boolean;
  soundEffectTitle: string | JSX.Element;
  physicsPanelType: physicsPanelType;
  collisionEffectTitle: string | JSX.Element;
  gamma: number;
};

export class EnvironmentContainer extends React.Component<Props, State> {
  private _isDragging = false;
  private LUT_PREVIEW: { name: string; value: any }[] = [];
  private SNOW_PREVIEW: { name: string; value: any }[] = [];
  private NORMAL: string = '';

  private detailPanelRef = React.createRef<DetailPanel>();

  constructor(props: Props) {
    super(props);
    const { environment: envState, physics } = editor.state.replica.project;

    this.state = {
      isStatic: envState.sky.sunFrequency === 0,
      sunPhase: envState.sky.sunPhase,
      sunFrequency: envState.sky.sunFrequency,
      lunarPhase: envState.sky.lunarPhase,
      useGlobalLight: !!envState.sky.globalLight,
      globalLight: envState.sky.globalLight,
      gamma: envState.sky.gamma,
      velocityDamping: physics.velocityDamping,
      gravity: physics.gravity,

      onEffectPage: EffectType.snow,
      snowSpeed: 23,
      snowDensity: 50,
      snowColor: '#ffffff',

      rainSize: 0.5,
      rainDensity: 0,
      rainSpeed: 23,
      rainColor: '#ffffff',
      rainInterference: 0,
      rainDirection: { x: 0, y: 1, z: 0 },

      deleteBakedShadow: !!envState.bakedShadow.texture,
      uploadingBakedShadow: false,

      soundEffectTitle: this.props.intl.formatMessage({ id: 'soundEffect' }),

      // collision filter
      physicsPanelType: physicsPanelType.Normal,
      collisionEffectTitle: this.props.intl.formatMessage({ id: 'physics' }),
    };

    // if (!envState.snow.texture) {
    //     this._setSnowColor(this.state.snowColor);
    //     this._setSnowDensity(this.state.snowDensity);
    //     this._setSnowSpeed(this.state.snowSpeed);
    // }
  }

  public componentDidMount() {
    const snowImages: {
      name: string;
      value: string;
    }[] = this.SNOW_PREVIEW;
    const lutPreview: {
      name: string;
      value: string;
    }[] = this.LUT_PREVIEW;
    snowImages.length = lutPreview.length = 0;
    const assets = editor.state.replica.project.assets;
    Object.keys(assets).forEach((name) => {
      const info = assets[name];
      if (info.type === AssetType.COLOR_LUT) {
        lutPreview.push({
          name,
          value: info.previewImage,
        });
      } else if (info.type === AssetType.PARTICLE_TEXTURE) {
        snowImages.push({
          name,
          value: info.previewImage,
        });
      }
    });
    this.NORMAL = this.props.intl.formatMessage({ id: 'primary' });
    lutPreview.unshift({
      name: this.NORMAL,
      value: '',
    });
  }

  public componentWillReceiveProps(nextProps: Props) {
    // TODO: check state更新是否发生变化
    if (!this._isDragging) {
      const { environment: envState, physics } = editor.state.replica.project;

      this.setState({
        sunPhase: envState.sky.sunPhase,
        sunFrequency: envState.sky.sunFrequency,
        lunarPhase: envState.sky.lunarPhase,
        useGlobalLight: !!envState.sky.globalLight,
        globalLight: envState.sky.globalLight,
        gamma: envState.sky.gamma,
        gravity: physics.gravity,
        velocityDamping: physics.velocityDamping,
        snowSpeed: envState.snow.fallSpeed * 100,
        snowDensity: envState.snow.density * 100,
        snowColor: rgbToColor(envState.snow.color),

        rainSize: envState.rain.size.h,
        rainDensity: envState.rain.density * 100,
        rainSpeed: envState.rain.speed * 100,
        rainColor: rgbToColor(envState.rain.color),
        rainInterference: envState.rain.interference,
        rainDirection: envState.rain.direction,

        deleteBakedShadow: !!envState.bakedShadow.texture,
      });
    }
  }

  private _setIsStatic = (isStatic: boolean | string | number) => {
    this.setState({
      isStatic: !!isStatic,
    });
    if (isStatic) {
      editor.envController.setFrequency(0, undefined);
    } else {
      editor.envController.setFrequency(this.state.sunFrequency, undefined);
    }
  };

  private _setSunPhase = (
    v: number | string | boolean,
    final: boolean = false,
  ) => {
    if (typeof v === 'boolean') {
      return;
    }
    let sunPhase = v;
    if (typeof sunPhase === 'string') {
      sunPhase = hourMinuteToNumber(sunPhase, 1, { hour: 6, minute: 0 });
    }
    if (isNaN(sunPhase)) {
      return;
    }
    sunPhase = sunPhase > 1 ? 1 : sunPhase < 0 ? 0 : sunPhase;

    editor.envController.setSunPhase(sunPhase);

    this.setState({
      sunPhase: sunPhase,
    });
  };

  private _setFrequence = (v: number, final: boolean = false) => {
    const clientState = editor.game.state;
    const tick = clientState.clock.tick;
    const timeOfDay = clientState.environment.timeOfDay;
    let sunFreq = v ? v / 100 : 0;
    if (isNaN(sunFreq)) {
      return;
    }
    sunFreq = sunFreq > 0.01 ? 0.01 : sunFreq < 0 ? 0 : sunFreq;
    let targetSunPhase =
      timeOfDay - tick * sunFreq > 0
        ? (timeOfDay - tick * sunFreq) % 1
        : ((timeOfDay - tick * sunFreq) % 1) + 1;
    if (isNaN(targetSunPhase)) {
      return;
    }
    targetSunPhase =
      targetSunPhase > 1 ? 1 : targetSunPhase < 0 ? 0 : targetSunPhase;

    editor.envController.setFrequency(sunFreq, targetSunPhase);

    this.setState({
      sunFrequency: sunFreq,
      sunPhase: targetSunPhase,
    });
  };

  private _setSnowDensity = (v: number) => {
    this.setState({ snowDensity: v });
    editor.envController.setSnowDensity(v / 100);
  };

  private _setSnowSpeed = (v: number) => {
    this.setState({ snowSpeed: v });
    editor.envController.setSnowSpeed(v / 100);
  };

  private _setSnowTexture = (tex: string) => {
    editor.envController.setSnowTexture(tex);
  };

  private _setSnowColor = (v: string) => {
    this.setState({ snowColor: v });
    editor.envController.setSnowColor(v, 1);
  };

  private _setColorLut = (lut: string) => {
    editor.envController.setColorLUT(lut);
  };

  private _setRainDensity = (d: number) => {
    this.setState({ rainDensity: d });
    editor.envController.setRainDensity(d / 100);
  };

  private _setRainSpeed = (v: number) => {
    this.setState({ rainSpeed: v });
    editor.envController.setRainSpeed(v / 100);
  };

  private _setRainColor = (v: string) => {
    this.setState({ rainColor: v });
    editor.envController.setRainColor(v, 1);
  };

  private _setRainSize = (size: number) => {
    this.setState({ rainSize: size });
    editor.envController.setRainSize(size, size);
  };

  private _setRainInterference = (i: number) => {
    this.setState({ rainInterference: i });
    editor.envController.setRainInterference(i);
  };

  private _setRainDirection = (d: direction) => {
    this.setState({ rainDirection: d });
    const { x, y, z } = d;
    editor.envController.setRainDirection(x, y, z);
  };

  private changeCollisionFilterTitle = (title: string | JSX.Element) => {
    this.setState({
      collisionEffectTitle: title,
    });
  };

  private _renderPhysicsSetting = () => {
    const { gravity, velocityDamping } = editor.state.replica.project.physics;
    const render = (type?: physicsPanelType) => {
      switch (type) {
        case physicsPanelType.CollisionFilter: {
          return (
            <CollisionPanel
              setPhysicsPanel={() => {
                this.setState({ physicsPanelType: physicsPanelType.Normal });
              }}
              project={editor.state.replica.project}
              changeTitle={this.changeCollisionFilterTitle}
              updateDetailPanelHeight={
                this.detailPanelRef.current?.updateDetailPanelHeight
              }
              goBack={() => {
                this.setState(
                  { physicsPanelType: physicsPanelType.Normal },
                  () => {
                    this.detailPanelRef.current?.updateDetailPanelHeight();
                  },
                );
              }}
            />
          );
        }
        default: {
          return (
            <div className={style.settingList}>
              {this._renderNumProps(
                true,
                this.props.intl.formatMessage({ id: 'gravity' }),
                gravity,
                editor.envController.setGravity,
                [-1, 1],
                2,
              )}
              {this._renderNumProps(
                true,
                this.props.intl.formatMessage({ id: 'velocityDamping' }),
                velocityDamping,
                editor.envController.setVelocityDamping,
                [0, 1],
              )}
              {
                <div
                  className={style.collisionFilterWrapper}
                  onClick={() => {
                    this.setState({
                      physicsPanelType: physicsPanelType.CollisionFilter,
                    });
                  }}
                >
                  <div className={style.collisionFilter}>
                    {this.props.intl.formatMessage({ id: 'collisionFilter' })}
                  </div>
                  <div className={style.rightArrowIcon}></div>
                </div>
              }
            </div>
          );
        }
      }
    };
    return (
      <div className={style.settingContainer}>
        {render(this.state.physicsPanelType)}
      </div>
    );
  };

  private _renderTimeSetting = () => {
    return (
      <div className={style.settingContainer}>
        <div className={style.settingList}>
          <RadioProperty
            name={
              this.state.isStatic
                ? this.props.intl.formatMessage({ id: 'staticTime' })
                : this.props.intl.formatMessage({ id: 'nonStaticTime' })
            }
            value={this.state.isStatic}
            onChange={this._setIsStatic}
          />
          <NumberProperty
            name={
              this.state.isStatic
                ? this.props.intl.formatMessage({ id: 'timeOfDay' })
                : this.props.intl.formatMessage({ id: 'frequency' })
            }
            value={
              this.state.isStatic
                ? this.state.sunPhase
                : this.state.sunFrequency * 100
            }
            numberFixed={2}
            throttlingDelay={50}
            onChange={(v: number) => {
              if (this.state.isStatic) {
                this._setSunPhase(v, true);
              } else {
                this._setFrequence(+v, true);
              }
            }}
            rawInputMiddleware={(rawInput: string) => {
              return hourMinuteToNumber(rawInput, 1, { hour: 6, minute: 0 });
            }}
            slider={[0, 1]}
            formatValue={
              this.state.isStatic
                ? (n) => numberToHourMinute(n, 1, { hour: 6, minute: 0 })
                : undefined
            }
          />
          <RadioProperty
            name={this.props.intl.formatMessage({ id: 'globalLight' })}
            value={this.state.useGlobalLight}
            onChange={() => {
              editor.envController.setGlobalLight(
                this.state.useGlobalLight ? 0 : 0.3,
              );
              editor.game.voxel.rebuildLightMap(!this.state.useGlobalLight);
            }}
          />
          {this.state.useGlobalLight && (
            <NumberProperty
              name={this.props.intl.formatMessage({ id: 'intensity' })}
              value={this.state.globalLight}
              onChange={(v) => editor.envController.setGlobalLight(v)}
              numberFixed={2}
              throttlingDelay={50}
              slider={[0.01, 0.6]}
            />
          )}
          <NumberProperty
            name={this.props.intl.formatMessage({ id: 'gamma' })}
            value={this.state.gamma}
            onChange={(v) => editor.envController.setGamma(v)}
            slider={[0.7, 5]}
          />
          <div className={style.propertyWrapper}>
            <div className={style.propName}>
              {this.props.intl.formatMessage({ id: 'scene.bakeShadow' })}
            </div>
            <IconDelete
              className={`${style.deleteIcon} ${
                this.state.deleteBakedShadow ? '' : style.disabled
              }`}
              onClick={() => {
                if (!this.state.deleteBakedShadow) {
                  return;
                }
                editor.envController.setBakedShadow({
                  texture: '',
                  data: '',
                  chunkShift: BAKE_CHUNK_SHIFT,
                });
              }}
            />
          </div>
          <Button
            value={
              this.state.uploadingBakedShadow ? (
                <IconLoading className={style.loadingIcon} />
              ) : (
                this.props.intl.formatMessage({
                  id: 'scene.updateBakedShadow',
                })
              )
            }
            style={{ margin: 0, display: 'flex', justifyContent: 'center' }}
            onClick={async () => {
              if (this.state.uploadingBakedShadow) {
                return;
              }

              this.setState({
                uploadingBakedShadow: true,
              });
              try {
                const res = await bakeShadow(editor.game.state);
                const textureHash = await editor.editContentStorage.store(
                  res.texture,
                );
                const dataHash = await editor.editContentStorage.store(
                  res.data,
                );
                editor.envController.setBakedShadow({
                  texture: textureHash,
                  data: dataHash,
                  chunkShift: BAKE_CHUNK_SHIFT,
                });
              } finally {
                this.setState({
                  uploadingBakedShadow: false,
                });
              }
            }}
            fullWidth
          />
        </div>
      </div>
    );
  };

  private transformName = (key: string) => {
    const path = key.split('/');
    return path[path.length - 1].split('.')[0];
  };

  private _renderLutSetting = () => {
    const { player } = editor.state.replica.project;
    const lut = player.colorLUT;
    return (
      <div className={style.settingContainerWrapper}>
        <div className={style.settingGrid}>
          {this.LUT_PREVIEW.map((item, i) => {
            const { name, value } = item;
            const isSelected =
              lut === name || (lut === '' && name === this.NORMAL);
            return (
              <div
                key={value + name}
                className={style.lutImgWrapper}
                onClick={() => this._setColorLut(i === 0 ? '' : name)}
              >
                <Image
                  className={calc_class_name(
                    style.lutImg,
                    isSelected && style.lutImgSelected,
                  )}
                  src={name == this.NORMAL ? imgScene : hashURL(value)}
                  layout="fill"
                />
                <div
                  className={calc_class_name(
                    style.lutName,
                    isSelected && style.lutNameSelected,
                  )}
                >
                  {this.transformName(name)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  private _toggleSnow = () => {
    // FIXME: should just directly use transaction API here
    if (this._isSnowing()) {
      editor.envController.setSnowSize(0, 0);
    } else {
      editor.envController.setSnowSize(1, 0.1);
      const { environment } = editor.state.replica.project;
      if (!environment.snow.texture) {
        this._setSnowColor(this.state.snowColor);
        this._setSnowDensity(this.state.snowDensity);
        this._setSnowSpeed(this.state.snowSpeed);
      }
    }
  };

  private _toggleRain = () => {
    if (this._isRaining()) {
      editor.envController.setRainDensity(0);
    } else {
      editor.envController.setRainDensity(0.8);
    }
  };

  private _setFogDensity = (v: number, final?: boolean) => {
    let density = 0;
    if (v !== 0) {
      density = Math.exp(10 * (v - 1));
    }
    editor.envController.setFogDensity(density, final);
  };

  private _densityToSlider = () => {
    const { environment } = editor.state.replica.project;
    if (environment.fog.fogDensity === 0) {
      return 0;
    }
    return 1 + Math.log(environment.fog.fogDensity) / 10;
  };

  private _isSnowing = () => {
    const { environment } = editor.state.replica.project;
    return environment.snow.size.h * environment.snow.size.w != 0;
  };

  private _isRaining = () => {
    const { environment } = editor.state.replica.project;
    return environment.rain.density != 0;
  };

  private _onDirectionChange = (dire: string, value: number) => {
    if (isNaN(value)) {
      value = 0;
    }
    if (value < -1) {
      value = -1;
    } else if (value > 1) {
      value = 1;
    }
    const newDir = {
      ...this.state.rainDirection,
      [dire]: value,
    };
    this._setRainDirection(newDir);
  };

  private _renderRainDirectionProps = (enabled: boolean) => {
    const direc = ['x', 'y', 'z'];
    const { environment } = editor.state.replica.project;

    return (
      <div className={style.rainDirectionContainer}>
        <RainDirectionPicker
          dX={environment.rain.direction.x}
          dY={environment.rain.direction.y}
          dZ={environment.rain.direction.z}
          disabled={!enabled}
          onChange={(x, y, z) => {
            this._setRainDirection({ x, y, z });
          }}
        />
        <div className={style.rainDirectionItemContainer}>
          {direc.map((item) => {
            return (
              <div className={style.rainDirectionItem} key={item}>
                <NumberProperty
                  disabled={!enabled}
                  name={item}
                  formatValue={(v) => Number(v).toFixed(1)}
                  value={this.state.rainDirection[item]}
                  inputContainerStyle={{ width: '58px' }}
                  onChange={(v) => this._onDirectionChange(item, +v)}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  private changeSoundEffectTitle = (title: string | JSX.Element) => {
    this.setState({
      soundEffectTitle: title,
    });
  };

  private _renderSoundEffect = () => {
    return (
      <SoundEffect
        ambientSound={editor.state.replica.project.ambientSound}
        playerSounds={editor.state.replica.project.player.playerSounds}
        entitySounds={editor.state.replica.project.player.sounds}
        changeTitle={this.changeSoundEffectTitle}
        scrollTo={this.detailPanelRef.current?.scrollTo}
        updateDetailPanelHeight={
          this.detailPanelRef.current?.updateDetailPanelHeight
        }
        showMusicLibrary={this.props.showMusicLibrary}
      />
    );
  };

  private getPlayerPosition = () => {
    const data = getById(editor.game.state.bodies, editor.game.state.secret.id);
    if (!data) {
      return null;
    }
    const { px, py, pz } = data;
    return {
      x: Math.round(px),
      y: Math.round(py),
      z: Math.round(pz),
    };
  };

  private _renderGeneralSetting = () => {
    const { project } = editor.state.replica;

    return (
      <GeneralSetting
        voxelShape={project.voxels.shape}
        spawnPoint={project.player.initialPosition}
        movementBounds={project.player.movementBounds}
        drawDistance={project.environment.drawDistance}
        getPlayerPosition={this.getPlayerPosition}
      />
    );
  };

  private _renderNumProps = (
    enabled: boolean,
    name: string,
    value: number,
    cb: (v: number, final?: boolean) => void,
    range: [number, number],
    numberFixed = 1,
  ) => {
    return (
      <NumberProperty
        disabled={!enabled}
        name={name}
        numberFixed={numberFixed}
        value={value}
        onChange={(v) => {
          cb(+v, true);
        }}
        slider={range}
      />
    );
  };

  private _renderEffect = () => {
    const { environment } = editor.state.replica.project;
    const effectBody: { [type in EffectType]: () => JSX.Element } = {
      [EffectType.snow]: () => {
        const isSnowing = this._isSnowing();
        const disabledStyle = isSnowing ? '' : style.disabled;
        return (
          <div className={style.effectContent}>
            <RadioProperty
              name={this.props.intl.formatMessage({ id: 'snow' })}
              nameStyle={{ color: 'var(--color-white)' }}
              value={isSnowing}
              onChange={this._toggleSnow}
            />
            <div className={style.paramsContainer}>
              {this._renderNumProps(
                isSnowing,
                this.props.intl.formatMessage({ id: 'speed' }),
                this.state.snowSpeed,
                this._setSnowSpeed,
                [-100, 100],
              )}
              {this._renderNumProps(
                isSnowing,
                this.props.intl.formatMessage({ id: 'density' }),
                this.state.snowDensity,
                this._setSnowDensity,
                [0.1, 100],
              )}
              <div className={style.item}>
                <div className={calc_class_name(style.title, disabledStyle)}>
                  {this.props.intl.formatMessage({ id: 'color' })}
                </div>
                <input
                  type="color"
                  disabled={!isSnowing}
                  className={calc_class_name(style.colorPicker, disabledStyle)}
                  value={this.state.snowColor}
                  onChange={(ev) => this._setSnowColor(ev.target.value)}
                ></input>
              </div>
              <div className={calc_class_name(style.title, disabledStyle)}>
                {this.props.intl.formatMessage({ id: 'texture' })}
              </div>
              <div className={style.grid}>
                {this.SNOW_PREVIEW.map(({ name, value }, i) => (
                  <div
                    key={i}
                    onClick={() => isSnowing && this._setSnowTexture(name)}
                    className={calc_class_name(
                      environment.snow.texture === name
                        ? style.snowTextureSelected
                        : style.snowTexture,
                      disabledStyle,
                    )}
                  >
                    <img src={hashURL(value)}></img>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      },
      [EffectType.fog]: () => {
        const envState = environment;
        const formatedDensity = this._densityToSlider();
        return (
          <div className={style.effectContent}>
            <div className={style.effectName}>
              {this.props.intl.formatMessage({ id: 'fog' })}
            </div>
            <div className={style.item}>
              <div className={style.title}>
                {this.props.intl.formatMessage({ id: 'color' })}
              </div>
              <input
                type="color"
                className={style.colorPicker}
                value={rgbToColor(envState.fog.fogColor)}
                onChange={(ev) =>
                  editor.envController.setFogColor(ev.target.value)
                }
              ></input>
            </div>
            <div className={style.paramsContainer}>
              {this._renderNumProps(
                true,
                this.props.intl.formatMessage({ id: 'falloff' }),
                envState.fog.fogHeightFalloff,
                editor.envController.setFogFalloff,
                [0, 1],
              )}
              {this._renderNumProps(
                true,
                this.props.intl.formatMessage({ id: 'fogHeight' }),
                envState.fog.fogHeightOffset,
                editor.envController.setFogHeight,
                [-10, 128],
              )}
              {this._renderNumProps(
                true,
                this.props.intl.formatMessage({ id: 'startDistance' }),
                envState.fog.fogStartDistance,
                editor.envController.setFogDistance,
                [0, 128],
              )}
              {this._renderNumProps(
                true,
                this.props.intl.formatMessage({ id: 'maxVolume' }),
                envState.fog.maxFog,
                editor.envController.setFogMaxVolume,
                [0, 1],
              )}
              {this._renderNumProps(
                true,
                this.props.intl.formatMessage({ id: 'fogDensity' }),
                formatedDensity,
                this._setFogDensity,
                [0, 1],
              )}
            </div>
          </div>
        );
      },
      [EffectType.rain]: () => {
        const isRaining = this._isRaining();
        const disabledStyle = isRaining ? '' : style.disabled;
        return (
          <div className={style.effectContent}>
            <RadioProperty
              name={this.props.intl.formatMessage({ id: 'rain' })}
              nameStyle={{ color: 'var(--color-white)' }}
              value={isRaining}
              onChange={this._toggleRain}
            />
            <div className={calc_class_name(style.title, disabledStyle)}>
              {this.props.intl.formatMessage({ id: 'direction' })}
            </div>
            {this._renderRainDirectionProps(isRaining)}
            <div className={style.paramsContainer}>
              {this._renderNumProps(
                isRaining,
                this.props.intl.formatMessage({ id: 'speed' }),
                this.state.rainSpeed,
                this._setRainSpeed,
                [-100, 100],
              )}
              {this._renderNumProps(
                isRaining,
                this.props.intl.formatMessage({ id: 'density' }),
                this.state.rainDensity,
                this._setRainDensity,
                [0.1, 100],
              )}
              {this._renderNumProps(
                isRaining,
                this.props.intl.formatMessage({ id: 'rainSize' }),
                this.state.rainSize,
                this._setRainSize,
                [0, 1],
              )}
              {this._renderNumProps(
                isRaining,
                this.props.intl.formatMessage({ id: 'interference' }),
                this.state.rainInterference,
                this._setRainInterference,
                [0, 1],
                2,
              )}
              <div className={style.item}>
                <div className={calc_class_name(style.title, disabledStyle)}>
                  {this.props.intl.formatMessage({ id: 'color' })}
                </div>
                <input
                  type="color"
                  disabled={!isRaining}
                  className={calc_class_name(style.colorPicker, disabledStyle)}
                  value={this.state.rainColor}
                  onChange={(ev) => this._setRainColor(ev.target.value)}
                ></input>
              </div>
            </div>
          </div>
        );
      },
    };

    return (
      <div className={style.effectContainer}>
        <div className={style.effectType}>
          {[
            {
              icon: style.snowIcon,
              type: EffectType.snow,
              isSelect: this._isSnowing,
              toggle: this._toggleSnow,
            },
            {
              icon: style.fogIcon,
              type: EffectType.fog,
              isSelect: () => true,
              toggle: () => {},
            },
            {
              icon: style.rainIcon,
              type: EffectType.rain,
              isSelect: this._isRaining,
              toggle: this._toggleRain,
            },
          ].map((effect, i) => (
            <div
              className={
                this.state.onEffectPage === effect.type
                  ? style.effectTypeBtnActive
                  : style.effectTypeBtn
              }
              key={i}
              onClick={() => this.setState({ onEffectPage: effect.type })}
            >
              <div className={style.radioContainer} onClick={effect.toggle}>
                <div
                  className={
                    effect.isSelect() ? style.radioSelected : style.radio
                  }
                ></div>
              </div>
              {typeof effect.icon === 'string' && (
                <div className={effect.icon}></div>
              )}
              {typeof effect.icon === 'object' && effect.icon}
            </div>
          ))}
        </div>
        {effectBody[this.state.onEffectPage]()}
      </div>
    );
  };

  public render() {
    return (
      <DetailPanel
        className={style.scenePanel}
        ref={this.detailPanelRef}
        hidden={this.props.isRunning}
        contentWrapperStyle={{ overflowY: 'scroll', paddingRight: '4px' }}
        contentList={[
          // {
          //     title: this.props.intl.formatMessage({id:'tone'}),
          //     content: this._renderToneSetting,
          //     tab: (
          //         <div className={style.toneIcon}></div>
          //     ),
          // },
          {
            title: this.props.intl.formatMessage({ id: 'general' }),
            content: this._renderGeneralSetting,
            tab: <IconBasic />,
            contentContainerStyle: {
              backgroundColor: '#595959E5',
            },
          },
          {
            title: this.state.collisionEffectTitle,
            content: this._renderPhysicsSetting,
            tab: <IconPhysics />,
            contentContainerStyle: {
              backgroundColor: '#595959E5',
            },
          },
          {
            title: this.props.intl.formatMessage({ id: 'timeOfDay' }),
            content: this._renderTimeSetting,
            tab: <IconSunshine />,
            contentContainerStyle: {
              backgroundColor: '#595959E5',
            },
          },
          {
            title: this.props.intl.formatMessage({ id: 'lut' }),
            content: this._renderLutSetting,
            tab: <IconFilter />,
            contentContainerStyle: {
              backgroundColor: '#595959E5',
            },
          },
          {
            title: this.props.intl.formatMessage({ id: 'globalEffect' }),
            content: this._renderEffect,
            tab: <IconEffect />,
            contentContainerStyle: {
              backgroundColor: '#595959E5',
            },
          },
          {
            title: this.state.soundEffectTitle,
            content: this._renderSoundEffect,
            titleStyle: { margin: '0 16px 0 0' },
            contentStyle: { padding: '0 16px', width: '100%' },
            tab: <IconMusic />,
            contentContainerStyle: {
              backgroundColor: '#595959E5',
              padding: '0 0 16px 0',
            },
          },
        ]}
      />
    );
  }
}

export const EnvironmentPanel = injectIntl(EnvironmentContainer);
