import * as React from 'react';

import style from './index.module.css';

interface Props {
  range: number[];
  value: { r: number; g: number; b: number };
  disabled?: boolean;
  inputStyle?: { [key: string]: string };
  containerStyler?: React.CSSProperties;
  precision?: number;
  onChange?: (color: { r: number; g: number; b: number }) => void;
}

interface State {
  r: number;
  g: number;
  b: number;
}

export class ColorInput extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const r = this.scaleTo8BitColorRange(this.props.value.r);
    const g = this.scaleTo8BitColorRange(this.props.value.g);
    const b = this.scaleTo8BitColorRange(this.props.value.b);
    this.state = { r, g, b };
  }

  private scaleTo8BitColorRange(v: number) {
    return Math.min(
      Math.max(
        Math.round(
          ((v - this.props.range[0]) /
            (this.props.range[1] - this.props.range[0])) *
            255,
        ),
        0,
      ),
      255,
    );
  }

  private RGBTohex() {
    let r = (+this.state.r).toString(16);
    let g = (+this.state.g).toString(16);
    let b = (+this.state.b).toString(16);
    if (r.length == 1) {
      r = '0' + r;
    }
    if (g.length == 1) {
      g = '0' + g;
    }
    if (b.length == 1) {
      b = '0' + b;
    }
    return '#' + r + g + b;
  }

  private hexToRGB(h: string) {
    let r = 0;
    let g = 0;
    let b = 0;
    // 3 digits
    if (h.length == 4) {
      r = Number('0x' + h[1] + h[1]);
      g = Number('0x' + h[2] + h[2]);
      b = Number('0x' + h[3] + h[3]);
      // 6 digits
    } else if (h.length == 7) {
      r = Number('0x' + h[1] + h[2]);
      g = Number('0x' + h[3] + h[4]);
      b = Number('0x' + h[5] + h[6]);
    }
    return { r, g, b };
  }

  public render() {
    return (
      <div
        className={[
          style.colorInputWrapper,
          this.props.disabled ? style.disabled : '',
        ].join(' ')}
        style={this.props.containerStyler}
      >
        <input
          disabled={this.props.disabled}
          style={this.props.inputStyle}
          className={style.colorInput}
          type={'color'}
          value={this.RGBTohex()}
          onChange={(ev) => {
            const color = this.hexToRGB(ev.target.value);
            this.setState({
              r: color.r,
              g: color.g,
              b: color.b,
            });
          }}
          onBlur={() => {
            if (this.props.onChange) {
              this.props.onChange({
                r:
                  (this.state.r / 255) *
                    (this.props.range[1] - this.props.range[0]) +
                  this.props.range[0],
                g:
                  (this.state.g / 255) *
                    (this.props.range[1] - this.props.range[0]) +
                  this.props.range[0],
                b:
                  (this.state.b / 255) *
                    (this.props.range[1] - this.props.range[0]) +
                  this.props.range[0],
              });
            }
          }}
        ></input>
      </div>
    );
  }
}
