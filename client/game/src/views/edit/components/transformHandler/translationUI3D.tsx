import * as React from 'react';
import { vec3 } from 'gl-matrix';
import { Arrow, ArrowDir } from '../ui-3d/arrow';
import { HoverObject, hoverColor } from './util';
import { touchable } from 'src/utils/mobile';

interface TranslationProps {
  position: vec3;
  colorX: vec3;
  colorY: vec3;
  colorZ: vec3;
  hoverObj: HoverObject;
  setHoverObj: (obj: HoverObject) => void;
  onMouseDown: () => void;
  onMouseUp: () => void;
  onDrag: (diff: vec3) => void;
}

export class TranslationUI3D extends React.Component<TranslationProps> {
  private _isMouseDownArrowX: boolean = false;
  private _isMouseDownArrowY: boolean = false;
  private _isMouseDownArrowZ: boolean = false;

  private _diffY = 0;
  private _diffX = 0;
  private _diffZ = 0;

  constructor(props) {
    super(props);
  }

  private _getIsIdle() {
    return (
      !this._isMouseDownArrowX &&
      !this._isMouseDownArrowY &&
      !this._isMouseDownArrowZ
    );
  }

  private _renderArrowX() {
    return (
      <Arrow
        height={0.24}
        cosA={0.948}
        axis={ArrowDir.x}
        screenSizeFixed={true}
        draggable={true}
        radialSegments={4}
        offset={vec3.fromValues(1, 0, 0)}
        color={
          this.props.hoverObj === HoverObject.arrowX
            ? hoverColor
            : this.props.colorX
        }
        position={this.props.position}
        onMouseDown={() => {
          if (
            this.props.hoverObj === HoverObject.arrowX ||
            (touchable && this.props.hoverObj !== HoverObject.cubeW)
          ) {
            this.props.setHoverObj(HoverObject.arrowX);
            this._isMouseDownArrowX = true;
            this._diffX = 0;
            this.props.onMouseDown();
          }
        }}
        onMouseUp={() => {
          if (this.props.hoverObj === HoverObject.arrowX) {
            this._isMouseDownArrowX = false;
            this.props.onMouseUp();
            touchable && this.props.setHoverObj(HoverObject.none);
          }
        }}
        onMouseOver={
          touchable
            ? undefined
            : () => {
                if (this.props.hoverObj === HoverObject.none) {
                  this.props.setHoverObj(HoverObject.arrowX);
                }
              }
        }
        onMouseIn={
          touchable
            ? undefined
            : () => this.props.setHoverObj(HoverObject.arrowX)
        }
        onMouseOut={
          touchable
            ? undefined
            : () =>
                this.props.hoverObj === HoverObject.arrowX &&
                this.props.setHoverObj(HoverObject.none)
        }
        onDrag={(prevPos, currPos) => {
          if (
            this.props.hoverObj !== HoverObject.arrowX ||
            !this._isMouseDownArrowX
          ) {
            return;
          }
          this._diffX = this._diffX + (currPos[0] - prevPos[0]);
          this.props.onDrag(vec3.fromValues(this._diffX, 0, 0));
        }}
      />
    );
  }

  private _renderArrowY() {
    return (
      <Arrow
        height={0.24}
        cosA={0.948}
        axis={ArrowDir.y}
        screenSizeFixed={true}
        draggable={true}
        radialSegments={4}
        offset={vec3.fromValues(0, 1, 0)}
        color={
          this.props.hoverObj === HoverObject.arrowY
            ? hoverColor
            : this.props.colorY
        }
        position={this.props.position}
        onMouseDown={() => {
          if (
            this.props.hoverObj === HoverObject.arrowY ||
            (touchable &&
              this.props.hoverObj !== HoverObject.cubeW &&
              this.props.hoverObj !== HoverObject.arrowX)
          ) {
            this.props.setHoverObj(HoverObject.arrowY);
            this._isMouseDownArrowY = true;
            this._diffY = 0;
            this.props.onMouseDown();
          }
        }}
        onMouseUp={() => {
          if (this.props.hoverObj === HoverObject.arrowY) {
            this._isMouseDownArrowY = false;
            this.props.onMouseUp();
            touchable && this.props.setHoverObj(HoverObject.none);
          }
        }}
        onMouseOver={
          touchable
            ? undefined
            : () => {
                if (this.props.hoverObj === HoverObject.none) {
                  this.props.setHoverObj(HoverObject.arrowY);
                }
              }
        }
        onMouseIn={
          touchable
            ? undefined
            : () => this.props.setHoverObj(HoverObject.arrowY)
        }
        onMouseOut={
          touchable
            ? undefined
            : () =>
                this.props.hoverObj === HoverObject.arrowY &&
                this.props.setHoverObj(HoverObject.none)
        }
        onDrag={(prevPos, currPos) => {
          if (
            this.props.hoverObj !== HoverObject.arrowY ||
            !this._isMouseDownArrowY
          ) {
            return;
          }
          this._diffY = this._diffY + (currPos[1] - prevPos[1]);
          this.props.onDrag(vec3.fromValues(0, this._diffY, 0));
        }}
      />
    );
  }

  private _renderArrowZ() {
    return (
      <Arrow
        height={0.24}
        cosA={0.948}
        axis={ArrowDir.z}
        screenSizeFixed={true}
        draggable={true}
        radialSegments={4}
        offset={vec3.fromValues(0, 0, 1)}
        color={
          this.props.hoverObj === HoverObject.arrowZ
            ? hoverColor
            : this.props.colorZ
        }
        position={this.props.position}
        onMouseDown={() => {
          if (
            this.props.hoverObj === HoverObject.arrowZ ||
            (touchable &&
              this.props.hoverObj !== HoverObject.cubeW &&
              this.props.hoverObj !== HoverObject.arrowX &&
              this.props.hoverObj !== HoverObject.arrowY)
          ) {
            this.props.setHoverObj(HoverObject.arrowZ);
            this._isMouseDownArrowZ = true;
            this._diffZ = 0;
            this.props.onMouseDown();
          }
        }}
        onMouseUp={() => {
          if (this.props.hoverObj === HoverObject.arrowZ) {
            this._isMouseDownArrowZ = false;
            this.props.onMouseUp();
            touchable && this.props.setHoverObj(HoverObject.none);
          }
        }}
        onMouseOver={
          touchable
            ? undefined
            : () => {
                if (this.props.hoverObj === HoverObject.none) {
                  this.props.setHoverObj(HoverObject.arrowZ);
                }
              }
        }
        onMouseIn={
          touchable
            ? undefined
            : () => this.props.setHoverObj(HoverObject.arrowZ)
        }
        onMouseOut={
          touchable
            ? undefined
            : () =>
                this.props.hoverObj === HoverObject.arrowZ &&
                this.props.setHoverObj(HoverObject.none)
        }
        onDrag={(prevPos, currPos) => {
          if (
            this.props.hoverObj !== HoverObject.arrowZ ||
            !this._isMouseDownArrowZ
          ) {
            return;
          }
          this._diffZ = this._diffZ + (currPos[2] - prevPos[2]);
          this.props.onDrag(vec3.fromValues(0, 0, this._diffZ));
        }}
      />
    );
  }
  public render() {
    return (
      <div>
        {(this._getIsIdle() || this._isMouseDownArrowX) && this._renderArrowX()}
        {(this._getIsIdle() || this._isMouseDownArrowY) && this._renderArrowY()}
        {(this._getIsIdle() || this._isMouseDownArrowZ) && this._renderArrowZ()}
      </div>
    );
  }
}
