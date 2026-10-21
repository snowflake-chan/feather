import { retrieveWithImage } from '@box/content-server/image';
import type { GameClientState } from '../game-client-schema';
import type { InputController } from '../input/input-controller';
import type { ResourceController } from '../resource';
import { GamepadButtons } from './const';
import { SerializedVec2 } from '../interfaces';
import { GameElement, GameElementType } from '../input/events';
import { ImageStatus } from '../resource/schema';

export type Spec = {
  state: GameClientState;
  input: InputController;
  resourceController: ResourceController;
  setEvent3DPropagation: (propagation: boolean) => void;
  getGamepadHash?: (group: string, part: string) => string;
};

export interface JoystickSize {
  left: number;
  bottom: number;
  radius: number;
  hotHeight: number;
  hotWidth: number;
}

export interface JumpSize {
  right: number;
  bottom: number;
  radius: number;
  iconSize: number;
}

export interface ButtonSize {
  radius: number;
  iconSize: number;
  iconRadius: number;
}

export interface Offset {
  left: number;
  bottom: number;
}

export interface HitArea {
  x: number;
  y: number;
  w: number;
  h: number;
}

type DrawImage = HTMLImageElement | ImageBitmap | undefined;

export abstract class GamepadBtn implements GameElement {
  public readonly elementType: GameElementType = GameElementType.Gamepad;
  protected state: GameClientState;
  protected input: InputController;
  protected resourceController: ResourceController;
  constructor(spec: Spec) {
    const { state, input, resourceController, getGamepadHash } = spec;
    this.state = state;
    this.input = input;
    this.resourceController = resourceController;
    this.getGamepadHash = getGamepadHash;
  }

  public abstract readonly name: GamepadButtons;
  public abstract getHitArea: (
    screenWidth: number,
    screenHeight: number,
  ) => HitArea;
  public abstract draw: (
    context2D: CanvasRenderingContext2D,
    screenWidth: number,
    screenHeight: number,
  ) => void;
  public active: boolean = false;
  public onTouchStart?: (pos: SerializedVec2) => void;
  public onTouchMove?: (diff: SerializedVec2) => void;
  public onTouchEnd?: () => void;
  public getGamepadHash?: (group: string, part: string) => string;
  public getDrawImage: (url: string, currImage: DrawImage) => DrawImage = (
    url: string,
    currImage: DrawImage,
  ) => {
    const image = this.resourceController.fetchImageByMetadataHash(
      url,
      retrieveWithImage,
    );
    switch (image) {
      case ImageStatus.Loading:
        return currImage;
      case ImageStatus.Error:
        return undefined;
      default:
        return image;
    }
  };
}
