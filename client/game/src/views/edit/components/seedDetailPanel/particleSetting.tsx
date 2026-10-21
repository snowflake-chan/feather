import * as React from 'react';
import { vec3 } from 'gl-matrix';
import { ParticleConfig } from '@box/schema/project/project-rda';

import { Vec3Slider } from '../basic/vec3Slider';
import { ColorInput } from '../basic/inputColor';

import { Input } from '../../../components/edit/input';
import { Range } from '../../../components/edit/inputSlider';
import { NumberProperty } from '../../../components/edit/property';
import { editor } from 'src/client/edit/edit-client';

import style from './index.module.scss';
import { IntlShape, injectIntl } from 'react-intl';

interface Props {
  intl: IntlShape;
  particleConfig: ParticleConfig;
  seedId: string;
}

interface State {
  realTimePreview: boolean;
}

class ParticleSettingContainer extends React.Component<Props, State> {
  private _isDragging = false;

  constructor(props) {
    super(props);

    this.state = {
      realTimePreview: false,
    };
  }

  private _setParticleRate(v: number) {
    editor.seedController.setParticleRate(this.props.seedId, v);
  }

  private _setParticleLimit(v: number) {
    editor.seedController.setParticleLimit(this.props.seedId, v);
  }

  private _setParticleLifetime(v: number) {
    editor.seedController.setParticleLifetime(this.props.seedId, v);
  }

  private _setParticleLifetimeSpread(v: number) {
    editor.seedController.setParticleLifetimeSpread(this.props.seedId, v);
  }

  private _setSizeSpread(v: number) {
    editor.seedController.setSizeSpread(this.props.seedId, v);
  }

  public render() {
    const propertyInputStyle = {
      width: '72px',
      border: '1px solid rgba(255,255,255,0.30)',
      background: 'none',
      height: '24px',
    };
    const inputContainerStyler = {
      marginTop: '67px',
      width: '41px',
      // border: '1px solid rgba(255,255,255,0.30)',
      background: 'none',
      marginLeft: '50%',
      transform: 'translateX(-50%)',
      height: '24px',
    };
    const inputStyle = {
      width: '100%',
      background: 'none',
      padding: '0 2px 0 2px',
      height: '100%',
      lineHeight: '24px',
      transform: 'translate(-1px, -1px)',
      textAlign: 'right',
    };
    const isDisabled = this.props.particleConfig.rate === 0;
    return (
      <div className={style.container}>
        <div className={style.propertyContainer}>
          <NumberProperty
            name={this.props.intl.formatMessage({ id: 'particleRate' })}
            value={this.props.particleConfig.rate}
            onChange={(v: number) => {
              this._setParticleRate(v);
            }}
            slider={[0, 100]}
            formatValue={(v) => Math.round(v)}
          />
          <NumberProperty
            disabled={isDisabled}
            name={this.props.intl.formatMessage({ id: 'particleLimit' })}
            value={this.props.particleConfig.limit}
            onChange={(v: number | boolean | string) => {
              this._setParticleLimit(Number(v));
            }}
            slider={[0, 1000]}
            formatValue={(v) => Math.round(v)}
          />
          <NumberProperty
            name={this.props.intl.formatMessage({ id: 'particleLifetime' })}
            disabled={isDisabled}
            value={this.props.particleConfig.lifetime}
            onChange={(v: number) => {
              this._setParticleLifetime(v);
            }}
            slider={[0, 15]}
          />
          <NumberProperty
            name={this.props.intl.formatMessage({
              id: 'particleLifetimeSpread',
            })}
            disabled={isDisabled}
            value={this.props.particleConfig.lifetimeSpread}
            onChange={(v: number) => {
              this._setParticleLifetimeSpread(v);
            }}
            slider={[0, 15]}
          />
          <div className={style.item}>
            <div
              className={[style.title, isDisabled ? style.disabled : ''].join(
                ' ',
              )}
            >
              {this.props.intl.formatMessage({ id: 'color' })}
            </div>
            <div className={style.colorRow}>
              <div className={style.colorColumn}>
                <ColorInput
                  disabled={isDisabled}
                  value={this.props.particleConfig.color0}
                  range={[0, 10]}
                  onChange={(color) => {
                    editor.seedController.setParticleColor0(
                      this.props.seedId,
                      color,
                    );
                  }}
                />
                <div
                  className={[
                    style.colorIndex,
                    isDisabled ? style.disabled : '',
                  ].join(' ')}
                >
                  1
                </div>
              </div>
              <div className={style.colorColumn}>
                <ColorInput
                  disabled={isDisabled}
                  value={this.props.particleConfig.color1}
                  range={[0, 10]}
                  onChange={(color) => {
                    editor.seedController.setParticleColor1(
                      this.props.seedId,
                      color,
                    );
                  }}
                />
                <div
                  className={[
                    style.colorIndex,
                    isDisabled ? style.disabled : '',
                  ].join(' ')}
                >
                  2
                </div>
              </div>
              <div className={style.colorColumn}>
                <ColorInput
                  disabled={isDisabled}
                  value={this.props.particleConfig.color2}
                  range={[0, 10]}
                  onChange={(color) => {
                    editor.seedController.setParticleColor2(
                      this.props.seedId,
                      color,
                    );
                  }}
                />
                <div
                  className={[
                    style.colorIndex,
                    isDisabled ? style.disabled : '',
                  ].join(' ')}
                >
                  3
                </div>
              </div>
              <div className={style.colorColumn}>
                <ColorInput
                  disabled={isDisabled}
                  value={this.props.particleConfig.color3}
                  range={[0, 10]}
                  onChange={(color) => {
                    editor.seedController.setParticleColor3(
                      this.props.seedId,
                      color,
                    );
                  }}
                />
                <div
                  className={[
                    style.colorIndex,
                    isDisabled ? style.disabled : '',
                  ].join(' ')}
                >
                  4
                </div>
              </div>
              <div className={style.colorColumn}>
                <ColorInput
                  disabled={isDisabled}
                  value={this.props.particleConfig.color4}
                  range={[0, 10]}
                  onChange={(color) => {
                    editor.seedController.setParticleColor4(
                      this.props.seedId,
                      color,
                    );
                  }}
                />
                <div
                  className={[
                    style.colorIndex,
                    isDisabled ? style.disabled : '',
                  ].join(' ')}
                >
                  5
                </div>
              </div>
            </div>
          </div>
          <div className={style.item}>
            <div
              className={[style.title, isDisabled ? style.disabled : ''].join(
                ' ',
              )}
            >
              {this.props.intl.formatMessage({ id: 'particleSize' })}
            </div>
            <div className={style.inputRow}>
              <div className={style.inputColumn}>
                <div className={style.topDownSlider}>
                  <Range
                    disabled={isDisabled}
                    value={this.props.particleConfig.size0}
                    min={0}
                    max={100}
                    step={0.1}
                    onValueChange={(v: number) => {
                      editor.seedController.setParticleSize0(
                        this.props.seedId,
                        v,
                      );
                    }}
                    dragEndCb={() => {}}
                    vertical={true}
                  />
                </div>
                <Input
                  disabled={isDisabled}
                  number={true}
                  containerStyle={inputContainerStyler}
                  inputStyle={inputStyle}
                  value={this.props.particleConfig.size0}
                  onChange={(v) => {
                    editor.seedController.setParticleSize0(
                      this.props.seedId,
                      Number(v),
                    );
                  }}
                />
                <div
                  className={[
                    style.inputLabel,
                    isDisabled ? style.disabled : '',
                  ].join(' ')}
                >
                  1
                </div>
              </div>
              <div className={style.inputColumn}>
                <div className={style.topDownSlider}>
                  <Range
                    disabled={isDisabled}
                    value={this.props.particleConfig.size1}
                    min={0}
                    max={100}
                    step={0.1}
                    onValueChange={(v: number) => {
                      editor.seedController.setParticleSize1(
                        this.props.seedId,
                        v,
                      );
                    }}
                    dragEndCb={() => {}}
                    vertical={true}
                  />
                </div>
                <Input
                  disabled={isDisabled}
                  number={true}
                  containerStyle={inputContainerStyler}
                  inputStyle={inputStyle}
                  value={this.props.particleConfig.size1}
                  onChange={(v) => {
                    editor.seedController.setParticleSize1(
                      this.props.seedId,
                      Number(v),
                    );
                  }}
                />
                <div
                  className={[
                    style.inputLabel,
                    isDisabled ? style.disabled : '',
                  ].join(' ')}
                >
                  2
                </div>
              </div>
              <div className={style.inputColumn}>
                <div className={style.topDownSlider}>
                  <Range
                    disabled={isDisabled}
                    value={this.props.particleConfig.size2}
                    min={0}
                    max={100}
                    step={0.1}
                    onValueChange={(v: number) => {
                      editor.seedController.setParticleSize2(
                        this.props.seedId,
                        v,
                      );
                    }}
                    dragEndCb={() => {}}
                    vertical={true}
                  />
                </div>
                <Input
                  disabled={isDisabled}
                  number={true}
                  containerStyle={inputContainerStyler}
                  inputStyle={inputStyle}
                  value={this.props.particleConfig.size2}
                  onChange={(v) => {
                    editor.seedController.setParticleSize2(
                      this.props.seedId,
                      Number(v),
                    );
                  }}
                />
                <div
                  className={[
                    style.inputLabel,
                    isDisabled ? style.disabled : '',
                  ].join(' ')}
                >
                  3
                </div>
              </div>
              <div className={style.inputColumn}>
                <div className={style.topDownSlider}>
                  <Range
                    disabled={isDisabled}
                    value={this.props.particleConfig.size3}
                    min={0}
                    max={100}
                    step={0.1}
                    onValueChange={(v: number) => {
                      editor.seedController.setParticleSize3(
                        this.props.seedId,
                        v,
                      );
                    }}
                    dragEndCb={() => {}}
                    vertical={true}
                  />
                </div>
                <Input
                  disabled={isDisabled}
                  number={true}
                  containerStyle={inputContainerStyler}
                  inputStyle={inputStyle}
                  value={this.props.particleConfig.size3}
                  onChange={(v) => {
                    editor.seedController.setParticleSize3(
                      this.props.seedId,
                      Number(v),
                    );
                  }}
                />
                <div
                  className={[
                    style.inputLabel,
                    isDisabled ? style.disabled : '',
                  ].join(' ')}
                >
                  4
                </div>
              </div>
              <div className={style.inputColumn}>
                <div className={style.topDownSlider}>
                  <Range
                    disabled={isDisabled}
                    value={this.props.particleConfig.size4}
                    min={0}
                    max={100}
                    step={0.1}
                    onValueChange={(v: number) => {
                      editor.seedController.setParticleSize4(
                        this.props.seedId,
                        v,
                      );
                    }}
                    dragEndCb={() => {}}
                    vertical={true}
                  />
                </div>
                <Input
                  disabled={isDisabled}
                  number={true}
                  containerStyle={inputContainerStyler}
                  inputStyle={inputStyle}
                  value={this.props.particleConfig.size4}
                  onChange={(v) => {
                    editor.seedController.setParticleSize4(
                      this.props.seedId,
                      Number(v),
                    );
                  }}
                />
                <div
                  className={[
                    style.inputLabel,
                    isDisabled ? style.disabled : '',
                  ].join(' ')}
                >
                  5
                </div>
              </div>
            </div>
          </div>
          <NumberProperty
            disabled={isDisabled}
            name={this.props.intl.formatMessage({ id: 'sizeSpread' })}
            value={this.props.particleConfig.sizeSpread}
            onChange={(v: number) => {
              this._setSizeSpread(v);
            }}
            slider={[0, 15]}
          />
          <Vec3Slider
            disabled={isDisabled}
            name={this.props.intl.formatMessage({ id: 'particleSpeed' })}
            value={[
              this.props.particleConfig.velocity.x,
              this.props.particleConfig.velocity.y,
              this.props.particleConfig.velocity.z,
            ]}
            min={[-10, -10, -10]}
            max={[10, 10, 10]}
            label={['x', 'y', 'z']}
            onChange={(velocity: number[] | vec3) => {
              editor.seedController.setParticleVelocity(this.props.seedId, {
                x: velocity[0],
                y: velocity[1],
                z: velocity[2],
              });
            }}
          />
          <Vec3Slider
            disabled={isDisabled}
            name={this.props.intl.formatMessage({ id: 'particleSpeedSpread' })}
            value={[
              this.props.particleConfig.velocitySpread.x,
              this.props.particleConfig.velocitySpread.y,
              this.props.particleConfig.velocitySpread.z,
            ]}
            min={[0, 0, 0]}
            max={[10, 10, 10]}
            label={['x', 'y', 'z']}
            onChange={(speedSpread: number[] | vec3) => {
              editor.seedController.setParticleSpeedSpread(this.props.seedId, {
                x: speedSpread[0],
                y: speedSpread[1],
                z: speedSpread[2],
              });
            }}
          />
          <Vec3Slider
            disabled={isDisabled}
            name={this.props.intl.formatMessage({ id: 'acceleration' })}
            value={[
              this.props.particleConfig.acceleration.x,
              this.props.particleConfig.acceleration.y,
              this.props.particleConfig.acceleration.z,
            ]}
            min={[-10, -10, -10]}
            max={[10, 10, 10]}
            label={['x', 'y', 'z']}
            onChange={(acceleration: number[] | vec3) => {
              editor.seedController.setParticleAcceleration(this.props.seedId, {
                x: acceleration[0],
                y: acceleration[1],
                z: acceleration[2],
              });
            }}
          />
          <NumberProperty
            disabled={isDisabled}
            name={this.props.intl.formatMessage({ id: 'damping' })}
            value={this.props.particleConfig.damping}
            onChange={(v: number) => {
              editor.seedController.setParticleDamping(this.props.seedId, v);
            }}
            slider={[-5, 5]}
          />
          <NumberProperty
            disabled={isDisabled}
            name={this.props.intl.formatMessage({ id: 'noise' })}
            value={this.props.particleConfig.noiseAmpl}
            onChange={(v: number) => {
              editor.seedController.setParticleNoise(this.props.seedId, v);
            }}
            slider={[0, 10]}
          />
          <NumberProperty
            disabled={isDisabled}
            name={this.props.intl.formatMessage({ id: 'noisefrequency' })}
            value={this.props.particleConfig.noiseFreq}
            onChange={(v: number) => {
              editor.seedController.setParticleNoiseFreq(this.props.seedId, v);
            }}
            slider={[0, 100]}
          />
        </div>
      </div>
    );
  }
}

export const ParticleSetting = injectIntl(ParticleSettingContainer);
