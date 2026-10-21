import * as React from 'react';
import { vec3 } from 'gl-matrix';
import { UI3DRingMouseEvent } from 'src/engine/ui3d/ui3d-schema';
import { UI3DRing } from '.';
import { MouseState, MouseButton } from '@box/schema/input/input-schema';
import { touchable } from 'src/utils/mobile';

interface UI3DRingProps {
  normal: vec3;
  color?: vec3;
  fillColor?: vec3;
  radius?: number;
  position: vec3;
  highlight: boolean;
  offset?: vec3;
  fixedSize?: number;
  screenSizeFixed?: boolean;
  shiftKey?: boolean;
  onMouseDown?: (ev: UI3DRingMouseEvent) => void;
  onMouseUp?: (ev: UI3DRingMouseEvent) => void;
  onMouseIn?: (ev: UI3DRingMouseEvent) => void;
  onMouseOut?: (ev: UI3DRingMouseEvent) => void;
  onMouseOver?: (ev: UI3DRingMouseEvent) => void;
  onDragStart?: (ev: UI3DRingMouseEvent) => void;
  onRotate?: (diff: number) => void;
}

export class Ring extends React.Component<UI3DRingProps, {}> {
  private _startV: vec3 = vec3.create();
  private _x_to_y: vec3 = vec3.create();
  private _y_to_v: vec3 = vec3.create();
  private _prevL: vec3 = vec3.create();
  private _currL: vec3 = vec3.create();
  private _tempCross: vec3 = vec3.create();

  private _prevMouseState = 0;
  private _prevPos = vec3.create();
  private _isMouseDown = false;
  private _mouseOn = false;

  private _startRad = 0;
  private _endRad = 0;
  private _diff = 0;

  constructor(props) {
    super(props);
  }

  private _handleMouse = (ev: UI3DRingMouseEvent) => {
    let hit = false;
    const isInRing = this._getIsInRing(ev);
    if ((isInRing && !this._mouseOn) || this._isMouseDown) {
      this._mouseOn = true;
      this.props.onMouseIn && this.props.onMouseIn(ev);
    }

    if (!isInRing && this._mouseOn && !this._isMouseDown) {
      this._mouseOn = false;
      this.props.onMouseOut && this.props.onMouseOut(ev);
    }

    if (isInRing && !this._isMouseDown) {
      this.props.onMouseOver && this.props.onMouseOver(ev);
    }

    if (ev.mouseButton === MouseButton.left) {
      if (
        ev.mouseState === MouseState.press &&
        this._prevMouseState === MouseState.release &&
        isInRing &&
        (touchable || this.props.highlight)
      ) {
        hit = true;
        this._isMouseDown = true;
        const theta = this._getTheta(ev);
        this._startRad = theta;
        this._endRad = theta;
        this.props.onMouseDown && this.props.onMouseDown(ev);
      }
      if (
        this._isMouseDown &&
        ev.mouseState !== MouseState.press &&
        !vec3.equals(ev.worldPosition, this._prevPos)
      ) {
        hit = true;
        let theta = this._getTheta(ev);
        theta = theta < this._startRad ? theta + 2 * Math.PI : theta;
        this._setDiffRad(ev);
        let currDiff = this._diff;
        if (this.props.shiftKey) {
          const roundRad = (diffRad: number) => {
            const mod = diffRad % (Math.PI / 4);
            const res = Math.floor(diffRad / (Math.PI / 4));
            return mod < Math.PI / 8
              ? (res * Math.PI) / 4
              : ((res + 1) * Math.PI) / 4;
          };
          theta = roundRad(theta - this._startRad) + this._startRad;
          currDiff = roundRad(Math.abs(this._diff)) * (this._diff > 0 ? 1 : -1);
        }
        this._endRad = theta;
        this.props.onRotate && this.props.onRotate(currDiff);
      }
    }

    if (ev.mouseState === MouseState.release && this._isMouseDown) {
      hit = true;
      this._isMouseDown = false;
      this._startRad = 0;
      this._endRad = 0;
      this._diff = 0;
      this.props.onMouseUp && this.props.onMouseUp(ev);
    }

    this._prevMouseState = ev.mouseState;
    vec3.copy(this._prevPos, ev.worldPosition);
    return hit;
  };

  private _getIsInRing(ev: UI3DRingMouseEvent) {
    const r = (this.props.radius || 1) * ev.scaleIndex;
    const len = vec3.distance(ev.worldPosition, ev.ringCenter);
    return Math.abs(r - len) < r * 0.1;
  }

  private _getTheta(ev: UI3DRingMouseEvent) {
    vec3.normalize(
      this._startV,
      vec3.sub(this._startV, ev.worldPosition, ev.ringCenter),
    );
    vec3.cross(this._x_to_y, ev.uv_x, ev.uv_y);
    vec3.cross(this._y_to_v, ev.uv_y, this._startV);
    let theta = Math.acos(vec3.dot(this._startV, ev.uv_y));
    if (vec3.dot(this._y_to_v, this._x_to_y) < 0) {
      theta = 2 * Math.PI - theta;
    }
    return theta;
  }

  private _setDiffRad(ev: UI3DRingMouseEvent) {
    vec3.sub(this._prevL, this._prevPos, ev.ringCenter);
    vec3.sub(this._currL, ev.worldPosition, ev.ringCenter);
    const prevLen = vec3.distance(this._prevPos, ev.ringCenter);
    const currLen = vec3.distance(ev.worldPosition, ev.ringCenter);
    vec3.cross(this._tempCross, this._currL, this._prevL);
    const cos = vec3.dot(this._currL, this._prevL) / (prevLen * currLen);
    const currDiffTheta = Math.acos(cos);
    this._diff =
      this._diff +
      Math.abs(currDiffTheta) *
        (vec3.dot(this._tempCross, this.props.normal) > 0 ? -1 : 1);
    this._diff = this._diff % (2 * Math.PI);
  }

  public render() {
    return (
      <UI3DRing
        startRad={this._startRad}
        endRad={this._endRad}
        clockwise={this._diff <= 0}
        highlight={this.props.highlight}
        normal={this.props.normal}
        color={this.props.color}
        fillColor={this.props.fillColor}
        radius={this.props.radius}
        position={this.props.position}
        offset={this.props.offset}
        fixedSize={this.props.fixedSize}
        screenSizeFixed={this.props.screenSizeFixed}
        onMouse={this._handleMouse}
        onDragStart={(ev) => this._getIsInRing(ev)}
      />
    );
  }
}
