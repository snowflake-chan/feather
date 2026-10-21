import * as React from 'react';
import { vec3 } from 'gl-matrix';
import { UI3DMouseEvent } from 'src/engine/ui3d/ui3d-schema';
import { UI3DQuad } from './index';

interface UI3DQuadProps {
  color?: vec3;
  fence?: boolean;
  opacity?: number;
  radius?: number;
  position: vec3;
  normal: vec3;
  offset?: vec3;
  draggable: boolean;
  fixedSize?: number;
  screenSizeFixed?: boolean;
  onMouseDown?: (ev: UI3DMouseEvent) => void;
  onMouseMove?: (ev: UI3DMouseEvent) => void;
  onMouseUp?: (ev: UI3DMouseEvent) => void;
  onDrag?: (prevPos: vec3, currPos: vec3) => void;
  onMouseIn?: () => void;
  onMouseOut?: () => void;
}

export class Quad extends React.Component<UI3DQuadProps, {}> {
  private _prevMouseState: number = -1;
  private _prevPos = vec3.create();
  private _isMouseDown = false;

  private _lastPos = vec3.create();
  private _currentPos = vec3.create();
  private _isDragging = false;

  constructor(props) {
    super(props);
  }

  private onMouseDown(ev: UI3DMouseEvent) {
    this.props.onMouseDown && this.props.onMouseDown(ev);
    vec3.copy(this._lastPos, ev.worldPosition);
    this._isMouseDown = true;
    if (this.props.draggable) {
      this._isDragging = true;
    }
  }

  private onMouseMove(ev: UI3DMouseEvent) {
    this.props.onMouseMove && this.props.onMouseMove(ev);
    if (this._isMouseDown) {
      vec3.copy(this._currentPos, ev.worldPosition);
      this.props.onDrag && this.props.onDrag(this._lastPos, this._currentPos);
      vec3.copy(this._lastPos, this._currentPos);
    }
  }

  private onMouseUp(ev: UI3DMouseEvent) {
    this.props.onMouseUp && this.props.onMouseUp(ev);
    this._isMouseDown = false;
    this._isDragging = false;
  }

  private onMouseOut() {
    this.props.onMouseOut && this.props.onMouseOut();
    this._isMouseDown = false;
    this._isDragging = false;
  }

  private handleMouse(ev: UI3DMouseEvent) {
    let hit = false;
    if (ev.mouseButton === 0) {
      if (ev.mouseState === 1 && this._prevMouseState === 0) {
        this.onMouseDown(ev as UI3DMouseEvent);
        hit = true;
      } else if (
        ev.mouseState === 0 &&
        this._isMouseDown &&
        (this._prevMouseState === 1 || this._prevMouseState === 2)
      ) {
        this.onMouseUp(ev as UI3DMouseEvent);
        hit = true;
      }
      if (ev.mouseState === 0 || ev.mouseState === 2) {
        if (!vec3.equals(ev.worldPosition, this._prevPos)) {
          this.onMouseMove(ev as UI3DMouseEvent);
          hit = true;
        }
      }
    }
    this._prevMouseState = ev.mouseState;
    vec3.copy(this._prevPos, ev.worldPosition);
    return hit;
  }

  public render() {
    let opacity = this.props.opacity || 1;
    if (this._isMouseDown && opacity < 1) {
      opacity = opacity * 2;
    }
    return (
      <UI3DQuad
        position={this.props.position}
        color={this.props.color}
        fence={this.props.fence === true ? 1 : 0}
        opacity={opacity}
        normal={this.props.normal}
        radius={this.props.radius}
        offset={this.props.offset}
        isDragging={this._isDragging}
        fixedSize={this.props.fixedSize}
        screenSizeFixed={this.props.screenSizeFixed}
        onMouse={(ev) => {
          return this.handleMouse(ev as UI3DMouseEvent);
        }}
        onMouseIn={() => {
          this.props.onMouseIn && this.props.onMouseIn();
          return true;
        }}
        onMouseOut={() => {
          if (this._isMouseDown) {
            this.onMouseOut();
            return true;
          }
          return false;
        }}
      />
    );
  }
}
