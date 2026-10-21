import type * as I from '@box/script-api';
import { GameUIImage } from 'src/engine/game-ui/nodes/image';
import { UiRenderable } from './ui-renderable';
import { ClientScriptContext } from '../context/const';
import { isDisplayMode } from 'src/views/edit/components/game-ui/property/util';
import { EventEmitter } from 'src/engine/script/ses/apis/events';

export class UiImage extends UiRenderable implements I.UiImage {
  image!: string;
  imageOpacity!: number;
  imageDisplayMode!: I.ImageDisplayMode;
  readonly complete!: boolean;

  public readonly events: I.EventEmitter<I.UiImageEvents>;
  /**
   * @deprecated 用 events
   */
  public readonly event: UiImage['events'];

  constructor(node: GameUIImage) {
    super(node);

    Object.defineProperties(this, {
      image: {
        get() {
          return node.image;
        },
        set(image: string) {
          node.image = image;
        },
      },
      imageOpacity: {
        get() {
          return node.imageOpacity;
        },
        set(imageOpacity: number) {
          node.imageOpacity = imageOpacity;
        },
      },
      imageDisplayMode: {
        get() {
          return node.imageDisplayMode;
        },
        set(imageDisplayMode: I.ImageDisplayMode) {
          if (isDisplayMode(imageDisplayMode)) {
            node.imageDisplayMode = imageDisplayMode;
            return;
          }

          ClientScriptContext.scriptConsole?.warn(
            'Parameter imageDisplayMode is invalid, it should be an ImageDisplayMode enum.',
          );
        },
      },
      complete: {
        get() {
          return node.complete;
        },
      },
    });

    this.events = new EventEmitter();
    this.event = this.events;

    node.events.addListener('load', () => {
      this.events.emit('load', { target: this });
    });
  }

  static create() {
    return ClientScriptContext.createRenderable('image');
  }
}
