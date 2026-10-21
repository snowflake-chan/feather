import * as React from 'react';
import { vec3 } from 'gl-matrix';
import { UI3DMouseEvent } from 'src/engine/ui3d/ui3d-schema';
import { UI3DBox, UI3DCone, UI3DLine } from '.';
import { MouseButton, MouseState } from '@box/schema/input/input-schema';

export enum ArrowDir {
  x = 'x',
  y = 'y',
  z = 'z',
}

interface UI3DArrowProps {
  height: number;
  cosA: number;
  axis: ArrowDir;
  color?: vec3;
  radialSegments?: number;
  position: vec3;
  offset?: vec3;
  fixedSize?: number;
  screenSizeFixed?: boolean;
  draggable: boolean;
  onMouseDown?: (ev: UI3DMouseEvent) => void;
  onMouseMove?: (ev: UI3DMouseEvent) => void;
  onMouseUp?: (ev: UI3DMouseEvent) => void;
  onDrag?: (prevPos: vec3, currPos: vec3) => void;
  onMouseIn?: () => void;
  onMouseOut?: () => void;
  onMouseOver?: (ev: UI3DMouseEvent) => void;
}

export class Arrow extends React.Component<UI3DArrowProps, {}> {
  private _prevMouseState: number = MouseState.release;
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
    if (this._isDragging) {
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

  private handleMouse = (ev: UI3DMouseEvent) => {
    let hit = false;
    if (ev.mouseButton === MouseButton.left) {
      if (
        ev.mouseState === MouseState.press &&
        this._prevMouseState === MouseState.release
      ) {
        hit = true;
        this.onMouseDown(ev);
      }
      if (
        ev.mouseState !== MouseState.press &&
        !vec3.equals(ev.worldPosition, this._prevPos)
      ) {
        hit = true;
        this.onMouseMove(ev);
      }
    }

    if (
      ev.mouseState === MouseState.release &&
      (this._isMouseDown || this._isDragging)
    ) {
      hit = true;
      this.onMouseUp(ev);
    }
    if (!this._isDragging) {
      this.props.onMouseOver && this.props.onMouseOver(ev);
    }
    this._prevMouseState = ev.mouseState;
    vec3.copy(this._prevPos, ev.worldPosition);
    return hit;
  };

  private handleDragStart = () => true;

  public render() {
    const center = this.props.position;
    const offset = this.props.offset || [0, 0, 0];
    return (
      <div>
        <UI3DCone
          height={this.props.height}
          cosA={this.props.cosA}
          axis={this.props.axis}
          color={this.props.color}
          position={this.props.position}
          radialSegments={this.props.radialSegments}
          offset={this.props.offset}
          fixedSize={this.props.fixedSize}
          screenSizeFixed={this.props.screenSizeFixed}
        />
        <UI3DLine
          start={center}
          end={vec3.fromValues(
            center[0] + offset[0],
            center[1] + offset[1],
            center[2] + offset[2],
          )}
          width={0.01}
          fixedSize={this.props.fixedSize}
          screenSizeFixed={this.props.screenSizeFixed}
          color={this.props.color}
          isDragging={this._isDragging}
          onDragStart={this.handleDragStart}
          onMouse={this.handleMouse}
          onMouseIn={() => {
            this.props.onMouseIn?.call(this);
            return false;
          }}
          onMouseOut={() => {
            this.props.onMouseOut?.call(this);
            return false;
          }}
        />
        <UI3DBox
          position={this.props.position}
          dimension={vec3.fromValues(0.05, 0.05, 0.05)}
          color={vec3.fromValues(1, 1, 1)}
          screenSizeFixed={this.props.screenSizeFixed}
        />
      </div>
    );
  }
}
