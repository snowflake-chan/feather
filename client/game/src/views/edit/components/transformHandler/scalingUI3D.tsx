import * as React from 'react';
import { vec3 } from 'gl-matrix';
import { UI3DLine } from '../ui-3d';
import { CubeLine } from '../ui-3d/cubeline';
import { BoundBox } from '../ui-3d/boundbox';
import { MouseState } from '@box/schema/input/input-schema';
import { HoverObject, hoverColor } from './util';
import { touchable } from 'src/utils/mobile';

type Props = {
  position: vec3;
  colorX: vec3;
  colorY: vec3;
  colorZ: vec3;
  colorW: vec3;
  showXYZ: boolean;
  hoverObj: HoverObject;
  setHoverObj: (obj: HoverObject) => void;
  handleMouseDown: () => void;
  handleFixedRatioScale: (scaleIndex: number) => void;
  handleScaleX: (scaleIndex: number) => void;
  handleScaleY: (scaleIndex: number) => void;
  handleScaleZ: (scaleIndex: number) => void;
  handleDragEnd: () => void;
};

export class ScalingUI3D extends React.Component<Props, {}> {
  private _offsetX = vec3.fromValues(1, 0, 0);
  private _offsetY = vec3.fromValues(0, 1, 0);
  private _offsetZ = vec3.fromValues(0, 0, 1);
  private _dimension = vec3.fromValues(0.12, 0.12, 0.12);
  private _prevPos: vec3 | undefined;

  private _isMouseDownW: boolean = false;
  private _isMouseDownX: boolean = false;
  private _isMouseDownY: boolean = false;
  private _isMouseDownZ: boolean = false;

  constructor(props) {
    super(props);
  }

  private _getIsIdle() {
    return (
      !this._isMouseDownX &&
      !this._isMouseDownY &&
      !this._isMouseDownZ &&
      !this._isMouseDownW
    );
  }

  private _onMouseInXYZ(obj: HoverObject) {
    if (this.props.hoverObj === HoverObject.cubeW) {
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
      <CubeLine
        position={this.props.position}
        centerAtBottom={false}
        offset={this._offsetX}
        dimension={this._dimension}
        color={
          this.props.hoverObj === HoverObject.cubeX
            ? hoverColor
            : this.props.colorX
        }
        screenSizeFixed={true}
        draggable={true}
        onMouseOver={
          touchable ? undefined : () => this._onMouseOverXYZ(HoverObject.cubeX)
        }
        onMouseIn={
          touchable ? undefined : () => this._onMouseInXYZ(HoverObject.cubeX)
        }
        onMouseOut={
          touchable ? undefined : () => this._onMouseOutXYZ(HoverObject.cubeX)
        }
        onDrag={(prevPos: vec3, currPos: vec3) => {
          if (
            this.props.hoverObj !== HoverObject.cubeX ||
            !this._isMouseDownX
          ) {
            return;
          }
          const diff = vec3.sub(vec3.create(), currPos, prevPos);
          const diffX = vec3.dot(diff, [1, 0, 0]);
          this.props.handleScaleX && this.props.handleScaleX(diffX);
        }}
        onMouseDown={() => {
          if (
            this.props.hoverObj === HoverObject.cubeX ||
            (touchable && this.props.hoverObj !== HoverObject.cubeW)
          ) {
            this.props.setHoverObj(HoverObject.cubeX);
            this._isMouseDownX = true;
            this.props.handleMouseDown();
          }
        }}
        onMouseUp={() => {
          if (this.props.hoverObj === HoverObject.cubeX) {
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
      <CubeLine
        position={this.props.position}
        centerAtBottom={false}
        offset={this._offsetY}
        dimension={this._dimension}
        color={
          this.props.hoverObj === HoverObject.cubeY
            ? hoverColor
            : this.props.colorY
        }
        screenSizeFixed={true}
        draggable={true}
        onMouseOver={
          touchable ? undefined : () => this._onMouseOverXYZ(HoverObject.cubeX)
        }
        onMouseIn={
          touchable ? undefined : () => this._onMouseInXYZ(HoverObject.cubeY)
        }
        onMouseOut={
          touchable ? undefined : () => this._onMouseOutXYZ(HoverObject.cubeY)
        }
        onDrag={(prevPos: vec3, currPos: vec3) => {
          if (
            this.props.hoverObj !== HoverObject.cubeY ||
            !this._isMouseDownY
          ) {
            return;
          }
          const diff = vec3.sub(vec3.create(), currPos, prevPos);
          const diffY = vec3.dot(diff, [0, 1, 0]);
          this.props.handleScaleY && this.props.handleScaleY(diffY);
        }}
        onMouseDown={() => {
          if (
            this.props.hoverObj === HoverObject.cubeY ||
            (touchable &&
              this.props.hoverObj !== HoverObject.cubeW &&
              this.props.hoverObj !== HoverObject.cubeX)
          ) {
            this.props.setHoverObj(HoverObject.cubeY);
            this._isMouseDownY = true;
            this.props.handleMouseDown();
          }
        }}
        onMouseUp={() => {
          if (this.props.hoverObj === HoverObject.cubeY) {
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
      <CubeLine
        position={this.props.position}
        centerAtBottom={false}
        offset={this._offsetZ}
        dimension={this._dimension}
        color={
          this.props.hoverObj === HoverObject.cubeZ
            ? hoverColor
            : this.props.colorZ
        }
        screenSizeFixed={true}
        draggable={true}
        onMouseOver={
          touchable ? undefined : () => this._onMouseOverXYZ(HoverObject.cubeX)
        }
        onMouseIn={
          touchable ? undefined : () => this._onMouseInXYZ(HoverObject.cubeZ)
        }
        onMouseOut={
          touchable ? undefined : () => this._onMouseOutXYZ(HoverObject.cubeZ)
        }
        onDrag={(prevPos: vec3, currPos: vec3) => {
          if (
            this.props.hoverObj !== HoverObject.cubeZ ||
            !this._isMouseDownZ
          ) {
            return;
          }
          const diff = vec3.sub(vec3.create(), currPos, prevPos);
          const diffZ = vec3.dot(diff, [0, 0, 1]);
          this.props.handleScaleZ && this.props.handleScaleZ(diffZ);
        }}
        onMouseDown={() => {
          if (
            this.props.hoverObj === HoverObject.cubeZ ||
            (touchable &&
              this.props.hoverObj !== HoverObject.cubeW &&
              this.props.hoverObj !== HoverObject.cubeX &&
              this.props.hoverObj !== HoverObject.cubeY)
          ) {
            this.props.setHoverObj(HoverObject.cubeZ);
            this._isMouseDownZ = true;
            this.props.handleMouseDown();
          }
        }}
        onMouseUp={() => {
          if (this.props.hoverObj === HoverObject.cubeZ) {
            this._isMouseDownZ = false;
            this.props.handleDragEnd();
            touchable && this.props.setHoverObj(HoverObject.none);
          }
        }}
      />
    );
  }

  private _renderW() {
    return (
      <BoundBox
        position={this.props.position}
        dimension={this._dimension}
        color={
          this.props.hoverObj === HoverObject.cubeW || this._isMouseDownW
            ? hoverColor
            : this.props.colorW
        }
        opacity={1}
        line={false}
        screenSizeFixed={true}
        onMouseIn={
          touchable
            ? undefined
            : () => this.props.setHoverObj(HoverObject.cubeW)
        }
        onMouseOut={
          touchable
            ? undefined
            : () =>
                this.props.hoverObj === HoverObject.cubeW &&
                this.props.setHoverObj(HoverObject.none)
        }
        onMouseDown={() => {
          if (this.props.hoverObj === HoverObject.cubeW || touchable) {
            this.props.setHoverObj(HoverObject.cubeW);
            this._isMouseDownW = true;
            this.props.handleMouseDown();
            return true;
          }
          return false;
        }}
        onMouseUp={() => {
          if (this.props.hoverObj === HoverObject.cubeW) {
            this._isMouseDownW = false;
            this._prevPos = undefined;
            this.props.handleDragEnd();
            touchable && this.props.setHoverObj(HoverObject.none);
            return true;
          }
          return false;
        }}
        onDragStart={() => true}
      />
    );
  }
  private _renderWHelper() {
    return (
      <UI3DLine
        visiable={false}
        quadDetection={true}
        start={vec3.fromValues(
          this.props.position[0],
          this.props.position[1] - 10,
          this.props.position[2],
        )}
        end={vec3.fromValues(
          this.props.position[0],
          this.props.position[1] + 10,
          this.props.position[2],
        )}
        width={10}
        color={vec3.fromValues(1, 1, 1)}
        onMouse={(ev) => {
          if (!this._prevPos) {
            this._prevPos = vec3.create();
            vec3.copy(this._prevPos, ev.worldPosition);
            return true;
          }

          if (ev.mouseState === MouseState.drag) {
            let scaleDiff = vec3.distance(this._prevPos, ev.worldPosition) / 2;
            scaleDiff =
              scaleDiff * (ev.worldPosition[1] < this._prevPos[1] ? -1 : 1);
            this.props.handleFixedRatioScale(scaleDiff);
            vec3.copy(this._prevPos, ev.worldPosition);
          }

          if (ev.mouseState === MouseState.release) {
            this._isMouseDownW = false;
            this._prevPos = undefined;
            this.props.handleDragEnd();
            touchable && this.props.setHoverObj(HoverObject.none);
          }
          return true;
        }}
        onMouseOut={() => {
          this._isMouseDownW = false;
          this._prevPos = undefined;
          this.props.handleDragEnd();
          touchable && this.props.setHoverObj(HoverObject.none);
          return true;
        }}
      />
    );
  }

  public render() {
    return (
      <div>
        {(this._getIsIdle() || this._isMouseDownX) &&
          this.props.showXYZ &&
          this._renderX()}
        {(this._getIsIdle() || this._isMouseDownY) &&
          this.props.showXYZ &&
          this._renderY()}
        {(this._getIsIdle() || this._isMouseDownZ) &&
          this.props.showXYZ &&
          this._renderZ()}
        {(this._getIsIdle() || this._isMouseDownW) && this._renderW()}
        {this._isMouseDownW && this._renderWHelper()}
      </div>
    );
  }
}
