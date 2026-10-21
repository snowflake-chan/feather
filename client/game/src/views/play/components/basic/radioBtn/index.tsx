import * as React from 'react';
import { touchable } from 'src/utils/mobile';
import { calc_class_name as cx } from 'src/utils/classname';
import _style from './index.module.css';

export type RadioBtnProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  text?: string;
  disable?: boolean;
  style?: any;
};
export class RadioBtn extends React.Component<RadioBtnProps, any> {
  public render() {
    const style = this.props.style || _style;
    return (
      <div
        className={cx(style.radioWrap, {
          [style.radioChecked]: this.props.checked,
        })}
        onClick={() =>
          touchable ? false : this.props.onChange(!this.props.checked)
        }
        onTouchStart={() =>
          touchable ? this.props.onChange(!this.props.checked) : false
        }
      >
        <i
          className={cx(style.radio, { [style.disable]: !!this.props.disable })}
        >
          <i className={style.icon}></i>
        </i>
        {this.props.text && <span>{this.props.text}</span>}
      </div>
    );
  }
}
