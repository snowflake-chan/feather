import * as React from 'react';
import { Input } from 'src/views/components/edit/input';
import { Range } from 'src/views/components/edit/inputSlider';
import { vec3 } from 'gl-matrix';

import style from './index.module.css';

interface Props {
  name: string;
  nameStyle?: React.CSSProperties;
  value: number[] | vec3;
  min: number[] | vec3;
  max: number[] | vec3;
  label: string[];
  disabled?: boolean;
  onChange?: (v: vec3 | number[], index?: number) => void;
  formatValue?: (v: number) => any;
  numberFixed?: number;
}

interface State {}

export class Vec3Slider extends React.Component<Props, State> {
  constructor(props) {
    super(props);
  }

  public render() {
    const inputContainerStyler = {
      marginTop: '76px',
      width: '56px',
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
      transform: 'translate(0, -1px)',
      textAlign: 'right',
    };

    return (
      <div
        className={
          this.props.disabled ? style.propertyDisabled : style.property
        }
      >
        <div className={style.propertyWrapper}>
          <div className={style.propName} style={this.props.nameStyle}>
            {this.props.name}
          </div>
          <div className={style.sliderRowsWrapper}>
            <div className={style.sliderRow}>
              <div className={style.sliderColumn}>
                <div className={style.topDownSlider}>
                  <Range
                    value={this.props.value[0]}
                    min={this.props.min[0]}
                    max={this.props.max[0]}
                    disabled={this.props.disabled}
                    onValueChange={(v: number) => {
                      if (this.props.onChange) {
                        this.props.onChange(
                          [v, this.props.value[1], this.props.value[2]],
                          0,
                        );
                      }
                    }}
                    dragEndCb={() => {}}
                  />
                </div>
                <Input
                  number={true}
                  containerStyle={inputContainerStyler}
                  inputStyle={inputStyle}
                  value={
                    this.props.formatValue
                      ? this.props.formatValue(this.props.value[0])
                      : this.props.value[0]
                  }
                  onChange={(v) => {
                    if (this.props.onChange) {
                      this.props.onChange(
                        [Number(v), this.props.value[1], this.props.value[2]],
                        0,
                      );
                    }
                  }}
                  disabled={this.props.disabled}
                  numberFixed={
                    this.props.numberFixed !== undefined
                      ? this.props.numberFixed
                      : 1
                  }
                />
                <div className={style.sliderLabel}>{this.props.label[0]}</div>
              </div>
              <div className={style.sliderColumn}>
                <div className={style.topDownSlider}>
                  <Range
                    value={this.props.value[1]}
                    min={this.props.min[1]}
                    max={this.props.max[1]}
                    disabled={this.props.disabled}
                    onValueChange={(v: number) => {
                      if (this.props.onChange) {
                        this.props.onChange(
                          [this.props.value[0], v, this.props.value[2]],
                          1,
                        );
                      }
                    }}
                    dragEndCb={() => {}}
                  />
                </div>
                <Input
                  number={true}
                  containerStyle={inputContainerStyler}
                  inputStyle={inputStyle}
                  value={
                    this.props.formatValue
                      ? this.props.formatValue(this.props.value[1])
                      : this.props.value[1]
                  }
                  onChange={(v) => {
                    if (this.props.onChange) {
                      this.props.onChange(
                        [this.props.value[0], Number(v), this.props.value[2]],
                        1,
                      );
                    }
                  }}
                  disabled={this.props.disabled}
                  numberFixed={
                    this.props.numberFixed !== undefined
                      ? this.props.numberFixed
                      : 1
                  }
                />
                <div className={style.sliderLabel}>{this.props.label[1]}</div>
              </div>
              <div className={style.sliderColumn}>
                <div className={style.topDownSlider}>
                  <Range
                    value={this.props.value[2]}
                    min={this.props.min[2]}
                    max={this.props.max[2]}
                    disabled={this.props.disabled}
                    onValueChange={(v: number) => {
                      if (this.props.onChange) {
                        this.props.onChange(
                          [this.props.value[0], this.props.value[1], v],
                          2,
                        );
                      }
                    }}
                    dragEndCb={() => {}}
                  />
                </div>
                <Input
                  number={true}
                  containerStyle={inputContainerStyler}
                  inputStyle={inputStyle}
                  value={
                    this.props.formatValue
                      ? this.props.formatValue(this.props.value[2])
                      : this.props.value[2]
                  }
                  onChange={(v) => {
                    if (this.props.onChange) {
                      this.props.onChange(
                        [this.props.value[0], this.props.value[1], Number(v)],
                        2,
                      );
                    }
                  }}
                  disabled={this.props.disabled}
                  numberFixed={
                    this.props.numberFixed !== undefined
                      ? this.props.numberFixed
                      : 1
                  }
                />
                <div className={style.sliderLabel}>{this.props.label[2]}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
