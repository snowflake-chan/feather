import * as React from 'react';
import style from './index.module.css';
import { IntlShape, injectIntl } from 'react-intl';
import { SizeNumber } from '../size-number';

const DEFAULT_STEPS = 5;

type Props = {
  intl: IntlShape;
  value: number;
  range: [number, number];
  steps?: number;
  small?: boolean;

  onChange: (v: number) => void;
  onRangeMaxChange?: (maxValue: number) => void;
};

class RangePickerContainer extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  private _calcNodes() {
    const steps = this.props.steps || DEFAULT_STEPS;
    const nodeList: boolean[] = [];
    for (let i = 0; i < steps; i++) {
      const isActive =
        this.props.value >=
        this.props.range[0] +
          ((this.props.range[1] - this.props.range[0]) / steps) * i;
      nodeList.push(isActive);
    }
    return nodeList;
  }

  private _handleValueChange = (valueFromSizeNumber: number) => {
    if (this.props.onRangeMaxChange) {
      this.props.onRangeMaxChange(valueFromSizeNumber);
    } else {
      this.props.onChange(valueFromSizeNumber);
    }
  };

  public render() {
    const nodeList = this._calcNodes();
    const steps = this.props.steps || DEFAULT_STEPS;
    const p =
      this.props.range[1] - this.props.range[0] !== 0
        ? (this.props.value - this.props.range[0]) /
          (this.props.range[1] - this.props.range[0])
        : 0;
    return (
      <div className={style.container}>
        {!this.props.small && (
          <div className={style.pickerTitleWrapper}>
            <div className={style.pickerTitle}>
              {this.props.intl.formatMessage({ id: 'size' })}
            </div>
            <div className={style.pickerValue}>
              <SizeNumber
                value={
                  this.props.onRangeMaxChange
                    ? this.props.range[1]
                    : this.props.value
                }
                onChange={this._handleValueChange}
                min={this.props.range[0]}
                warningThreshold={5}
              />
            </div>
          </div>
        )}
        <div className={style.barContainer}>
          <div className={style.bar}>
            <div
              className={style.barSelected}
              style={{
                width: `${p * 100}%`,
              }}
            />
          </div>
          <div className={style.nodeList}>
            {nodeList.map((isActive, i) => {
              const size = 8 + (i / (steps - 1)) * (24 - 8);
              return (
                <div
                  className={style.nodeWrapper}
                  key={i}
                  style={{
                    left: `${(i / (steps - 1)) * 100}%`,
                  }}
                  onClick={() => {
                    this.props.onChange(
                      Math.round(
                        this.props.range[0] +
                          ((this.props.range[1] - this.props.range[0]) /
                            (steps - 1)) *
                            i,
                      ),
                    );
                  }}
                >
                  <div
                    style={{
                      width: size,
                      height: size,
                    }}
                    className={isActive ? style.nodeActive : style.node}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export const RangePicker = injectIntl(RangePickerContainer);
