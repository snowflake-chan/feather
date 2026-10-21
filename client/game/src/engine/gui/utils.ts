import { MouseButton } from '@box/schema/input/input-schema';
import { SerializedVec2 } from '../interfaces';
import { GUIMouseEvent } from './element';

export function createCanvas(width: number, height: number) {
  const ratio = window.devicePixelRatio || 1;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(ratio, ratio);
  return { canvas, ctx };
}

export function roundRect(
  this: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  if (w < 2 * r) {
    r = w / 2;
  }
  if (h < 2 * r) {
    r = h / 2;
  }
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  return this;
}

export function createProperties<
  T extends abstract new (...args: any) => any,
  K extends keyof InstanceType<T>,
>(_: T, properties: K[]) {
  return properties;
}

export interface PropertyProxy<T, U> {
  (dst: any, src: T): any;
}

export type GetProxyType<T extends PropertyProxy<any, any>> =
  T extends PropertyProxy<any, infer R> ? R : any;

export type RenameType<
  T extends { [name: string]: any },
  U extends { [name: string]: string },
> = {
  [K in keyof T as K extends keyof U ? U[K] : K]: T[K];
};

export function createProxy<
  T extends abstract new (...args: any) => any,
  K extends keyof InstanceType<T>,
  U extends { [key in K]?: string } = {},
>(
  _: T,
  properties: K[],
  rename?: U,
): PropertyProxy<
  InstanceType<T>,
  RenameType<
    Pick<InstanceType<T>, K>,
    // @ts-ignore
    U
  >
> {
  return (dst: any, src: InstanceType<T>) => {
    properties.forEach((name) => {
      const newName = (rename && rename[name]) || name;
      Object.defineProperty(dst, newName as string, {
        get() {
          return src[name];
        },
        set(v) {
          src[name] = v;
        },
      });
    });
  };
}

export function proxyProperty(
  dst: any,
  src: any,
  properties: string[],
  rename: any = {},
) {
  properties.forEach((name) => {
    const newName = rename[name] || name;
    Object.defineProperty(dst, newName, {
      get() {
        return src[name];
      },
      set(v) {
        src[name] = v;
      },
    });
  });
}

export function updateMouseEventAttributes(
  dest: GUIMouseEvent,
  mouse: SerializedVec2,
  mouseButton: MouseButton,
): GUIMouseEvent {
  const [x, y] = mouse;
  dest.x = x;
  dest.y = y;
  dest.button = mouseButton;

  dest.movementX = 0;

  dest.movementY = 0;

  return dest;
}
