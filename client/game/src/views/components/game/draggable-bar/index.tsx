import * as React from 'react';
import { touchable } from 'src/utils/mobile';

import style from './index.module.css';

type Props = {
  type: 'top' | 'right' | 'bottom' | 'left';
  alwaysShow?: boolean;
  onDrag?: (position: number) => void;
  background?: string;
};

type State = {};

export class DraggableBar extends React.Component<Props, State> {
  private mouseX = 0;
  private mouseY = 0;
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  public componentWillUnmount() {
    if (touchable) {
      window.removeEventListener('touchmove', this._handleMouseMove);
      window.removeEventListener('touchend', this._handleMouseUp);
    } else {
      window.removeEventListener('mousemove', this._handleMouseMove);
      window.removeEventListener('mouseup', this._handleMouseUp);
    }
  }

  private _handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    this.mouseX =
      (e as React.MouseEvent).clientX ||
      (e as React.TouchEvent).touches[0].clientX;
    this.mouseY =
      (e as React.MouseEvent).clientY ||
      (e as React.TouchEvent).touches[0].clientY;
    if (touchable) {
      window.addEventListener('touchmove', this._handleMouseMove);
      window.addEventListener('touchend', this._handleMouseUp);
    } else {
      window.addEventListener('mousemove', this._handleMouseMove);
      window.addEventListener('mouseup', this._handleMouseUp);
    }
  };

  private _handleMouseMove = (e: MouseEvent | TouchEvent) => {
    const mouseX =
      (e as MouseEvent).clientX || (e as TouchEvent).touches[0].clientX;
    const mouseY =
      (e as MouseEvent).clientY || (e as TouchEvent).touches[0].clientY;
    const deltaX = mouseX - this.mouseX;
    const deltaY = mouseY - this.mouseY;
    this.mouseX = mouseX;
    this.mouseY = mouseY;
    if (this.props.onDrag) {
      if (this.props.type === 'top' || this.props.type === 'bottom') {
        this.props.onDrag(deltaY);
      } else {
        this.props.onDrag(deltaX);
      }
    }
  };

  private _handleMouseUp = (e: MouseEvent | TouchEvent) => {
    if (touchable) {
      window.removeEventListener('touchmove', this._handleMouseMove);
      window.removeEventListener('touchend', this._handleMouseUp);
    } else {
      window.removeEventListener('mousemove', this._handleMouseMove);
      window.removeEventListener('mouseup', this._handleMouseUp);
    }
  };

  public render() {
    return (
      <div
        className={
          style[this.props.type] +
          ' ' +
          (this.props.alwaysShow
            ? style.draggableBarAlwaysShow
            : style.draggableBar)
        }
        onMouseDown={(e) => {
          !touchable && this._handleMouseDown(e);
        }}
        onTouchStart={(e) => {
          touchable && this._handleMouseDown(e);
        }}
      >
        <div className={style.decoration}></div>
      </div>
    );
  }
}
