import type { GamePlayer, GameEntity, GameEventChannel } from './api';

export type MovementPosition = Readonly<{ x: number; y: number; z: number }>;

/** 客户端位置修正的预应用检查，不是客户端可信的移动证明。 */
export interface GameMovementEvent {
  readonly player: GamePlayer;
  /** 服务器认可的位置快照。 */
  readonly from: MovementPosition;
  /** 客户端上报、尚未应用的候选位置。 */
  readonly to: MovementPosition;
  /** 两次服务器处理采样的间隔；不是客户端时间，也不是物理模拟时长。 */
  readonly elapsedMs: number;
  /** 服务器当前速度与客户端候选速度，使用引擎物理数值单位。 */
  readonly velocity: Readonly<{ from: MovementPosition; to: MovementPosition }>;
  readonly context: Readonly<{
    source: 'client-correction';
    inputTick: number;
    serverTick: number;
    mode: 'edit' | 'play';
    /** 同步监听回调内调用。拒绝本次修正；可提供不超过 128 字符的审计原因，不包含凭据。 */
    reject: (reason?: string) => void;
  }>;
}

export interface GameAnticheat {
  /** 创建一份规则独享的服务端玩家记录；不自动订阅、拒绝、处罚或改变引擎权限。 */
  readonly createTracker: (options?: GameAnticheatTrackerOptions) => GameAnticheatTracker;
  /** 检查输入消息中的逐次主/副操作（点击、攻击、放置等），不是连续按键状态。仅服务端可用。 */
  readonly onAction: GameEventChannel<GameAnticheatActionEvent>;
  /** 连续移动控制：跳跃、奔跑、飞行等按键状态；拒绝会丢弃整个输入消息。 */
  readonly onInput: GameEventChannel<GameAnticheatInputEvent>;
  /** 键盘按下和松开的键码列表，发送者由服务器确定。 */
  readonly onKeyboard: GameEventChannel<GameAnticheatKeyboardEvent>;
  /** 玩家请求交互；target 是候选目标，不代表已通过距离等玩法校验。 */
  readonly onInteract: GameEventChannel<GameAnticheatInteractEvent>;
  /** 客户端脚本通过 remoteChannel 发送的已解析 JSON 数据。 */
  readonly onCustomEvent: GameEventChannel<GameAnticheatCustomEvent>;
  /** 自定义 GUI 按钮、表单等发来的事件名和已解析数据。 */
  readonly onUIEvent: GameEventChannel<GameAnticheatUIEvent>;
  /** 监听已认证玩家的全部游戏协议消息，在业务处理前同步决定是否拒绝。 */
  readonly onMessage: GameEventChannel<GameClientMessageEvent>;
  /**
   * 检查客户端位置修正。监听器必须同步执行，不能 await。
   * 多监听器中任意一个 reject 都会拒绝本次修正；回调异常或超时也拒绝。
   * 不监听服务端脚本传送。返回的 token 支持 cancel、resume、active。
   */
  readonly onMovement: GameEventChannel<GameMovementEvent>;
}

export type ClientMessageData = null | boolean | number | string | readonly ClientMessageData[] |
  { readonly [key: string]: ClientMessageData };

export interface GameAnticheatTrackerOptions {
  /** 每位玩家保留的最新记录数，默认 32；允许 1～256，这是存储上限，不是玩法阈值。 */
  readonly historySize?: number;
  /** 每个服务端脚本 tick 扣减的分数；默认 0（不自动衰减）。只决定记分，不决定处罚。 */
  readonly decayPerTick?: number;
}
export interface GameAnticheatHistoryEntry {
  /** 由服务端脚本时钟写入；record 不接受客户端 tick 参数。 */
  readonly serverTick: number;
  /** JSON 格式的独立只读快照；不是实际命中或作弊的证明。 */
  readonly data: ClientMessageData;
}
export interface GameAnticheatExemption {
  /** 服务端脚本 tick 达到此值时失效，不受浏览器时间或客户端 tick 控制。 */
  readonly untilTick: number;
  readonly reason: string;
}
export interface GameAnticheatTracker {
  /** 当前服务端脚本 tick，不使用浏览器时间。 */
  readonly serverTick: number;
  /** 图主主动记录样本，不自动采集；只接受 JSON 数据，不传整个 player/entity/context。 */
  readonly record: (player: GamePlayer, data: ClientMessageData) => GameAnticheatHistoryEntry;
  /** 按时间顺序返回已保留的最新记录；有容量上限，不等于全部请求历史。 */
  readonly getHistory: (player: GamePlayer) => readonly GameAnticheatHistoryEntry[];
  /** 累计本规则的异常分数并返回当前值；amount 必须是非负有限数值，不会自动处罚。 */
  readonly addScore: (player: GamePlayer, amount: number) => number;
  /** 根据本规则的 decayPerTick 计算当前分数，最低 0。 */
  readonly getScore: (player: GamePlayer) => number;
  /** 只重置分数，保留历史和本规则的临时豁免。 */
  readonly resetScore: (player: GamePlayer) => void;
  /** 设置本规则的临时豁免；ticks 为正整数。只保存标记，图主自行决定跳过哪些检查。 */
  readonly exempt: (player: GamePlayer, options: Readonly<{ ticks: number; reason?: string }>) => void;
  /** 查询本规则的豁免；绝不跳过引擎身份、所有权或消息一致性检查。 */
  readonly isExempt: (player: GamePlayer) => boolean;
  readonly getExemption: (player: GamePlayer) => GameAnticheatExemption | undefined;
  readonly clearExemption: (player: GamePlayer) => void;
  /** 清空某位玩家，或不传 player 清空本规则的历史、分数和豁免；不会撤销引擎检查。 */
  readonly clear: (player?: GamePlayer) => void;
}

export interface GameClientMessageEvent {
  readonly player: GamePlayer;
  /** 引擎注册的协议名和消息名，非客户端自报。 */
  readonly protocol: string;
  readonly message: string;
  /** 解码后的只读副本。敏感字段被遮蔽，原始二进制只提供长度。 */
  readonly data: ClientMessageData;
  readonly unreliable: boolean;
  readonly context: Readonly<{
    source: 'client-message';
    serverTick: number;
    mode: 'edit' | 'play';
    /** 拒绝当前消息的业务处理；不踢出玩家，不修改其他玩家的数据。 */
    reject: (reason?: string) => void;
  }>;
}

type AnticheatContext = GameClientMessageEvent['context'];
/** 客户端候选操作，不是服务器确认的命中。距离、遮挡、冷却由地图规则验证。 */
export interface GameAnticheatAction {
  /** 客户端输入 tick，不能当作可信的服务器时间。 */
  readonly tick: number;
  readonly button: 'action0' | 'action1';
  /** 根据客户端上报的前后状态计算，不能证明物理按键确实按下。 */
  readonly pressed: boolean;
  /** 客户端自报的玩家位置；校验请使用事件的 serverPosition。 */
  readonly position: MovementPosition;
  /** 客户端声称的目标 ID，0 表示未指定实体；必须自行校验。 */
  readonly targetId: number;
  /** 从服务端实体表解析的候选目标；不存在或未指定时为 undefined，不代表命中合法。 */
  readonly target: GameEntity | undefined;
  readonly ray: Readonly<{
    origin: MovementPosition;
    direction: MovementPosition;
    normal: MovementPosition;
    voxel: MovementPosition;
    /** 客户端自报的射线距离；-1 等负值表示未命中。 */
    distance: number;
  }>;
}
export interface GameAnticheatActionEvent {
  readonly player: GamePlayer;
  /** 服务端脚本当前认可的实体位置快照；不是客户端 position，也不是历史回放位置。 */
  readonly serverPosition: MovementPosition;
  /** 一条输入消息中的所有主/副操作变化，包括松开；重复操作不会被合并。 */
  readonly actions: readonly GameAnticheatAction[];
  /** reject 拒绝整条输入消息（包括移动控制），不会踢出玩家。只在同步回调内有效。 */
  readonly context: AnticheatContext;
}
export interface GameAnticheatInputEvent {
  readonly player: GamePlayer;
  /** 客户端上报的输入 tick，不能当作可信的服务器时间。 */
  readonly tick: number;
  readonly buttons: Readonly<{
    jump: boolean; walk: boolean; crouch: boolean; run: boolean; fly: boolean;
    doubleJump: boolean; action0: boolean; action1: boolean;
  }>;
  readonly context: AnticheatContext;
}
export interface GameAnticheatKeyboardEvent {
  readonly player: GamePlayer;
  /** 客户端上报的输入 tick。 */
  readonly tick: number;
  readonly pressed: readonly number[];
  readonly released: readonly number[];
  readonly context: AnticheatContext;
}
export interface GameAnticheatInteractEvent {
  readonly player: GamePlayer;
  /** 客户端上报的交互 tick。 */
  readonly tick: number;
  readonly target: GameEntity | undefined;
  readonly context: AnticheatContext;
}
export interface GameAnticheatCustomEvent {
  readonly player: GamePlayer;
  /** 客户端上报的事件 tick。 */
  readonly tick: number;
  readonly data: ClientMessageData;
  readonly context: AnticheatContext;
}
export interface GameAnticheatUIEvent {
  readonly player: GamePlayer;
  readonly name: string;
  readonly data: ClientMessageData;
  readonly context: AnticheatContext;
}
