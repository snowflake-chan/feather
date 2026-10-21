import { nanoid } from 'nanoid/non-secure';
import { UiImage } from 'src/engine/script/ses/apis/gui/ui-image';
import type { BaseSpec } from './base';
import { GameUIRenderable } from './renderable';
import EmptyImage from './photo-image.png';
import { ImageStatus } from 'src/engine/resource/schema';
import { createCanvas2DImageSource } from 'src/engine/utils/image';
import { ImageDisplayMode } from '@box/schema/project/ui-rda/defs';
import EventEmitter from 'events';

const EMPTY_IMAGE = createCanvas2DImageSource(EmptyImage);

export type GetImageRes = HTMLImageElement | ImageBitmap | ImageStatus;
export type GetImageData = (image: string) => GetImageRes;

interface Spec extends BaseSpec {
  getImageData: GetImageData;
}

export class GameUIImage extends GameUIRenderable {
  protected ApiType = UiImage;

  public _api: InstanceType<typeof this.ApiType> | undefined;

  public api() {
    if (!this._api) {
      this._api = new this.ApiType(this);
    }

    return this._api;
  }

  public readonly events: EventEmitter<{ load: [] }>;

  public image: string = '';

  public imageOpacity = 1;

  public imageDisplayMode = ImageDisplayMode.Fill;

  /**
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/complete
   */
  public complete = true;

  private getImageData: GetImageData;

  private currElement?: HTMLImageElement | ImageBitmap;

  constructor(spec: Spec) {
    const { getImageData, ...base } = spec;

    super(base);

    this.getImageData = getImageData;

    this.events = new EventEmitter();
  }

  public draw(context: CanvasRenderingContext2D): void {
    let imageElement: HTMLImageElement | ImageBitmap | undefined;

    const res = this.getImageData(this.image);
    switch (res) {
      case ImageStatus.Loading:
        imageElement = this.currElement;
        this.complete = false;
        break;
      case ImageStatus.Error:
        if (EMPTY_IMAGE.image) {
          imageElement = EMPTY_IMAGE.image;
        }
        this.complete = true;
        break;
      default:
        imageElement = res;
        if (this.currElement !== imageElement) {
          this.complete = true;
          // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/load_event
          this.events.emit('load');
        }
    }

    const x = -this.rotatePivot[0];
    const y = -this.rotatePivot[1];
    const [w, h] = this.absSize;
    const [r, g, b] = this.backgroundColor;
    const scale = this.absScaleValue;

    context.beginPath();

    context.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.backgroundOpacity})`;
    context.fillRect(x, y, w, h);

    if (imageElement) {
      const alphaCache = context.globalAlpha;

      context.globalAlpha = this.imageOpacity;

      if (h > 0 && w > 0) {
        if (
          imageElement === EMPTY_IMAGE.image ||
          this.imageDisplayMode === ImageDisplayMode.Fill
        ) {
          context.drawImage(imageElement, x, y, w, h);
        } else {
          const { width: imgW, height: imgH } = imageElement;
          const imgRatio = imgW / imgH;
          const targetRatio = w / h;
          switch (this.imageDisplayMode) {
            case ImageDisplayMode.Contain: {
              let drawWidth: number,
                drawHeight: number,
                offsetX: number,
                offsetY: number;
              if (imgRatio > targetRatio) {
                // Image is wider than target, fit by width
                drawWidth = w;
                drawHeight = w / imgRatio;
                offsetX = 0;
                offsetY = (h - drawHeight) / 2;
              } else {
                // Image is taller than target, fit by height
                drawWidth = h * imgRatio;
                drawHeight = h;
                offsetX = (w - drawWidth) / 2;
                offsetY = 0;
              }
              context.drawImage(
                imageElement,
                x + offsetX,
                y + offsetY,
                drawWidth,
                drawHeight,
              );
              break;
            }
            case ImageDisplayMode.Cover: {
              let sx: number, sy: number, sWidth: number, sHeight: number;
              if (imgRatio > targetRatio) {
                // Image is wider than target, crop width
                sHeight = imgH;
                sWidth = imgH * targetRatio;
                sx = (imgW - sWidth) / 2;
                sy = 0;
              } else {
                // Image is taller than target, crop height
                sWidth = imgW;
                sHeight = imgW / targetRatio;
                sx = 0;
                sy = (imgH - sHeight) / 2;
              }
              context.drawImage(
                imageElement,
                sx,
                sy,
                sWidth,
                sHeight,
                x,
                y,
                w,
                h,
              );
              break;
            }
            case ImageDisplayMode.None: {
              let sx: number, sy: number, sWidth: number, sHeight: number;
              sWidth = w / scale;
              sHeight = h / scale;
              sx = (imgW - sWidth) / 2;
              sy = (imgH - sHeight) / 2;
              context.drawImage(
                imageElement,
                sx,
                sy,
                sWidth,
                sHeight,
                x,
                y,
                w,
                h,
              );
              break;
            }
          }
        }
      }

      context.globalAlpha = alphaCache;

      this.currElement = imageElement;
    }

    context.closePath();
  }

  public copy(source: GameUIImage) {
    super.copy(source);

    this.image = source.image;
    this.imageOpacity = source.imageOpacity;
    this.imageDisplayMode = source.imageDisplayMode;

    return this;
  }

  public clone() {
    return new (this.constructor as typeof GameUIImage)({
      id: nanoid(),
      getImageData: this.getImageData,
    }).copy(this);
  }
}
