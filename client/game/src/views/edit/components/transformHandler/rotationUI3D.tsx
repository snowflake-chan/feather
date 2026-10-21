import * as React from 'react';
import { vec3 } from 'gl-matrix';
import { Ring } from '../ui-3d/ring';
import { HoverObject, hoverColor } from './util';
import { touchable } from 'src/utils/mobile';

type Props = {
  position: vec3;
  colorX: vec3;
  colorY: vec3;
  colorZ: vec3;
  showXZ: boolean;
  shiftKey: boolean;
  hoverObj: HoverObject;
  setHoverObj: (obj: HoverObject) => void;
  handleDragStart: () => void;
  handleRotateX: (diffX: number) => void;
  handleRotateY: (diffY: number) => void;
  handleRotateZ: (diffZ: number) => void;
  handleDragEnd: () => void;
};

export class RotationUI3D extends React.Component<Props, {}> {
  private _isMouseDownX: boolean = false;
  private _isMouseDownY: boolean = false;
  private _isMouseDownZ: boolean = false;

  constructor(props) {
    super(props);
  }

  private _getIsIdle() {
    return !this._isMouseDownX && !this._isMouseDownY && !this._isMouseDownZ;
  }

  private _onMouseInXYZ(obj: HoverObject) {
    if (
      this.props.hoverObj !== HoverObject.none &&
      this.props.hoverObj !== HoverObject.ringX &&
      this.props.hoverObj !== HoverObject.ringY &&
      this.props.hoverObj !== HoverObject.ringZ
    ) {
      return;
    }
    this.props.setHoverObj(obj);
  }

  private _onMouseOutXYZ(obj: HoverObject) {
    if (this.props.hoverObj === obj) {
      this.props.setHoverObj(HoverObject.none);
    }
  }

  private _onMouseOverXYZ(obj: HoverObject) {
    if (this.props.hoverObj === HoverObject.none) {
      this.props.setHoverObj(obj);
    }
  }

  private _renderX() {
    return (
      <Ring
        position={this.props.position}
        normal={vec3.fromValues(1, 0, 0)}
        color={
          this.props.hoverObj === HoverObject.ringX
            ? hoverColor
            : this.props.colorX
        }
        fillColor={this.props.colorX}
        screenSizeFixed={true}
        radius={0.71}
        shiftKey={this.props.shiftKey}
        highlight={this.props.hoverObj === HoverObject.ringX}
        onMouseOver={
          touchable ? undefined : () => this._onMouseOverXYZ(HoverObject.ringX)
        }
        onMouseIn={
          touchable ? undefined : () => this._onMouseInXYZ(HoverObject.ringX)
        }
        onMouseOut={
          touchable ? undefined : () => this._onMouseOutXYZ(HoverObject.ringX)
        }
        onMouseDown={() => {
          if (
            this.props.hoverObj === HoverObject.ringX ||
            (touchable &&
              (this.props.hoverObj === HoverObject.none ||
                this.props.hoverObj === HoverObject.ringY ||
                this.props.hoverObj === HoverObject.ringZ))
          ) {
            this.props.setHoverObj(HoverObject.ringX);
            this._isMouseDownX = true;
            this.props.handleDragStart?.call(this);
          }
        }}
        onRotate={(diffX) => {
          if (this.props.hoverObj === HoverObject.ringX && this._isMouseDownX) {
            this.props.handleRotateX?.call(this, diffX);
          }
        }}
        onMouseUp={() => {
          if (this.props.hoverObj === HoverObject.ringX) {
            this._isMouseDownX = false;
            this.props.handleDragEnd();
            touchable && this.props.setHoverObj(HoverObject.none);
          }
        }}
      />
    );
  }

  private _renderY() {
    return (
      <Ring
        position={this.props.position}
        normal={vec3.fromValues(0, 1, 0)}
        color={
          this.props.hoverObj === HoverObject.ringY
            ? hoverColor
            : this.props.colorY
        }
        fillColor={this.props.colorY}
        screenSizeFixed={true}
        radius={0.71}
        shiftKey={this.props.shiftKey}
        highlight={this.props.hoverObj === HoverObject.ringY}
        onMouseOver={
          touchable ? undefined : () => this._onMouseOverXYZ(HoverObject.ringY)
        }
        onMouseIn={
          touchable ? undefined : () => this._onMouseInXYZ(HoverObject.ringY)
        }
        onMouseOut={
          touchable ? undefined : () => this._onMouseOutXYZ(HoverObject.ringY)
        }
        onMouseDown={() => {
          if (
            this.props.hoverObj === HoverObject.ringY ||
            (touchable &&
              (this.props.hoverObj === HoverObject.none ||
                this.props.hoverObj === HoverObject.ringZ))
          ) {
            this.props.setHoverObj(HoverObject.ringY);
            this._isMouseDownY = true;
            this.props.handleDragStart?.call(this);
          }
        }}
        onRotate={(diffY) => {
          if (this.props.hoverObj === HoverObject.ringY && this._isMouseDownY) {
            this.props.handleRotateY?.call(this, diffY);
          }
        }}
        onMouseUp={() => {
          if (this.props.hoverObj === HoverObject.ringY) {
            this._isMouseDownY = false;
            this.props.handleDragEnd();
            touchable && this.props.setHoverObj(HoverObject.none);
          }
        }}
      />
    );
  }

  private _renderZ() {
    return (
      <Ring
        position={this.props.position}
        normal={vec3.fromValues(0, 0, 1)}
        color={
          this.props.hoverObj === HoverObject.ringZ
            ? hoverColor
            : this.props.colorZ
        }
        fillColor={this.props.colorZ}
        screenSizeFixed={true}
        radius={0.71}
        shiftKey={this.props.shiftKey}
        highlight={this.props.hoverObj === HoverObject.ringZ}
        onMouseOver={
          touchable ? undefined : () => this._onMouseOverXYZ(HoverObject.ringZ)
        }
        onMouseIn={
          touchable ? undefined : () => this._onMouseInXYZ(HoverObject.ringZ)
        }
        onMouseOut={
          touchable ? undefined : () => this._onMouseOutXYZ(HoverObject.ringZ)
        }
        onMouseDown={() => {
          if (
            this.props.hoverObj === HoverObject.ringZ ||
            (touchable && this.props.hoverObj === HoverObject.none)
          ) {
            this.props.setHoverObj(HoverObject.ringZ);
            this._isMouseDownZ = true;
            this.props.handleDragStart?.call(this);
          }
        }}
        onRotate={(diffZ) => {
          if (this.props.hoverObj === HoverObject.ringZ && this._isMouseDownZ) {
            this.props.handleRotateZ?.call(this, diffZ);
          }
        }}
        onMouseUp={() => {
          if (this.props.hoverObj === HoverObject.ringZ) {
            this._isMouseDownZ = false;
            this.props.handleDragEnd();
            touchable && this.props.setHoverObj(HoverObject.none);
          }
        }}
      />
    );
  }

  public render() {
    return (
      <div>
        {(this._getIsIdle() || this._isMouseDownY) && this._renderY()}
        {(this._getIsIdle() || this._isMouseDownX) &&
          this.props.showXZ &&
          this._renderX()}
        {(this._getIsIdle() || this._isMouseDownZ) &&
          this.props.showXZ &&
          this._renderZ()}
      </div>
    );
  }
}
