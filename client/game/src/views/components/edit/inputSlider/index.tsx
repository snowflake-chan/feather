import * as React from 'react';
import style from './index.module.css';

type RangeProps = {
  value: number;
  onValueChange: Function;
  min: number;
  max: number;
  disabled?: boolean;
  step?: number;
  vertical?: boolean;
  dragEndCb?: (value: number) => void;
};

type RangeState = {
  tempValue: number;
};

export class Range extends React.Component<RangeProps, RangeState> {
  constructor(props) {
    super(props);
    this.state = {
      tempValue: this.props.value,
    };
  }

  public componentWillReceiveProps(nextProps: RangeProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({ tempValue: nextProps.value });
    }
  }

  public render() {
    let step = 0.001;
    if (this.props.step !== undefined && this.props.step > 0) {
      step = Math.max(this.props.step, step);
    }
    const { max, min } = this.props;
    // let value = this.props.value;
    // value = Math.min(max, Math.max(min, value));
    let value = this.state.tempValue;
    value = Math.min(max, Math.max(min, value));

    return (
      <input
        type="range"
        min={min}
        max={max}
        value={value.toString()}
        step={step}
        disabled={this.props.disabled}
        className={[
          style.rangeSlider,
          this.props.vertical ? style.vertical : '',
        ].join(' ')}
        onChange={(ev) => {
          this.setState({ tempValue: parseFloat(ev.currentTarget.value) });
          this.props.onValueChange(parseFloat(ev.currentTarget.value));
        }}
        onMouseUp={() => {
          this.props.dragEndCb && this.props.dragEndCb(this.state.tempValue);
        }}
        onTouchEnd={() => {
          this.props.dragEndCb && this.props.dragEndCb(this.state.tempValue);
        }}
        onBlur={() => {
          this.props.dragEndCb && this.props.dragEndCb(this.state.tempValue);
        }}
      />
    );
  }
}
