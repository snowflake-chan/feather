import type { JSX } from 'react';
import * as React from 'react';
import style from './index.module.css';

type Props = {
  active: boolean;
  onChange: (e: boolean) => void;
  icons?: {
    activeIcon: JSX.Element;
    unActiveIcon: JSX.Element;
  };
  disabled?: boolean;
};

type State = {};

export class RadioInput extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  public render() {
    const className = [style.radioContainer];
    this.props.disabled && className.push(style.disabled);
    this.props.active && className.push(style.active);
    this.props.icons && className.push(style.iconRadio);
    return (
      <div
        className={className.join(' ')}
        onClick={() => {
          if (!this.props.disabled) {
            this.props.onChange(!this.props.active);
          }
        }}
      >
        <div className={style.btn}></div>
        {this.props.icons && (
          <div className={style.iconContainer}>
            <div className={style.unActiveIcon}>
              {this.props.icons.unActiveIcon}
            </div>
            <div className={style.activeIcon}>
              {this.props.icons.activeIcon}
            </div>
          </div>
        )}
      </div>
    );
  }
}
