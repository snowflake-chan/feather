import * as React from 'react';

import style from './index.module.css';

export interface RainDirectionProps {
  dX: number;
  dY: number;
  dZ: number;
  disabled?: boolean;
  onChange: (dx: number, dy: number, dz: number) => void;
}

export interface RainDirectionState {}

export class RainDirectionPicker extends React.Component<
  RainDirectionProps,
  RainDirectionState
> {
  public render() {
    const r = Math.max(
      0.001,
      Math.sqrt(
        Math.pow(this.props.dX, 2) +
          Math.pow(this.props.dY, 2) +
          Math.pow(this.props.dZ, 2),
      ),
    );
    const rx = this.props.dX / r;
    const ry = this.props.dZ / r;

    const ax = 36 * (rx + 1);
    const ay = 36 * (ry + 1);

    return (
      <div className={style.container}>
        <svg
          width="72"
          height="72"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 72 72"
          onClick={(ev) => {
            if (this.props.disabled) {
              return;
            }
            const target: SVGElement = ev.target as any;
            const bounds = target.getBoundingClientRect();
            const x = ev.clientX - bounds.x;
            const y = ev.clientY - bounds.y;

            const dx = x - 36;
            const dy = y - 36;
            const dz = Math.max(0, 36 - Math.sqrt(dx * dx + dy * dy));
            const w =
              r / Math.max(0.001, Math.sqrt(dx * dx + dy * dy + dz * dz));

            this.props.onChange(
              dx * w,
              (this.props.dY < 0 ? -dz : dz) * w,
              dy * w,
            );
          }}
        >
          <defs>
            <radialGradient
              id="grad1"
              cx="50%"
              cy="50%"
              r="50%"
              fx="50%"
              fy="50%"
            >
              <stop offset="0%" stopColor="rgba(255,255,255)" stopOpacity="0" />
              <stop
                offset="20%"
                stopColor="rgba(255,255,255)"
                stopOpacity="0"
              />
              <stop
                offset="100%"
                stopColor="rgba(255, 255, 255)"
                stopOpacity="0.8"
              />
            </radialGradient>
          </defs>
          <circle cx={ax} cy={ay} r={4} stroke="none" fill="red" />
          <circle cx={36} cy={36} r={36} fill="url(#grad1)" />
        </svg>
      </div>
    );
  }
}
