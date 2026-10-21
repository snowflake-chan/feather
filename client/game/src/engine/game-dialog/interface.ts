import type { DialogClient } from '../dialog/dialog-client';
import type { GameClientState } from '../game-client-schema';
import { GameElement, GameElementType, type HitArea } from '../input/events';
import type { InputController } from '../input/input-controller';
import type { SerializedVec2 } from '../interfaces';

export type Spec = {
  state: GameClientState;
  input: InputController;
  dialogClient: DialogClient;
};

export enum DialogType {
  Text = 'text',
  Input = 'input',
  Select = 'select',
}

export enum InteractiveType {
  CloseButton,
  Content,
  Option,
  Input,
  Confirm,
  Scrollbar,
}

export interface Scrollbar {
  scrollY: number;
  scrollbarHeight: number;
  scrollbarPositionY: number;
}

export type GetContentWH = (
  context2D: CanvasRenderingContext2D,
  lines: string[],
  maxContentWidth: number,
) => {
  contentHeight: number;
  contentWidth?: number;
  minContentHeight?: number;
};

export type DrawContent = (
  context2D: CanvasRenderingContext2D,
  contentX: number,
  maxContentX: number,
  contentY: number,
  contentWidth: number,
  maxContentWidth: number,
  maxLineWidth: number,
  bgHeight: number,
  lines: string[],
  contentFillStyle: string,
  contentHeight: number,
  scrollY: number,
) => { clipHeight: number } & Scrollbar;

export abstract class Dialog<Config> implements GameElement {
  public readonly elementType: GameElementType = GameElementType.GameDialog;
  public abstract readonly type: DialogType;
  protected state: GameClientState;
  protected input: InputController;
  protected dialogClient: DialogClient;

  protected dialogSchema?: {
    rpcId: number;
    config: Config;
  };

  constructor(spec: Spec) {
    const { state, input, dialogClient } = spec;
    this.state = state;
    this.input = input;
    this.dialogClient = dialogClient;
  }

  public destroy() {
    this.dialogSchema = undefined;
  }

  public setDialogSchema(dialogSchema: { rpcId: number; config: Config }) {
    this.dialogSchema = dialogSchema;
  }

  public abstract getContentWH: GetContentWH;

  public abstract drawContent: DrawContent;

  public intersect?: (out: GameElement[], pos: SerializedVec2) => void;

  public onClick?: (targets: GameElement[]) => void;

  public onMove?: (targets: GameElement[]) => void;
}

export abstract class InteractivePanel implements GameElement {
  public readonly elementType: GameElementType = GameElementType.GameDialog;
  public abstract readonly interactiveType: InteractiveType;

  private hitArea?: HitArea;

  public setHitArea(hitArea: HitArea) {
    this.hitArea = hitArea;
  }

  public getHitArea() {
    return this.hitArea;
  }

  public destroy() {
    this.hitArea = undefined;
  }
}
