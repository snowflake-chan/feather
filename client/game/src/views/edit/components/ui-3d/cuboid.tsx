import * as React from 'react';
import { vec3 } from 'gl-matrix';
import { UI3DMouseEvent } from 'src/engine/ui3d/ui3d-schema';
import { UI3DBox } from './index';

interface UI3DCuboidProps {
  color?: vec3;
  opacity?: number;
  dimension?: vec3;
  position: vec3;
  line?: boolean;
  offset?: vec3;
  centerAtBottom: boolean;
  fixedSize?: number;
  screenSizeFixed?: boolean;
  onMouseDown?: (ev) => void;
  onMouseMove?: (ev) => void;
  onMouseUp?: (ev) => void;
  onDrag?: (prevPos: vec3, currPos: vec3) => void;
}

export class Cuboid extends React.Component<UI3DCuboidProps, {}> {
  private _prevMouseState: number = -1;
  private _prevPos = vec3.create();
  private _isMouseDown = false;

  private _lastPos = vec3.create();
  private _currentPos = vec3.create();

  constructor(props) {
    super(props);
  }

  private onMouseDown(ev: UI3DMouseEvent) {
    this.props.onMouseDown && this.props.onMouseDown(ev);
    vec3.copy(this._lastPos, ev.worldPosition);
    this._isMouseDown = true;
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
  }

  private handleMouse(ev: UI3DMouseEvent) {
    let hit = false;
    if (ev.mouseButton === 0) {
      if (ev.mouseState === 1 && this._prevMouseState === 0) {
        hit = true;
        this.onMouseDown(ev as UI3DMouseEvent);
      } else if (
        ev.mouseState === 0 &&
        this._isMouseDown &&
        (this._prevMouseState === 1 || this._prevMouseState === 2)
      ) {
        hit = true;
        this.onMouseUp(ev as UI3DMouseEvent);
      }
      if (ev.mouseState === 0 || ev.mouseState === 2) {
        if (!vec3.equals(ev.worldPosition, this._prevPos)) {
          hit = true;
          this.onMouseMove(ev as UI3DMouseEvent);
        }
      }
    }
    this._prevMouseState = ev.mouseState;
    vec3.copy(this._prevPos, ev.worldPosition);
    return hit;
  }

  public render() {
    return (
      <UI3DBox
        position={this.props.position}
        centerAtBottom={this.props.centerAtBottom}
        offset={this.props.offset}
        dimension={this.props.dimension}
        color={this.props.color}
        opacity={this.props.opacity}
        line={this.props.line}
        fixedSize={this.props.fixedSize}
        screenSizeFixed={this.props.screenSizeFixed}
        onMouse={(ev) => {
          return this.handleMouse(ev as UI3DMouseEvent);
        }}
      />
    );
  }
}
