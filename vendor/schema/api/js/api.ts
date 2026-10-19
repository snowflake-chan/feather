import {
  GameVector3,
  GameQuaternion,
  GameRGBAColor,
  GameRGBColor,
  GameBounds3,
} from './math';
import { URL } from './url';
import type { GameModeration } from './moderation';
import type { GameAnticheat } from './anticheat';

export type TELEPORT_ERROR_STATUS =
  | 'PLAYER_OFFLINE'
  | 'ACCESS_DENIED'
  | 'UNKNOWN';
export type TeleportType = (
  mapId: string,
  players: GameEntity[],
  serverId?: string,
) => Promise<TeleportResult>;

export type TeleportResult = { serverId: string };

export interface GameSoundEffectConfig {
  sample: string;
  radius: number;
  gain: number;
  gainRange: number;
  pitch: number;
  pitchRange: number;
}

/**
 * A single sound effect table
 */
export class GameSoundEffect implements GameSoundEffectConfig {
  /**
   * Sample weight
   */
  public radius: number = 32;

  /**
   * Volume gain, makes sound louder
   */
  public gain: number = 1;

  /**
   * Variability in volume gain
   */
  public gainRange: number = 0;

  /**
   * Pitch adjustment multiplier.
   * * 1 : normal
   * * < 1 : slower playback
   * * > 1 : faster playback
   */
  public pitch: number = 1;

  /**
   * Variability in pitch
   */
  public pitchRange: number = 0;

  /**
   * Path to sample
   */
  public sample: string = '';
}

/**
 * Triggers can be used to detect when an object enters some zone or leaves.
 */
export class GameZone {
  /**
   * Bounds of the zone
   */
  public bounds = new GameBounds3(
    new GameVector3(0, 0, 0),
    new GameVector3(0, 0, 0),
  );

  /**
   * Selector filter
   */
  public selector: GameSelectorString = '*';

  /**
   * Controls how much the object's mass applies to the force
   * 0 = behaves like gravity
   * 1 = behaves like wind
   */
  public massScale = 0;

  /**
   * The amount of force to apply to the object
   */
  public force = new GameVector3(0, 0, 0);

  public fogEnabled = false;
  public fogColor = new GameRGBColor(1, 1, 1);
  public fogStartDistance = 0;
  public fogHeightOffset = -8;
  public fogHeightFalloff = 0.8;
  public fogDensity = 0;
  public fogMax = 1;

  public snowEnabled = false;
  public snowDensity = 1;
  public snowSizeLo = 0.1;
  public snowSizeHi = 1;
  public snowFallSpeed = 1;
  public snowSpinSpeed = 0;
  public snowColor = new GameRGBAColor(1, 1, 1, 1);
  public snowTexture = 'snow/snow2.part';

  public rainEnabled = false;
  public rainDensity = 1;
  public rainDirection = new GameVector3(0, 1, 0);
  public rainSpeed = 1;
  public rainSizeLo = 0.5;
  public rainSizeHi = 0.5;
  public rainInterference = 0;
  public rainColor = new GameRGBAColor(1, 1, 1, 1);

  public skyEnabled = false;
  public skyMode: 'natural' | 'manual' = 'natural';
  public skySunPhase = 4 / 24;
  public skySunFrequency = 0;
  public skyLunarPhase = 0;
  public skySunDirection = new GameVector3(0, -1, 0);
  public skySunLight = new GameRGBColor(1000, 1000, 1000);
  public skyLeftLight = new GameRGBColor(0, 0, 0);
  public skyRightLight = new GameRGBColor(0, 0, 0);
  public skyBottomLight = new GameRGBColor(0, 0, 0);
  public skyTopLight = new GameRGBColor(0, 0, 0);
  public skyFrontLight = new GameRGBColor(0, 0, 0);
  public skyBackLight = new GameRGBColor(0, 0, 0);

  /**
   * @ignore
   */
  constructor(
    /**
     * List all entities
     */
    public entities: () => GameEntity[],

    /**
     * Triggered when an entity enters the zone
     */
    public onEnter: GameEventChannel<GameTriggerEvent>,
    public nextEnter: GameEventFuture<GameTriggerEvent>,

    /**
     * Triggers when an entity leaves the zone
     */
    public onLeave: GameEventChannel<GameTriggerEvent>,
    public nextLeave: GameEventFuture<GameTriggerEvent>,

    /**
     * Destroys the zone
     */
    public remove: () => void,
  ) {}
}

/**
 * Trigger constructor parameters
 */
export type GameZoneConfig = {
  bounds: GameBounds3;
  selector: GameSelectorString;

  massScale: number;
  force: GameVector3;

  fogEnabled: boolean;
  fogColor: GameRGBColor;
  fogStartDistance: number;
  fogHeightOffset: number;
  fogHeightFalloff: number;
  fogDensity: number;
  fogMax: number;

  snowEnabled: boolean;
  snowDensity: number;
  snowSizeLo: number;
  snowSizeHi: number;
  snowFallSpeed: number;
  snowSpinSpeed: number;
  snowColor: GameRGBAColor;
  snowTexture: string;

  rainEnabled: boolean;
  rainDensity: number;
  rainDirection: GameVector3;
  rainSpeed: number;
  rainSizeLo: number;
  rainSizeHi: number;
  rainInterference: number;
  rainColor: GameRGBAColor;

  skyEnabled: boolean;
  skyMode: 'natural' | 'manual';
  skySunPhase: number;
  skySunFrequency: number;
  skyLunarPhase: number;
  skySunDirection: GameVector3;
  skySunLight: GameRGBColor;
  skyLeftLight: GameRGBColor;
  skyRightLight: GameRGBColor;
  skyBottomLight: GameRGBColor;
  skyTopLight: GameRGBColor;
  skyFrontLight: GameRGBColor;
  skyBackLight: GameRGBColor;
};

export enum GameAnimationPlaybackState {
  PENDING = 'pending',
  RUNNING = 'running',
  FINISHED = 'finished',
}

export enum GameAnimationDirection {
  NORMAL = 'normal',
  REVERSE = 'reverse',
  WRAP = 'wrap',
  WRAP_REVERSE = 'wrap-reverse',
  ALTERNATE = 'alternate',
  ALTERNATE_REVERSE = 'alternate-reverse',
}

export enum GameEasing {
  NONE = 'none',
  LINEAR = 'linear',
  QUADRATIC = 'quadratic',
  SINE = 'sine',
  EXP = 'exp',
  BACK = 'back',
  ELASTIC = 'elastic',
  BOUNCE = 'bounce',
  CIRCLE = 'circle',
}

export interface GameAnimationPlaybackConfig {
  startTick: number;
  delay: number;
  endDelay: number;
  duration: number;
  direction: GameAnimationDirection;
  iterationStart: number;
  iterations: number;
}

export class GameAnimation<KeyframeType, TargetType> {
  /**
   * Current playback time for animation (in animation frames)
   */
  public currentTime: number = 0;

  /**
   * Start tick for animation
   */
  public startTime: number = 0;

  /**
   * Current playback state for animation
   */
  public playState: GameAnimationPlaybackState =
    GameAnimationPlaybackState.PENDING;

  /**
   * Playback rate in frames per tick
   */
  public playbackRate: number = 1;

  /**
   * @ignore
   */
  constructor(
    /**
     * Animation target object (could be world, player or entity)
     */
    public target: TargetType,

    /**
     * Returns all animation keyframes
     */
    public keyframes: () => Partial<KeyframeType>[],

    currentTime: () => number,
    startTime: () => number,
    playState: () => GameAnimationPlaybackState,
    playbackRate: () => number,

    /**
     * Starts or restarts playback for the animation.
     */
    public play: (playback?: Partial<GameAnimationPlaybackConfig>) => void,

    /**
     * Cancels current animation playback
     */
    public cancel: () => void,

    /**
     * Fires when animation begins
     */
    public onReady: GameEventChannel<
      GameAnimationEvent<KeyframeType, TargetType>
    >,
    public nextReady: GameEventFuture<
      GameAnimationEvent<KeyframeType, TargetType>
    >,

    /**
     * Fires when animation completes successfully
     */
    public onFinish: GameEventChannel<
      GameAnimationEvent<KeyframeType, TargetType>
    >,
    public nextFinish: GameEventFuture<
      GameAnimationEvent<KeyframeType, TargetType>
    >,
  ) {
    Object.defineProperties(this, {
      currentTime: {
        get: currentTime,
      },
      startTime: {
        get: startTime,
      },
      playState: {
        get: playState,
      },
      playbackRate: {
        get: playbackRate,
      },
    });
  }

  public then<T>(
    resolve: (event: GameAnimationEvent<KeyframeType, TargetType>) => T,
    reject?: (error: any) => any,
  ) {
    return this.nextFinish().then(resolve, reject);
  }
}

export interface GameWorldKeyframe {
  duration: number;
  easeIn: GameEasing;
  easeOut: GameEasing;

  fogColor: GameRGBColor;
  fogStartDistance: number;
  fogHeightOffset: number;
  fogHeightFalloff: number;
  fogUniformDensity: number;
  maxFog: number;

  lightMode: 'natural' | 'manual';
  sunPhase: number;
  sunFrequency: number;
  lunarPhase: number;
  sunDirection: GameVector3;
  sunLight: GameRGBColor;
  skyLeftLight: GameRGBColor;
  skyRightLight: GameRGBColor;
  skyBottomLight: GameRGBColor;
  skyTopLight: GameRGBColor;
  skyFrontLight: GameRGBColor;
  skyBackLight: GameRGBColor;

  rainDensity: number;
  rainDirection: GameVector3;
  rainSpeed: number;
  rainSizeLo: number;
  rainSizeHi: number;
  rainInterference: number;
  rainColor: GameRGBAColor;

  snowDensity: number;
  snowSizeLo: number;
  snowSizeHi: number;
  snowFallSpeed: number;
  snowSpinSpeed: number;
  snowColor: GameRGBAColor;
  snowTexture: string;

  gravity: number;
  airFriction: number;
}

export class Sound {
  constructor(
    public resume: (currentTime?: number) => void,
    public setCurrentTime: (currentTime: number) => void,
    public pause: () => void,
    public stop: () => void,
  ) {}
}

/**
 * {@link Game.GameWorld} is the main entry point to the engine API.  Using this object you can control
 * global scene properties like the weather, timeOfDay, etc. and perform searches on the set of all {@link Game.GameEntity}
 * which exist in the world.
 */
export class GameWorld {
  /** 地图管理能力，由服主在后台授权； */
  public moderation!: GameModeration;
  /** 客户端移动修正检查，拒绝本次修正但不踢出玩家。 */
  public anticheat!: GameAnticheat;
  /**
   * The name of the project (read only)
   */
  public projectName = 'Project';

  public currentTick: number = 0;

  /**
   * Type of lighting to use for the sky and ambient light
   */
  public lightMode: 'natural' | 'manual' = 'natural';

  /**
   * Global scene-light intensity. This feeds the renderer's shared lighting
   * uniform, so it is safe to animate from a map script without recompiling a
   * shader. Values are clamped to the supported range of 0 through 0.6.
   * @category rendering
   */
  public globalLight = 0.3;

  /**
   * The initial phase of the sun's motion through the sky.  The time of day is calculated using the formula:
   * `timeOfDay = (sunPhase + sunFrequency * tick) % 1`
   * @category weather
   */
  public sunPhase = 0;
  /**
   * The frequency at which the sun moves through the sky.  Higher values = faster sun movement.
   * @category weather
   */
  public sunFrequency = 0;
  /**
   * The phase of the moon.  Must be between 0 and 1
   * @category weather
   */
  public lunarPhase = 0;

  /**
   * Direction of sun (only used if ambientLightMode === 'manual)
   * @category weather
   */
  public sunDirection = new GameVector3(0, -1, 0);

  /**
   * Light level of the sun (only used if ambientLightMode === 'manual')
   * @category weather
   */
  public sunLight = new GameRGBColor(1000, 1000, 1000);

  /**
   * -x direction ambient light value (only used if ambientLightMode === 'manual')
   * @category weather
   */
  public skyLeftLight = new GameRGBColor(0, 0, 0);

  /**
   * +x direction ambient light value (only used if ambientLightMode === 'manual')
   * @category weather
   */
  public skyRightLight = new GameRGBColor(0, 0, 0);

  /**
   * -y direction ambient light value (only used if ambientLightMode === 'manual')
   * @category weather
   */
  public skyBottomLight = new GameRGBColor(0, 0, 0);

  /**
   * +y direction ambient light value (only used if ambientLightMode === 'manual')
   * @category weather
   */
  public skyTopLight = new GameRGBColor(0, 0, 0);

  /**
   * -z direction ambient light value (only used if ambientLightMode === 'manual')
   * @category weather
   */
  public skyFrontLight = new GameRGBColor(0, 0, 0);

  /**
   * +z direction ambient light value (only used if ambientLightMode === 'manual')
   * @category weather
   */
  public skyBackLight = new GameRGBColor(0, 0, 0);

  /**
   * Display gamma used by the final render pass. This is a renderer parameter,
   * not shader source: setting it changes the image immediately and does not
   * create a material or shader-program variant. Values are clamped to 0.1
   * through 3.
   * @category rendering
   */
  public gamma = 1.3;

  /**
   * Fog color
   * @category weather
   */
  public fogColor = new GameRGBColor(1, 1, 1);

  /**
   * Distance when fog starts
   * @category weather
   */
  public fogStartDistance = 0;

  /**
   * Height that fog starts at
   * @category weather
   */
  public fogHeightOffset = 0;

  /**
   * Rate that height fog decays
   * @category weather
   */
  public fogHeightFalloff = 0.8;

  /**
   * Amount of uniform fog (if > 0, cannot see skybox)
   * @category weather
   */
  public fogUniformDensity = 0;

  /**
   * Maximum amount of fog
   * @category weather
   */
  public maxFog = 1;

  /**
   * @category weather
   */
  public snowDensity = 0;
  /**
   * @category weather
   */
  public snowSizeLo = 0;
  /**
   * @category weather
   */
  public snowSizeHi = 1;
  /**
   * @category weather
   */
  public snowFallSpeed = 1;
  /**
   * @category weather
   */
  public snowSpinSpeed = 0;
  /**
   * @category weather
   */
  public snowColor = new GameRGBAColor(1, 1, 1, 1);
  /**
   * @category weather
   */
  public snowTexture = '';

  /**
   * @category weather
   */
  public rainDensity = 0;
  /**
   * @category weather
   */
  public rainDirection = new GameVector3(0, 1, 0);
  /**
   * @category weather
   */
  public rainSpeed = 1;
  /**
   * @category weather
   */
  public rainSizeLo = 0;
  /**
   * @category weather
   */
  public rainSizeHi = 1;
  /**
   * @category weather
   */
  public rainInterference = 0;
  /**
   * @category weather
   */
  public rainColor = new GameRGBAColor(1, 1, 1, 1);

  /**
   * Amount and direction of gravitational field
   * @category physics
   */
  public gravity = -0.1;
  /**
   * Amount of air friction
   * @category physics
   */
  public airFriction = 0.001;

  /**
   * Use obb rigid body to solve physics
   * @category physics
   */
  public useOBB = false;

  /**
   * Plays when a voxel breaks
   * @category sound
   */
  public breakVoxelSound = new GameSoundEffect();
  /**
   * Plays when a voxel is placed
   * @category sound
   */
  public placeVoxelSound = new GameSoundEffect();
  /**
   * Plays when a player joins
   * @category sound
   */
  public playerJoinSound = new GameSoundEffect();
  /**
   * Plays when a player leaves
   * @category sound
   */
  public playerLeaveSound = new GameSoundEffect();
  /**
   * Ambient sound, plays in background globally
   * @category sound
   */
  public ambientSound = new GameSoundEffect();

  /**
   * @ignore
   */
  constructor(
    /**
     * Public URL of the currently running world
     */
    public url: URL,

    /**
     * Returns the remaining number of entities the script is allowed to create
     * @category entities
     */
    public entityQuota: () => number,

    /**
     * @category health
     */
    public onRespawn: GameEventChannel<GameRespawnEvent>,
    public nextRespawn: GameEventFuture<GameRespawnEvent>,

    /**
     * Creates a new {@link Game.GameEntity} or makes a copy of an existing entity.
     * If entity quota is exceeded, then returns null.
     * @param config A set of initial values for the entity or a new entity which we want to copy
     * @returns A newly created entity with the given parameters
     * @category entity
     */
    public createEntity: (
      config: Partial<GameEntityConfig>,
    ) => GameEntity | null,

    /**
     * The entities in game can be searched using a jQuery selector-like syntax.
     * For more examples see {@link Game.GameSelectorString}
     *
     * @param selector a selector search pattern
     * @returns the first entity which matches the selector/
     * @category entity
     */
    public querySelector: (selector: GameSelectorString) => GameEntity | null,

    /**
     * The entities in game can be searched using a jQuery selector-like syntax
     * For more examples see {@link Game.GameSelectorString}
     *
     * @param selector a selector search pattern
     * @returns All entities which match the selector
     * @category entity
     */
    public querySelectorAll: (selector: GameSelectorString) => GameEntity[],

    /**
     * Test a selector on an entity
     *
     * @param selector the selector pattern to test
     * @param entity The entity to test
     * @category entity
     */
    public testSelector: (
      selector: GameSelectorString,
      entity: GameEntity,
    ) => boolean,

    /**
     * Disables collisions between the set of all entities matching aSelector and bSelector
     *
     * @param aSelector the selector for the first set of entities
     * @param bSelector the selector for the second set of entities
     * @category physics
     */
    public addCollisionFilter: (
      aSelector: GameSelectorString,
      bSelector: GameSelectorString,
    ) => void,

    /**
     * Removes collision filter between aSelector and bSelector
     *
     * @param aSelector the selector for the first set of entities
     * @param bSelector the selector for the second set of entities
     * @category physics
     */
    public removeCollisionFilter: (
      aSelector: GameSelectorString,
      bSelector: GameSelectorString,
    ) => void,

    /**
     * Clears all collision filters
     *
     * @category physics
     */
    public clearCollisionFilters: () => void,

    /**
     * Returns a list of all currently active collision filters
     *
     * @returns All currently active collision filters
     * @category physics
     */
    public collisionFilters: () => string[][],

    /**
     * Shoots a ray through the world from `origin` in `direction`
     * @param origin the start point of the ray
     * @param direction the direction of the ray
     * @param options An option configuration parameter
     * @returns Information about the resulting raycast
     * @category search
     */
    public raycast: (
      origin: GameVector3,
      direction: GameVector3,
      options?: Partial<GameRaycastOptions>,
    ) => GameRaycastResult,

    /**
     * Search for all entities contained in a bounding box
     * @param bounds the bounding box to search
     * @returns All entities contained in ``bounds``
     */
    public searchBox: (bounds: GameBounds3) => GameEntity[],

    /**
     * Plays an animation on the world object
     */
    public animate: (
      keyframes: Partial<GameWorldKeyframe>[],
      playbackInfo?: Partial<GameAnimationPlaybackConfig>,
    ) => GameAnimation<GameWorldKeyframe, GameWorld>,
    public getAnimations: () => GameAnimation<GameWorldKeyframe, GameWorld>[],
    public getEntityAnimations: () => GameAnimation<
      GameEntityKeyframe,
      GameEntity
    >[],
    public getPlayerAnimations: () => GameAnimation<
      GamePlayerKeyframe,
      GamePlayer
    >[],

    /**
     * An event handler called each tick
     * @category tick
     */
    public onTick: GameEventChannel<GameTickEvent>,
    public nextTick: GameEventFuture<GameTickEvent>,

    /**
     * Called when an entity takes damage
     * @category health
     */
    public onTakeDamage: GameEventChannel<GameDamageEvent>,
    public nextTakeDamage: GameEventFuture<GameDamageEvent>,

    /**
     * Called when an entity dies
     * @category health
     */
    public onDie: GameEventChannel<GameDieEvent>,
    public nextDie: GameEventFuture<GameDieEvent>,

    /**
     * Called whenever a player joins the game
     * @category player
     */
    public onPlayerJoin: GameEventChannel<GamePlayerEntityEvent>,
    public nextPlayerJoin: GameEventFuture<GamePlayerEntityEvent>,

    /**
     * Called whenever a player leaves the game
     * @category player
     */
    public onPlayerLeave: GameEventChannel<GamePlayerEntityEvent>,
    public nextPlayerLeave: GameEventFuture<GamePlayerEntityEvent>,

    /**
     * Called whenever an entity is created
     * @category entity
     */
    public onEntityCreate: GameEventChannel<GameEntityEvent>,
    public nextEntityCreate: GameEventFuture<GameEntityEvent>,

    /**
     * Called whenever an entity is destroyed
     * @category chat
     */
    public onEntityDestroy: GameEventChannel<GameEntityEvent>,
    public nextEntityDestroy: GameEventFuture<GameEntityEvent>,

    /**
     * Broadcast a global message to all players
     * @param message is some text we want to broadcast
     * @category player
     */
    public say: (message: string) => void,

    /**
     * Called whenever a player says something
     * @category player
     */
    public onChat: GameEventChannel<GameChatEvent>,
    public nextChat: GameEventFuture<GameChatEvent>,

    /**
     * Called whenever a player clicks on an object
     * @category player
     */
    public onClick: GameEventChannel<GameClickEvent>,
    public nextClick: GameEventFuture<GameClickEvent>,

    /**
     * Called whenever a player pushes a button
     * @category player
     */
    public onPress: GameEventChannel<GameInputEvent>,
    public nextPress: GameEventFuture<GameInputEvent>,

    /**
     * Called whenever a player releases a button
     * @category player
     */
    public onRelease: GameEventChannel<GameInputEvent>,
    public nextRelease: GameEventFuture<GameInputEvent>,

    /**
     * Called whenever two entities collide
     * @category entity
     */
    public onEntityContact: GameEventChannel<GameEntityContactEvent>,
    public nextEntityContact: GameEventFuture<GameEntityContactEvent>,

    /**
     * Called whenever two entities stop colliding
     * @category entity
     */
    public onEntitySeparate: GameEventChannel<GameEntityContactEvent>,
    public nextEntitySeparate: GameEventFuture<GameEntityContactEvent>,

    /**
     * Called whenever an entity touches a voxel
     * @category entity
     */
    public onVoxelContact: GameEventChannel<GameVoxelContactEvent>,
    public nextVoxelContact: GameEventFuture<GameVoxelContactEvent>,

    /**
     * Called whenever an entity stops touching a voxel
     * @category entity
     */
    public onVoxelSeparate: GameEventChannel<GameVoxelContactEvent>,
    public nextVoxelSeparate: GameEventFuture<GameVoxelContactEvent>,

    /**
     * Called when an entity enters a fluid
     * @category entity
     */
    public onFluidEnter: GameEventChannel<GameFluidContactEvent>,
    public nextFluidEnter: GameEventFuture<GameFluidContactEvent>,

    /**
     * Called when an entity leaves a fluid
     * @category entity
     */
    public onFluidLeave: GameEventChannel<GameFluidContactEvent>,
    public nextFluidLeave: GameEventFuture<GameFluidContactEvent>,

    /**
     * Zones
     * @category zone
     */
    public zones: () => GameZone[],
    public addZone: (config: Partial<GameZoneConfig>) => GameZone,
    public removeZone: (trigger: GameZone) => void,

    /**
     * @category interactive
     */
    public onInteract: GameEventChannel<GameInteractEvent>,
    public nextInteract: GameEventFuture<GameInteractEvent>,

    /**
     * Plays a sound at a given location
     */
    public sound: (
      spec:
        | {
            sample: string;
            position?: GameVector3;
            radius?: number;
            gain?: number;
            pitch?: number;
          }
        | string,
    ) => Sound,

    /**
     * 地图组内传送能力。mapId 必须是目标地图不可变的 20 位永久地图 ID，不能使用
     * 可修改的访问 ID、地图名称或本地工程 ID。默认创建仅被传送玩家可见的独立房间；传入返回的
     * serverId 可让其他玩家加入同一房间，传入 public 则进入公共实例。
     */
    public teleport: TeleportType,

    /**
     * 当前运行实例的稳定 ID。普通实例使用 20 位永久地图 ID，传送创建的
     * 独立房间使用房间 ID；修改地图访问 ID 不会改变此值。
     */
    public serverId: string,
  ) {}
}

/**
 * {@link Game.GameVoxels} gives an interface for all the voxels in Game.  You can use it to control the terrain
 */
export class GameVoxels {
  /**
   * @ignore
   */
  constructor(
    /**
     * Size of the voxel grid along the x/y/z dimensions
     */
    public shape: GameVector3,

    /**
     * An array of all supported voxel types
     * @category names
     */
    public VoxelTypes: string[],

    /**
     * @param name the human readable name for the voxel
     * @returns the voxel id number
     * @category names
     */
    public id: (name: string) => number,

    /**
     * @param id the numerical id of a voxel
     * @returns the human readable voxel name
     * @category names
     */
    public name: (id: number) => string,

    /**
     * Sets a voxel in the grid
     * @param voxel The name of the voxel or its voxel id
     * @param rotation The rotation code of the voxel
     * @returns the id of the updated voxel
     */
    public setVoxel: (
      x: number,
      y: number,
      z: number,
      voxel: number | string,
      rotation?: number | string,
    ) => number,

    /**
     * Get the type of a voxel at some point
     * @returns the voxel type code at point x/y/z
     */
    public getVoxel: (x: number, y: number, z: number) => number,
    /**
     * Get the rotation of a voxel at point x/y/z
     * @returns the voxel rotation code
     */
    public getVoxelRotation: (x: number, y: number, z: number) => number,

    /**
     * Sets a voxel in the grid directly using its id code
     * @category advanced
     */
    public setVoxelId: (
      x: number,
      y: number,
      z: number,
      voxel: number,
    ) => number,
    /**
     * Retrieves the voxel id in the grid
     * @category advanced
     */
    public getVoxelId: (x: number, y: number, z: number) => number,
  ) {}
}

export type GamePlayerEntity = GameEntity & {
  player: GamePlayer;
  isPlayer: true;
};
export type GamePlayerEntityEvent = GameEntityEvent & {
  entity: GamePlayerEntity;
};

/**
 * A set of parameters which can be used to specify an entity
 */
export interface GameEntityConfig {
  position: GameVector3;
  velocity: GameVector3;
  bounds: GameVector3;

  mass: number;
  friction: number;
  restitution: number;

  collides: boolean;
  fixed: boolean;
  gravity: boolean;

  mesh: string;
  meshColor: GameRGBAColor;
  meshScale: GameVector3;
  meshOrientation: GameQuaternion;
  meshMetalness: number;
  meshEmissive: number;
  meshShininess: number;
  anchorOffset: GameVector3;

  particleRate: number;
  particleRateSpread: number;
  particleLimit: number;
  particleColor: GameRGBColor[];
  particleSize: number[];
  particleSizeSpread: number;
  particleLifetime: number;
  particleLifetimeSpread: number;
  particleVelocity: GameVector3;
  particleVelocitySpread: GameVector3;
  particleDamping: number;
  particleAcceleration: GameVector3;
  particleNoise: number;
  particleNoiseFrequency: number;
  particleTarget: GameEntity | null;
  particleTargetWeight: number;

  enableInteract: boolean;
  interactColor: GameRGBColor;
  interactHint: string;
  interactRadius: number;

  hurtSound: GameSoundEffectConfig;
  dieSound: GameSoundEffectConfig;
  interactSound: GameSoundEffectConfig;
  chatSound: GameSoundEffectConfig;

  id: string;
  tags: (() => string[]) | string[];
}

export interface GameHurtOptions {
  attacker: GameEntity;
  damageType: string;
}

export interface GameEntityKeyframe {
  duration: number;
  easeIn: GameEasing;
  easeOut: GameEasing;

  // physics properties
  position: GameVector3;
  velocity: GameVector3;
  mass: number;
  friction: number;
  restitution: number;
  collides: boolean;
  fixed: boolean;
  gravity: boolean;

  // mesh display
  mesh: string;
  meshInvisible: boolean;
  meshScale: GameVector3;
  meshOrientation: GameQuaternion;
  meshOffset: GameVector3;
  meshColor: GameRGBAColor;
  meshMetalness: number;
  meshEmissive: number;
  meshShininess: number;

  // particle emission
  particleRate: number;
  particleRateSpread: number;
  particleLimit: number;
  particleLifetime: number;
  particleLifetimeSpread: number;
  particleVelocity: GameVector3;
  particleVelocitySpread: GameVector3;

  // particle material
  particleColor: GameRGBColor[];
  particleSize: number[];
  particleSizeSpread: number;
  particleDamping: number;
  particleAcceleration: GameVector3;
  particleNoise: number;
  particleNoiseFrequency: number;
  particleTarget: GameEntity | null;
  particleTargetWeight: number;

  // interact hints
  interactColor: GameRGBColor;
}

/**
 * Entities are game objects in Game.  They can be used to encode things like players, objects, etc.
 */
export class GameEntity implements GameEntityConfig {
  /**
   * Name of entity seed in the editor
   * @category selectors
   */
  public id = '';

  /**
   * If true, entity is destroyed.
   * @category destroy
   */
  public destroyed = false;

  /**
   * @category physics
   */
  public position = new GameVector3(0, 0, 0);
  /**
   * @category physics
   */
  public velocity = new GameVector3(0, 0, 0);

  /**
   * Radius of the entity's bounding box along x/y/z
   * @category physics
   */
  public bounds = new GameVector3(1, 1, 1);
  /**
   * Mass of entity
   * @category physics
   */
  public mass = 1;
  /**
   * Controls object stickiness (0 = slippery, 1 = sticky)
   * @category physics
   */
  public friction = 0;
  /**
   * Controls bouncy (0 = soft, 1 = bouncy)
   * @category physics
   */
  public restitution = 0;
  /**
   * If false, object does not collide
   * @category physics
   */
  public collides = true;
  /**
   * If false, object does not fall
   * @category physics
   */
  public gravity = true;
  /**
   * If true, object does not move
   * @category physics
   */
  public fixed = false;

  /**
   * Net contact force applied to this object
   * @category physics
   */
  public contactForce = new GameVector3(0, 0, 0);

  /**
   * Returns a list of all active body contacts
   * @category physics
   */
  public entityContacts: GameEntityContact[] = [];

  /**
   * Returns a list of all active voxel contacts
   * @category physics
   */
  public voxelContacts: GameVoxelContact[] = [];

  /**
   * Returns a list of all active fluid contacts
   * @category physics
   */
  public fluidContacts: GameFluidContact[] = [];

  /**
   * Hash of entity mesh.  If set to empty string/'' then entity does not have a mesh.
   * Unless object is a player, if mesh is set then mesh is used to compute object bounds
   * @category mesh
   */
  public mesh = '';
  /**
   * Makes the mesh invisible
   * @category mesh
   */
  public meshInvisible = false;
  /**
   * @category mesh
   */
  public meshScale = new GameVector3(1 / 64, 1 / 64, 1 / 64);
  /**
   * @category mesh
   */
  public meshOrientation = new GameQuaternion(0, 0, 0, 1);
  /**
   * @category mesh
   */
  public meshOffset = new GameVector3(0, 0, 0);
  /**
   * @category mesh
   */
  public meshColor = new GameRGBAColor(1, 1, 1, 1);
  /**
   * @category mesh
   */
  public meshMetalness = 0;
  /**
   * @category mesh
   */
  public meshEmissive = 0;
  /**
   * @category mesh
   */
  public meshShininess = 0;
  /**
   * 几何中心与锚点的偏移量
   * @category mesh
   */
  public anchorOffset = new GameVector3(0, 0, 0);

  /**
   * @category health
   */
  public enableDamage = false;
  /**
   * @category health
   */
  public showHealthBar = true;
  /**
   * @category health
   */
  public hp = 100;
  /**
   * @category health
   */
  public maxHp = 100;

  /**
   * If true, then the entity is a player
   * @category player
   */
  public isPlayer = false;
  /**
   * Reference to all player specific state and methods
   * @category player
   */
  public player?: GamePlayer;

  /**
   * Particle emission in rate in particles / second
   * @category particle
   */
  public particleRate = 0;

  /**
   * Variability in particle emission.
   * @category particle
   */
  public particleRateSpread = 0;

  /**
   * Maxmimum number of particles this entity can emit
   * @category particle
   */
  public particleLimit = 100;

  /**
   * Particle color spline.  Maximum 5 entries, particles interpolate colors along these 5 points over their lifetime.
   * Colors are emissive values and can be any number between 0 and 256
   * @category particle
   */
  public particleColor: GameRGBColor[] = [
    new GameRGBColor(1, 1, 1),
    new GameRGBColor(1, 1, 1),
    new GameRGBColor(1, 1, 1),
    new GameRGBColor(1, 1, 1),
    new GameRGBColor(1, 1, 1),
  ];

  /**
   * Particle size spline.  Maximum 5 entries, particles interpolate size along these 5 points over their lifetime.
   * @category particle
   */
  public particleSize: number[] = [1, 1, 1, 1, 1];

  /**
   * Particle size distribution
   * @category particle
   */
  public particleSizeSpread: number = 0;

  /**
   * Controls how long each particle lives in seconds
   * @category particle
   */
  public particleLifetime = 10;

  /**
   * Variation in particle lifetime in seconds
   * @category particle
   */
  public particleLifetimeSpread = 0;

  /**
   * Particle velocity bias.  Units are voxels/tick
   * @category particle
   */
  public particleVelocity = new GameVector3(0, 0, 0);

  /**
   * Particle velocity randomization range.  Units are voxels/tick
   * @category particle
   */
  public particleVelocitySpread = new GameVector3(0, 0, 0);

  /**
   * Particle damping exponent.
   * 0 = no damping
   * positive values slow particles
   * negative values accelerate particles
   * @category particle
   */
  public particleDamping = 0;

  /**
   * Particle acceleration/gravity force vector
   * Units are voxels/(tick^2)
   * @category particle
   */
  public particleAcceleration = new GameVector3(0, 0, 0);

  /**
   * Particle noise amplitude.  Affects particle movement
   * @category particle
   */
  public particleNoise = 0;

  /**
   * Particle noise frequency.  Increase rate of movement from noise bias
   * @category particle
   */
  public particleNoiseFrequency = 1;

  /**
   * Particle target entity
   * @category particle
   */
  public particleTarget: GameEntity | null = null;

  /**
   * Particle target weight
   * @category particle
   */
  public particleTargetWeight = 1;

  /**
   * Enables interaction
   * @category interact
   */
  public enableInteract = false;

  /**
   * Color of the interact hint text
   * @category interact
   */
  public interactColor = new GameRGBColor(0, 1, 0);

  /**
   * Hint text of interactive entity
   * @category interact
   */
  public interactHint = '';

  /**
   * Radius around entity for interactivity
   * @category interact
   */
  public interactRadius = 16;

  /**
   * Show name of entity
   * @category entityName
   */
  public showEntityName = false;

  /**
   * Name of entity
   * @category entityName
   */
  public customName = '';

  /**
   * Radius around entity for show entity name
   * @category entityName
   */
  public nameRadius = 16;

  /**
   * Radius around entity for show entity name
   * @category entityName
   */
  public nameColor = new GameRGBColor(1, 1, 1);

  /**
   * Plays when an entity chat
   * @category sound
   */
  public chatSound = new GameSoundEffect();

  /**
   * Plays when entity takes damage
   * @category sound
   */
  public hurtSound = new GameSoundEffect();

  /**
   * Plays when entity dies
   * @category sound
   */
  public dieSound = new GameSoundEffect();

  /**
   * Plays when entity is interacted with
   * @category sound
   */
  public interactSound = new GameSoundEffect();

  /**
   * @ignore
   */
  constructor(
    /**
     * Set of all tags assigned to the entity in the editor
     * @category selectors
     */
    public tags: () => string[],
    /**
     * Adds a new tag to the entity
     * @category selectors
     */
    public addTag: (tag: string) => void,
    /**
     * Removes a tag from the entity
     * @category selectors
     */
    public removeTag: (tag: string) => void,
    /**
     * Tests if an entity has a tag
     * @category selectors
     */
    public hasTag: (tag: string) => boolean,

    /**
     * Destroys the entity
     * @category destroy
     */
    public destroy: () => void,

    /**
     * Called when the entity is destroyed
     * @category destroy
     */
    public onDestroy: GameEventChannel<GameEntityEvent>,
    public nextDestroy: GameEventFuture<GameEntityEvent>,

    /**
     * Called when entity takes damage
     * @category health
     */
    public onTakeDamage: GameEventChannel<GameDamageEvent>,
    public nextTakeDamage: GameEventFuture<GameDamageEvent>,

    /**
     * Called when an entity dies
     * @category health
     */
    public onDie: GameEventChannel<GameDieEvent>,
    public nextDie: GameEventFuture<GameDieEvent>,

    /**
     * Deals damage to an entity
     * @category health
     */
    public hurt: (amount: number, options?: Partial<GameHurtOptions>) => void,

    /**
     * Makes the entity talk
     * @category chat
     * @param options.duration - The duration in milliseconds. A positive number represents the time in milliseconds,
     *                           while a negative number means the bubble will be permanent.
     * @param options.hideFloat - whether the float is displayed.
     */
    public say: (
      message: string,
      options?: { duration?: number; hideFloat?: boolean },
    ) => void,

    /**
     * Plays an animation on an entity
     */
    public animate: (
      keyframes: Partial<GameEntityKeyframe>[],
      playbackInfo?: Partial<GameAnimationPlaybackConfig>,
    ) => GameAnimation<GameEntityKeyframe, GameEntity>,
    public getAnimations: () => GameAnimation<GameEntityKeyframe, GameEntity>[],

    /**
     * Called whenever a player clicks on this entity
     */
    public onClick: GameEventChannel<GameClickEvent>,
    public nextClick: GameEventFuture<GameClickEvent>,

    /**
     * Called when the entity touches another entity
     * @category physics
     */
    public onEntityContact: GameEventChannel<GameEntityContactEvent>,
    public nextEntityContact: GameEventFuture<GameEntityContactEvent>,

    /**
     * Called when the entity stops touching another entity
     * @category physics
     */
    public onEntitySeparate: GameEventChannel<GameEntityContactEvent>,
    public nextEntitySeparate: GameEventFuture<GameEntityContactEvent>,

    /**
     * Called when the entity touches a voxel
     * @category physics
     */
    public onVoxelContact: GameEventChannel<GameVoxelContactEvent>,
    public nextVoxelContact: GameEventFuture<GameVoxelContactEvent>,

    /**
     * Called when the entity stops touching a voxel
     * @category physics
     */
    public onVoxelSeparate: GameEventChannel<GameVoxelContactEvent>,
    public nextVoxelSeparate: GameEventFuture<GameVoxelContactEvent>,

    /**
     * Called when the entity enters a fluid
     * @category physics
     */
    public onFluidEnter: GameEventChannel<GameFluidContactEvent>,
    public nextFluidEnter: GameEventFuture<GameFluidContactEvent>,

    /**
     * Called when the entity leaves a fluid
     * @category physics
     */
    public onFluidLeave: GameEventChannel<GameFluidContactEvent>,
    public nextFluidLeave: GameEventFuture<GameFluidContactEvent>,

    /**
     * Called when an entity interact with another entity
     * @category interactive
     */
    public onInteract: GameEventChannel<GameInteractEvent>,
    public nextInteract: GameEventFuture<GameInteractEvent>,

    /**
     * Play a sound effect at the location of this entity
     * @category sound
     */
    public sound: (
      spec:
        | {
            sample: string;
            radius?: number;
            pitch?: number;
            gain?: number;
          }
        | string,
    ) => Sound,

    /**
     * motion controller
     * @category motion
     */
    public motion: GameMotionController<GameEntity>,
    public lookAt: (
      targetPosition: GameVector3,
      facingDirection?: 'X' | 'Y' | 'Z',
      up?: GameVector3,
    ) => void,

    /**
     * 围绕模型自身坐标系下的某个点进行旋转
     * @category mesh
     */
    public rotateLocal: (
      localPosition: GameVector3,
      axis: 'X' | 'Y' | 'Z',
      rad: number,
    ) => void,

    /**
     * 参照模型自身坐标系下的某个点进行缩放
     * @category mesh
     */
    public scaleLocal: (localPosition: GameVector3, v: GameVector3) => void,
  ) {}
}

export interface GameMotionConfig {
  name: string;
  iterations: number;
}

export interface GameMotionClipConfig {
  motions: GameMotionConfig[];
  iterations: number;
}

export class GameMotionController<TargetType> {
  /**
   * @ignore
   */
  constructor(
    /**
     * Create motion handler by name (could be motion list)
     */
    public loadByName: (
      config: string | GameMotionConfig[] | GameMotionClipConfig,
    ) => GameMotionHandler<TargetType>,
    /**
     * Pause motion
     */
    public pause: () => void,
    /**
     * Resume motion
     */
    public resume: () => void,
    /**
     * Set default motion by name
     */
    public setDefaultMotionByName: (motionName?: string) => void,
  ) {}
}

export class GameMotionHandler<TargetType> {
  /**
   * @ignore
   */
  constructor(
    /**
     * Motion target object (entity)
     */
    public readonly target: TargetType,
    /**
     * Starts playback for the motion.
     */
    public play: () => void,

    /**
     * Cancels current motion playback
     */
    public cancel: () => void,

    /**
     * Fires when motion completes successfully
     */
    public onFinish: GameEventChannel<GameMotionEvent<TargetType>>,
    public nextFinish: GameEventFuture<GameMotionEvent<TargetType>>,
  ) {}
}
export class GameMotionEvent<TargetType> {
  /**
   * @ignore
   */
  constructor(
    /**
     * Tick that click event occurred
     */
    public tick: number,

    public readonly target: TargetType,

    public motionHandler: GameMotionHandler<TargetType>,

    public cancelled: boolean,
  ) {}
}

/**
 * An active entity pair contact
 */
export class GameEntityContact {
  constructor(
    public other: GameEntity,
    public force: GameVector3,
    public axis: GameVector3,
  ) {}
}

/**
 * An active voxel contact state
 */
export class GameVoxelContact {
  constructor(
    public x: number,
    public y: number,
    public z: number,
    public voxel: number,
    public force: GameVector3,
    public axis: GameVector3,
  ) {}
}

/**
 * An active fluid contact
 */
export class GameFluidContact {
  constructor(public voxel: number, public volume: number) {}
}

/**
 * Player movement state
 */
export enum GamePlayerMoveState {
  FLYING = 'fly',
  GROUND = 'ground',
  SWIM = 'swim',
  FALL = 'fall',
  JUMP = 'jump',
  DOUBLE_JUMP = 'jump2',
}

/**
 * Player walking state
 */
export enum GamePlayerWalkState {
  NONE = '',
  CROUCH = 'crouch',
  WALK = 'walk',
  RUN = 'run',
}

export enum GameBodyPart {
  HIPS = 'hips',
  TORSO = 'torso',
  NECK = 'neck',
  HEAD = 'head',
  LEFT_SHOULDER = 'leftShoulder',
  LEFT_UPPER_ARM = 'leftUpperArm',
  LEFT_LOWER_ARM = 'leftLowerArm',
  LEFT_HAND = 'leftHand',
  LEFT_UPPER_LEG = 'leftUpperLeg',
  LEFT_LOWER_LEG = 'leftLowerLeg',
  LEFT_FOOT = 'leftFoot',
  RIGHT_SHOULDER = 'rightShoulder',
  RIGHT_UPPER_ARM = 'rightUpperArm',
  RIGHT_LOWER_ARM = 'rightLowerArm',
  RIGHT_HAND = 'rightHand',
  RIGHT_UPPER_LEG = 'rightUpperLeg',
  RIGHT_LOWER_LEG = 'rightLowerLeg',
  RIGHT_FOOT = 'rightFoot',
}

export type GameSkinValue = string | undefined | null;
export type GameSkin = { [key in GameBodyPart]: GameSkinValue };
export type GameSkinInvisible = { [key in GameBodyPart]: boolean };

export interface GameWearableSpec {
  bodyPart: GameBodyPart;
  mesh: string;
  color: GameRGBColor;
  emissive: number;
  metalness: number;
  shininess: number;
  orientation: GameQuaternion;
  scale: GameVector3;
  offset: GameVector3;
}

export class GameWearable implements GameWearableSpec {
  /**
   * The player this wearable is attached to
   */
  public player: GamePlayer | null = null;

  /**
   * Which body part this wearable is attached to
   */
  public bodyPart: GameBodyPart = GameBodyPart.HEAD;

  /**
   * The mesh of this wearable
   */
  public mesh: string = '';

  /**
   * Optional color tint of the wearable
   */
  public color = new GameRGBColor(1, 1, 1);

  /**
   * Emissive modifier for wearable
   */
  public emissive = 0;

  /**
   * Metalness modifier for wearable
   */
  public metalness = 0;

  /**
   * Shininess modifier for wearable
   */
  public shininess = 0;

  /**
   * Orientation of wearable
   */
  public orientation = new GameQuaternion(0, 1, 0, 0);

  /**
   * Scale of wearable along x/y/z
   */
  public scale = new GameVector3(1, 1, 1);

  /**
   * Offset of wearable
   */
  public offset = new GameVector3(0, 0, 0);

  public remove() {
    if (this.player) {
      this.player.removeWearable(this);
    }
  }
}

/**
 * Dialog stuff
 */

export enum GameDialogType {
  TEXT = 'text',
  SELECT = 'select',
  INPUT = 'input',
}

export type GameDialogSelectResponse = { index: number; value: string };

export type GameDialogResponse = GameDialogSelectResponse | string | null;

/**
 * Parameters for dialog
 */
export type GameDialogParams = {
  /**
   * Type of dialog
   */
  type: GameDialogType;
  /**
   * Title of dialog
   */
  title?: string;
  /**
   * Message of dialog
   */
  content: string;
  /**
   * Background color of dialog
   */
  titleBackgroundColor?: GameRGBAColor;
  /**
   * Color of dialog text
   */
  titleTextColor?: GameRGBAColor;
  /**
   * Color of dialog background
   */
  contentBackgroundColor?: GameRGBAColor;
  /**
   * Color of text
   */
  contentTextColor?: GameRGBAColor;
  /**
   * Show an arrow in text dialog
   */
  hasArrow?: boolean;
  /**
   * Options for select dialog
   */
  options?: string[];
  /**
   * Default input text
   */
  placeholder?: string;
  /**
   * Confirm text for input
   */
  confirmText?: string;
  /**
   * Target for object
   */
  lookTarget?: GameVector3 | GameEntity;
  /**
   * If target entity is given, then offset from target entity
   */
  lookTargetOffset?: GameVector3;
  /**
   * Camera up vector
   */
  lookUp?: GameVector3;
  /**
   * Camera eye position
   */
  lookEye?: GameVector3 | GameEntity;
  /**
   * If camera eye is entity, then offset from entity location
   */
  lookEyeOffset?: GameVector3;
};

export type GameTextDialogParams = {
  type: GameDialogType.TEXT;
  /**
   * Title of dialog
   */
  title?: string;
  /**
   * Message of dialog
   */
  content: string;
  /**
   * Background color of dialog
   */
  titleBackgroundColor?: GameRGBAColor;
  /**
   * Color of dialog text
   */
  titleTextColor?: GameRGBAColor;
  /**
   * Color of dialog background
   */
  contentBackgroundColor?: GameRGBAColor;
  /**
   * Color of text
   */
  contentTextColor?: GameRGBAColor;
  /**
   * If set, draw an arrow
   */
  hasArrow?: boolean;
  /**
   * Target for object
   */
  lookTarget?: GameVector3 | GameEntity;
  /**
   * If target entity is given, then offset from target entity
   */
  lookTargetOffset?: GameVector3;
  /**
   * Camera up vector
   */
  lookUp?: GameVector3;
  /**
   * Camera eye position
   */
  lookEye?: GameVector3 | GameEntity;
  /**
   * If camera eye is entity, then offset from entity location
   */
  lookEyeOffset?: GameVector3;
};

export type GameSelectDialogParams = {
  type: GameDialogType.SELECT;
  /**
   * Title of dialog
   */
  title?: string;
  /**
   * Message for dialog
   */
  content: string;
  /**
   * Background color of dialog
   */
  titleBackgroundColor?: GameRGBAColor;
  /**
   * Color of dialog text
   */
  titleTextColor?: GameRGBAColor;
  /**
   * Color of dialog background
   */
  contentBackgroundColor?: GameRGBAColor;
  /**
   * Color of text
   */
  contentTextColor?: GameRGBAColor;
  /**
   * Option list
   */
  options: string[];
  /**
   * Target for object
   */
  lookTarget?: GameVector3 | GameEntity;
  /**
   * If target entity is given, then offset from target entity
   */
  lookTargetOffset?: GameVector3;
  /**
   * Camera up vector
   */
  lookUp?: GameVector3;
  /**
   * Camera eye position
   */
  lookEye?: GameVector3 | GameEntity;
  /**
   * If camera eye is entity, then offset from entity location
   */
  lookEyeOffset?: GameVector3;
};

export type GameInputDialogParams = {
  type: GameDialogType.INPUT;
  /**
   * Title of dialog
   */
  title?: string;
  /**
   * Dialog message
   */
  content: string;
  /**
   * Background color of dialog
   */
  titleBackgroundColor?: GameRGBAColor;
  /**
   * Color of dialog text
   */
  titleTextColor?: GameRGBAColor;
  /**
   * Color of dialog background
   */
  contentBackgroundColor?: GameRGBAColor;
  /**
   * Color of text
   */
  contentTextColor?: GameRGBAColor;
  /**
   * Default text for input
   */
  placeholder?: string;
  /**
   * Confirmation text
   */
  confirmText?: string;
  /**
   * Target for object
   */
  lookTarget?: GameVector3 | GameEntity;
  /**
   * If target entity is given, then offset from target entity
   */
  lookTargetOffset?: GameVector3;
  /**
   * Camera up vector
   */
  lookUp?: GameVector3;
  /**
   * Camera eye position
   */
  lookEye?: GameVector3 | GameEntity;
  /**
   * If camera eye is entity, then offset from entity location
   */
  lookEyeOffset?: GameVector3;
};

export type GameDialogCancelOption = {
  cancel: () => void;
};

/**
 * Dialog call signature
 */
export type GameDialogCall =
  | ((
      params: GameTextDialogParams,
    ) => Promise<string | null> & GameDialogCancelOption)
  | ((
      params: GameSelectDialogParams,
    ) => Promise<GameDialogSelectResponse | null> & GameDialogCancelOption)
  | ((
      params: GameInputDialogParams,
    ) => Promise<string | null> & GameDialogCancelOption);

export enum GameCameraMode {
  FOLLOW = 'follow',
  FPS = 'fps',
  FIXED = 'fixed',
  RELATIVE = 'relative',
}

export enum GameCameraFreezedAxis {
  NONE = '',
  X = 'x',
  Y = 'y',
  Z = 'z',
  XY = 'xy',
  XZ = 'xz',
  YZ = 'yz',
  XYZ = 'xyz',
}

export enum GameInputDirection {
  NONE = 'none',
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
  BOTH = 'both',
}

export interface GamePlayerKeyframe {
  duration: number;
  easeIn: GameEasing;
  easeOut: GameEasing;

  // Display props
  scale: number;
  color: GameRGBColor;
  metalness: number;
  emissive: number;
  shininess: number;
  invisible: boolean;
  showName: boolean;
  showIndicator: boolean;

  // Camera controls
  colorLUT: string;
  cameraMode: GameCameraMode;
  cameraEntity: GameEntity | null;
  cameraTarget: GameVector3;
  cameraUp: GameVector3;
  cameraPosition: GameVector3;
  cameraFreezedAxis: GameCameraFreezedAxis;
  cameraFovY: number;
  cameraDistance: number;
}
export interface Gamepad {
  joystickBackground: string;
  joystickController: string;
  flyButton: string;
  flyingBackground: string;
  flyingController: string;
  jump: string;
  crouch: string;
  actionA: string;
  actionB: string;
}

/**
 * Players correspond to users which are connected to the game
 */
export class GamePlayer {
  public gamepad: Gamepad = {
    joystickBackground: '',
    joystickController: '',
    flyButton: '',
    flyingBackground: '',
    flyingController: '',
    jump: '',
    crouch: '',
    actionA: '',
    actionB: '',
  };
  /**
   * Name of the player.  Constant.
   */
  public name = 'player';

  /**
   * user id for login player
   */
  public userId = '';
  /**
   * Unique user key for this player.  Can be used to save their info into the database.
   */
  public userKey = '';
  /**
   * User id of player if logged in.
   */
  public boxId = '';
  /**
   * User avatar player if logged in.
   */
  public avatar = '';
  /**
   * Player URL
   */
  public url: URL = <any>null;
  /**
   * Initial spawn point of player
   * @category spawn
   */
  public spawnPoint = new GameVector3(0, 0, 0);
  /**
   * Movement bounds
   * @category spawn
   */
  public movementBounds = new GameBounds3(
    new GameVector3(-50, -50, -50),
    new GameVector3(178, 178, 178),
  );
  /**
   * @category display
   */
  public scale: number = 1;
  /**
   * @category dipsplay
   */
  public color = new GameRGBColor(1, 1, 1);
  /**
   * @category display
   */
  public metalness = 0;
  /**
   * @category display
   */
  public emissive = 0;
  /**
   * @category display
   */
  public shininess = 0;
  /**
   * @category display
   */
  public invisible = false;
  /**
   * @category display
   */
  public showName = true;
  /**
   * @category display
   */
  public showIndicator = false;
  /**
   * @category health
   */
  public dead = false;
  /**
   * Color grading look up table, applied to player to tint game state
   */
  public colorLUT = '';
  /**
   * Camera behavior mode.
   *  + `"FPS"` - First person camera
   *  + `"FOLLOW"` - Third person follow camera (default)
   *  + `"FIXED"` - Third person fixed camera
   *  + `"RELATIVE"` - Third person camera relative to player position
   * @category camera
   */
  public cameraMode: GameCameraMode = GameCameraMode.FOLLOW;
  /**
   * In FPS or FOLLOW mode, the entity which the player's camera follows
   * @category camera
   */
  public cameraEntity: GameEntity | null = null;
  /**
   * Target point for the camera in FIXED mode
   * @category camera
   */
  public cameraTarget = new GameVector3(0, 0, 0);
  /**
   * Up vector for camera in FIXED mode
   * @category camera
   */
  public cameraUp = new GameVector3(0, 1, 0);
  /**
   * Eye position of camera in FIXED mode
   * @category camera
   */
  public cameraPosition = new GameVector3(0, 0, 0);
  /**
   * Freeze camera axis in RELATIVE mode
   * @category camera
   */
  public cameraFreezedAxis = GameCameraFreezedAxis.NONE;
  /**
   * Camera fov y
   * @category camera
   */
  public cameraFovY = 0.25;
  /**
   * Camera distance
   * @category camera
   */
  public cameraDistance = 8.5;
  /**
   * If true, player is allowed to fly
   * @category movement
   */
  public canFly = false;
  /**
   * If true, player is a ghost and can pass through walls
   * @category movement
   */
  public spectator = false;

  /**
   * Maximum walking speed
   * @category movement
   */
  public walkSpeed = 0.22;

  /**
   * Walking acceleration
   * @category movement
   */
  public walkAcceleration = 0.19;

  /**
   * Maximum running speed
   * @category movement
   */
  public runSpeed = 0.4;

  /**
   * Running acceleration
   * @category movement
   */
  public runAcceleration = 0.35;

  /**
   * Crouching walk speed
   * @category movement
   */
  public crouchSpeed = 0.1;

  /**
   * Crouching walk acceleration
   * @category movement
   */
  public crouchAcceleration = 0.09;

  /**
   * Maximum swim speed
   * @category movement
   */
  public swimSpeed = 0.4;

  /**
   * Swim acceleration
   * @category movement
   */
  public swimAcceleration = 0.1;

  /**
   * Maximum flying speed
   * @category movement
   */
  public flySpeed = 2;

  /**
   * Flying acceleration
   * @category movement
   */
  public flyAcceleration = 2;

  /**
   * Jump speed
   * @category movement
   */
  public jumpSpeedFactor = 0.85;

  /**
   * Jump acceleration rate
   * @category movement
   */
  public jumpAccelerationFactor = 0.55;

  /**
   * Jump velocity impulse
   * @category movement
   */
  public jumpPower = 0.96;

  /**
   * Double jump velocity impulse
   * @category movement
   */
  public doubleJumpPower = 0.9;
  /**
   * @category movement
   */
  public freezedForwardDirection: GameVector3 | null = null;
  /**
   * @category state
   */
  public moveState = GamePlayerMoveState.FALL;
  /**
   * @category state
   */
  public walkState = GamePlayerWalkState.NONE;

  /**
   * @category input
   */
  public swapInputDirection = false;
  /**
   * @category input
   */
  public reverseInputDirection = GameInputDirection.NONE;
  /**
   * @category input
   */
  public disableInputDirection = GameInputDirection.NONE;
  /**
   * @category input
   */
  public walkButton = false;
  /**
   * @category input
   */
  public crouchButton = false;
  /**
   * @category input
   */
  public jumpButton = false;
  /**
   * If true, player input button action 0 is enabled
   * @category input
   */
  public enableAction0 = true;
  /**
   * If true, player input button action 1 is enabled
   * @category input
   */
  public enableAction1 = true;
  /**
   * @category input
   */
  public action0Button = false;
  /**
   * @category input
   */
  public action1Button = false;
  /**
   * @category input
   */
  public enableJump = true;
  /**
   * @category input
   */
  public enableDoubleJump = true;
  /**
   * @category input
   */
  public enableCrouch = true;
  /**
   * @category input
   */
  public enable3DCursor = false;

  /**
   * @category input
   */
  public facingDirection = new GameVector3(1, 0, 0);
  /**
   * @category input
   */
  public cameraYaw = 0;

  /**
   * @category input
   */
  public cameraPitch = 0;
  /**
   * Plays when player respawns
   * @category sound
   */
  public spawnSound = new GameSoundEffect();

  /**
   * Plays when player jumps
   * @category sound
   */
  public jumpSound = new GameSoundEffect();

  /**
   * Plays when player double jumps
   * @category sound
   */
  public doubleJumpSound = new GameSoundEffect();

  /**
   * Plays when player lands
   * @category sound
   */
  public landSound = new GameSoundEffect();

  /**
   * Plays when player crouches
   * @category sound
   */
  public crouchSound = new GameSoundEffect();

  /**
   * Plays when player takes a step
   * @category sound
   */
  public stepSound = new GameSoundEffect();

  /**
   * Plays when player takes a single swim stroke
   * @category sound
   */
  public swimSound = new GameSoundEffect();

  /**
   * Plays when player presses action 0
   * @category sound
   */
  public action0Sound = new GameSoundEffect();

  /**
   * Plays when player presses action 1
   * @category sound
   */
  public action1Sound = new GameSoundEffect();

  /**
   * Plays when entity enters water
   * @category sound
   */
  public enterWaterSound = new GameSoundEffect();

  /**
   * Plays when entity leaves water
   * @category sound
   */
  public leaveWaterSound = new GameSoundEffect();

  /**
   * Sound for player start flying
   * @category sound
   */
  public startFlySound = new GameSoundEffect();

  /**
   * Sound for player stop flying
   * @category sound
   */
  public stopFlySound = new GameSoundEffect();

  /**
   * Background music for this player
   * @category sound
   */
  public music = new GameSoundEffect();

  /**
   * Skin parts
   * @category display
   */
  public skin: GameSkin = {
    hips: undefined,
    torso: undefined,
    neck: undefined,
    head: undefined,
    leftShoulder: undefined,
    leftUpperArm: undefined,
    leftLowerArm: undefined,
    leftHand: undefined,
    rightShoulder: undefined,
    rightUpperArm: undefined,
    rightLowerArm: undefined,
    rightHand: undefined,
    leftUpperLeg: undefined,
    leftLowerLeg: undefined,
    leftFoot: undefined,
    rightUpperLeg: undefined,
    rightLowerLeg: undefined,
    rightFoot: undefined,
  };

  /**
   * Skin parts invisible
   * @category display
   */
  public skinInvisible: GameSkinInvisible = {
    hips: false,
    torso: false,
    neck: false,
    head: false,
    leftShoulder: false,
    leftUpperArm: false,
    leftLowerArm: false,
    leftHand: false,
    rightShoulder: false,
    rightUpperArm: false,
    rightLowerArm: false,
    rightHand: false,
    leftUpperLeg: false,
    leftLowerLeg: false,
    leftFoot: false,
    rightUpperLeg: false,
    rightLowerLeg: false,
    rightFoot: false,
  };

  public navigator: PlayerNavigator;
  /**
   * @ignore
   */
  constructor(
    /**
     * Sends a private message directly to player
     * @category chat
     */
    public directMessage: (message: string) => void,
    /**
     * Called whenever player initiates a chat event
     * @category chat
     */
    public onChat: GameEventChannel<GameChatEvent>,
    public nextChat: GameEventFuture<GameChatEvent>,

    /**
     * Called whenever player presses a button
     * @category input
     */
    public onPress: GameEventChannel<GameInputEvent>,
    public nextPress: GameEventFuture<GameInputEvent>,

    /**
     * Called whenever a player releases a buttin
     * @category input
     */
    public onRelease: GameEventChannel<GameInputEvent>,
    public nextRelease: GameEventFuture<GameInputEvent>,

    /**
     * @category health
     */
    public onRespawn: GameEventChannel<GameRespawnEvent>,
    public nextRespawn: GameEventFuture<GameRespawnEvent>,

    /**
     * @category health
     */
    public forceRespawn: () => void,

    /**
     * Opens a dialog for this player
     * @category dialog
     */
    public dialog: GameDialogCall,

    /**
     * Cancels any open dialogs for this player
     * @category dialog
     */
    public cancelDialogs: () => void,
    /**
     * Opens a hyperlink on the client
     * @category web
     */
    public link: (
      href: string,
      options?: {
        isConfirm?: boolean;
        isNewTab?: boolean;
      },
    ) => void,

    /**
     * List all wearable objects attached to the player
     * @param bodyPart is an optional filter to show only wearables attached to a specific body part
     * @category display
     */
    public wearables: (bodyPart?: GameBodyPart) => GameWearable[],

    /**
     * Attach a new wearable object to the player
     * @category display
     */
    public addWearable: (spec: Partial<GameWearable>) => GameWearable,

    /**
     * Remove a wearable object from a player
     * @param wearable is the wearable to remove
     * @category display
     */
    public removeWearable: (wearable: GameWearable) => void,

    /**
     * Set player skin by skin name
     * @category display
     */
    public setSkinByName: (skinName: string) => void,

    /**
     * Reset player to default skin
     * @category display
     */
    public resetToDefaultSkin: () => void,

    /**
     * Clear player custom skin and restore to avatar skin
     * @category display
     */
    public clearSkin: () => void,

    /**
     * Play sound for player
     * @category sound
     */
    public sound: (
      spec:
        | {
            sample: string;
            gain?: number;
            pitch?: number;
          }
        | string,
    ) => Sound,

    /**
     * Play an animation
     */
    public animate: (
      keyframes: Partial<GamePlayerKeyframe>[],
      playbackConfig?: GameAnimationPlaybackConfig,
    ) => GameAnimation<GamePlayerKeyframe, GamePlayer>,
    public getAnimations: () => GameAnimation<GamePlayerKeyframe, GamePlayer>[],
    /**
     * Kick the user off the server
     */
    public kick: () => void,
    /**
     * Reset camera pitch
     */
    public setCameraPitch: (value: number) => void,
    /**
     * Reset camera pitch
     */
    public setCameraYaw: (value: number) => void,
    /**
     * post message to iframe parent
     * @category web
     */
    postMessage: (event: {
      type: string;
      value: object;
      isOld: boolean;
    }) => void,

    /**
     * add listener for message event of iframe parent
     * @category web
     */
    addEventListener: (
      type: NavigatorEventType,
      listener: (event: { data: object }) => void,
    ) => void,
    /**
     * Called whenever player press down or up
     * @category input
     */
    public onKeyDown: GameEventChannel<GameKeyBoardEvent>,
    public onKeyUp: GameEventChannel<GameKeyBoardEvent>,
  ) {
    this.navigator = new PlayerNavigator(
      (type, value) => postMessage({ type, value, isOld: true }),
      (type, listener) => addEventListener(type, listener),
      (type, value) => postMessage({ type, value, isOld: false }),
    );
  }
}

/**
 * Player 用户设备相关的接口
 */
export class PlayerNavigator {
  constructor(
    public emitEvent: (type: string, value: object) => void,
    public addEventListener: (
      type: NavigatorEventType,
      listener: (event: { data: object }) => void,
    ) => void,
    public dispatchEvent: (type: string, value: object) => void,
  ) {}
}

// 监听iframe parent的事件类型，当前只有message，之后可扩展
export type NavigatorEventType = 'message';

/**
 * Result of performing a raycast.  Contains information about the raycast and what it hit.
 */
export class GameRaycastResult {
  /**
   * @ignore
   */
  constructor(
    /**
     * If true, raycast hit an object
     */
    public hit: boolean,
    /**
     * The entity hit by the raycast
     */
    public hitEntity: GameEntity | null,
    /**
     * The voxel id hit by the raycast (0 if no voxel was hit)
     */
    public hitVoxel: number,

    /**
     * Start point of the ray cast
     */
    public origin: GameVector3,
    /**
     * Direction of the raycast
     */
    public direction: GameVector3,
    /**
     * Distance traveled along the ray
     */
    public distance: number,

    /**
     * Position of the ray intersection
     */
    public hitPosition: GameVector3,
    /**
     * Normal vector on surface at point of intersection
     */
    public normal: GameVector3,

    /**
     * If a voxel was hit, the grid coordinates of the hit voxel
     */
    public voxelIndex: GameVector3,
  ) {}
}

/**
 * Configuration parameters passed into a raycast method
 */
export interface GameRaycastOptions {
  /**
   * Maximum distance allowed for ray to travel
   */
  maxDistance: number;

  /**
   * If true, ignore fluid voxels
   */
  ignoreFluid: boolean;
  /**
   * If true, don't test intersection against voxels
   */
  ignoreVoxel: boolean;
  /**
   * If true, don't test intersection against entities
   */
  ignoreEntities: boolean;
  /**
   * Ignore selected entities
   */
  ignoreSelector: GameSelectorString;
}

/**
 * You can subscribe to events coming from some object using an EventChannel.
 *
 * Event channels take an event handler as input and return a token which can be used to cancel the handler.
 *
 * **Example:**
 * ```typescript
 * const token = world.onTick(() => console.log("tick !"));
 * setTimeout(() => {
 *      console.log('cancel tick handler');
 *      token.cancel();
 *      // no more tick events will be logged
 * }, 1000);
 * ```
 *
 * @param handler The handler callback which is invoked whenever the event is fired
 * @typeparam EventType The type of the event which is emitted by the channel
 * @returns An event handler token which can be used to cancel the event handler
 * @category events
 */
export type GameEventChannel<EventType> = (
  handler: (event: EventType) => void,
) => GameEventHandlerToken;

/**
 * Promises give another way to work with events. You can use promises to organize long sequences of events
 * with structured programming.  In some cases this can lead to much simpler and cleaner code, but you must
 * use caution.  Asynchronous code can be interrupted when it is waiting, which means things in the world
 * can change outside your code.  Also errors generated in asynchronous code do not get stack traces,
 * which can complicate debugging.  Consider these things and use promises carefully
 *
 * **Example:**
 * ```typescript
 * // Wait for 2 players to enter the world
 * async function waitForPlayers (count) {
 *      while (world.querySelectorAll('player').length < 2) {
 *          const { entity } = await world.nextPlayerJoin();
 *          world.say(entity.player.name + ' joined');
 *      }
 * }
 *
 * waitForPlayers.then(() => world.say('game ready'));
 * ```
 *
 * @param filter An optional function which checks the type of event.  If the filter is not true, then the event is not dispatched.  If no filter is supplied, then the future will fire on the next event.
 * @typeparam EventType The type of the event which is emitted by the channel
 * @returns A promise which resolves once an event which matches the filter fires
 * @category events
 */
export type GameEventFuture<EventType> = (
  filter?: (event: EventType) => boolean,
) => Promise<EventType>;

/**
 * Returned by a {@link Game.GameEventChannel} whenever a handler is registered.  Can be used to cancel the handler.
 * @category events
 */
export class GameEventHandlerToken {
  /**
   * @ignore
   */
  constructor(
    /**
     * Cancels the event handler
     */
    public cancel: () => void,

    /**
     * Resumes listening with the event handler
     */
    public resume: () => void,

    /**
     * Checks if the handler is active
     */
    public active: () => boolean,
  ) {}
}

/**
 * An event which is fired each tick by {@link Game.GameWorld.onTick}.
 * @category events
 */
export class GameTickEvent {
  /**
   * @ignore
   */
  constructor(
    /**
     * Tick at which the event was fired
     */
    public tick: number,
    /**
     * Last tick which was handled
     */
    public prevTick: number,
    /**
     * If we had to skip any ticks due to the scripts lagging
     */
    public skip: boolean,
    /**
     * Wall clock time between ticks
     */
    public elapsedTimeMS: number,
  ) {}
}

/**
 * An event which is fired whenever some entity is created or destroyed.
 * Triggered by {@link Game.GameWorld.onPlayerJoin}, {@link Game.GameWorld.onPlayerLeave}, {@link Game.GameWorld.onEntityCreate}, {@link Game.GameWorld.onEntityDestroy} and {@link Game.GameEntity.onDestroy}
 * @category events
 */
export class GameEntityEvent {
  /**
   * @ignore
   */
  constructor(
    /**
     * The time the event occured
     */
    public tick: number,
    /**
     * The entity that was created/destroyed
     */
    public entity: GameEntity,
  ) {}
}

/**
 * Fired whenever an entity activates or deactivates a trigger
 * @category events
 */
export class GameTriggerEvent {
  /**
   * @ignore
   */
  constructor(
    /**
     * Time event occured
     */
    public tick: number,
    /**
     * Entity which triggered event
     */
    public entity: GameEntity,
  ) {}
}

/**
 * Fired whenever an entity takes damage
 * Triggered by {@link Game.GameWorld.onTakeDamage} {@link Game.GameEntity.onTakeDamage}
 * @category events
 */
export class GameDamageEvent {
  /**
   * @ignore
   */
  constructor(
    /**
     * Time event occured
     */
    public tick: number,
    /**
     * Entity which received damage
     */
    public entity: GameEntity,
    /**
     * Amount of damage
     */
    public damage: number,
    /**
     * Entity attacker
     */
    public attacker: GameEntity | null,
    /**
     * Damage type
     */
    public damageType: string,
  ) {}
}

/**
 * Fired whenever an entity takes dies.
 * Triggered by {@link Game.GameWorld.onTakeDamage} {@link Game.GameEntity.onTakeDamage}
 * @category events
 */
export class GameDieEvent {
  /**
   * @ignore
   */
  constructor(
    /**
     * Time event occured
     */
    public tick: number,
    /**
     * Entity which received damage
     */
    public entity: GameEntity,
    /**
     * Entity attacker
     */
    public attacker: GameEntity | null,
    /**
     * Damage type
     */
    public damageType: string,
  ) {}
}

/**
 * Triggered whenever a player respawns
 * @category events
 */
export class GameRespawnEvent {
  /**
   * @ignore
   */
  constructor(
    /**
     * Time event occured
     */
    public tick: number,
    /**
     * Entity which received damage
     */
    public entity: GamePlayerEntity,
  ) {}
}

/**
 * An event which is fired whenever two entities collide
 * Triggered by {@link Game.GameWorld.onEntityContact}, {@link Game.GameWorld.onEntitySeparate}, {@link Game.GameEntity.onEntityContact}, {@link Game.GameEntity.onEntitySeparate}
 * @category events
 */
export class GameEntityContactEvent {
  /**
   * @ignore
   */
  constructor(
    /**
     * Time at which the entities collided
     */
    public tick: number,
    /**
     * The first entity in the pair
     */
    public entity: GameEntity,
    /**
     * The second entity in the pair
     */
    public other: GameEntity,
    /**
     * The separating axis of the collision
     */
    public axis: GameVector3,
    /**
     * The amount of force imparted by the collision
     */
    public force: GameVector3,
  ) {}
}

/**
 * An event which is fired whenever an entity comes into contact with terrain
 * Triggered by {@link Game.GameWorld.onVoxelContact}, {@link Game.GameWorld.onVoxelSeparate}, {@link Game.GameEntity.onVoxelContact}, {@link Game.GameEntity.onVoxelSeparate}
 * @category events
 */
export class GameVoxelContactEvent {
  /**
   * @ignore
   */
  constructor(
    /**
     * The time of the contact event
     */
    public tick: number,
    /**
     * The entity which touched the terrain
     */
    public entity: GameEntity,
    /**
     * x coordinate of voxel which was touched
     */
    public x: number,
    /**
     * y coordinate of voxel which was touched
     */
    public y: number,
    /**
     * z coordinate of voxel which was touched
     */
    public z: number,
    /**
     * id of voxel
     */
    public voxel: number,
    /**
     * Separating axis
     */
    public axis: GameVector3,
    /**
     * Collision force
     */
    public force: GameVector3,
  ) {}
}

/**
 * An event which is fired whenever an entity enters or leaves a fluid
 * Triggered by {@link Game.GameWorld.onFluidEnter}, {@link Game.GameWorld.onFluidLeave}, {@link Game.GameEntity.onFluidEnter}, {@link Game.GameEntity.onFluidLeave}
 * @category events
 */
export class GameFluidContactEvent {
  /**
   * @ignore
   */
  constructor(
    /**
     * Time event occured
     */
    public tick: number,
    /**
     * Entity which modified
     */
    public entity: GameEntity,
    /**
     * The id of the fluid voxel
     */
    public voxel: number,
  ) {}
}

/**
 * Triggered by {@link Game.GameWorld.onChat} and {@link Game.GameEntity.onChat}
 * @category events
 */
export class GameChatEvent {
  /**
   * @ignore
   */
  constructor(
    /**
     * Time chat event occured
     */
    public tick: number,
    /**
     * Entity which initiated chat event
     */
    public entity: GameEntity,
    /**
     * What the entity said in the chat event
     */
    public message: string,
  ) {}
}

/**
 * Triggered by {@link Game.GameWorld.onInteract} and {@link Game.GameEntity.onInteract}
 * @category events
 */
export class GameInteractEvent {
  /**
   * @ignore
   */
  constructor(
    /**
     * Time of event
     */
    public tick: number,
    /**
     * Entity initiating interaction
     */
    public entity: GamePlayerEntity,
    /**
     * Entity which received interaction
     */
    public targetEntity: GameEntity,
  ) {}
}

/**
 * Type of a button pressed by a player
 * @category events
 */
export enum GameButtonType {
  WALK = 'walk',
  RUN = 'run',
  CROUCH = 'crouch',
  JUMP = 'jump',
  DOUBLE_JUMP = 'jump2',
  FLY = 'fly',
  ACTION0 = 'action0',
  ACTION1 = 'action1',
}

/**
 * Input events are generated whenever a player presses a button.
 * The tick of an event occurs at the exact instant the button was pressed by the player.
 * Triggered by {@link Game.GameWorld.onPress}, {@link Game.GameWorld.onRelease}, {@link Game.GamePlayer.onPress}, {@link Game.GamePlayer.onRelease}
 * @category events
 */
export class GameInputEvent {
  /**
   * @ignore
   */
  constructor(
    /**
     * The time the button was pressed
     */
    public tick: number,
    /**
     * A reference to the player which pressed the button
     */
    public entity: GamePlayerEntity,
    /**
     * The position of the entity at the time the pressed the button
     */
    public position: GameVector3,
    /**
     * The button which was input by the player
     */
    public button: GameButtonType,
    /**
     * If true, then this is a press event.  Otherwise if false this is a release event
     */
    public pressed: boolean,
    /**
     * The result of a raycast query initiated by the player at the exact instant they pressed the button from the perspective of their camera.
     */
    public raycast: GameRaycastResult,
  ) {}
}

export class GameClickEvent {
  /**
   * @ignore
   */
  constructor(
    /**
     * Tick that click event occurred
     */
    public tick: number,
    /**
     * Entity that got clicked
     */
    public entity: GameEntity,
    /**
     * Entity which initiated the click event
     */
    public clicker: GamePlayerEntity,
    /**
     * Button which was pressed ACTION0 = LeftClick, ACTION1 = RightClick
     */
    public button: GameButtonType.ACTION0 | GameButtonType.ACTION1,
    /**
     * Distance from clicker to entity
     */
    public distance: number,
    /**
     * Position of clicker at time of click
     */
    public clickerPosition: GameVector3,
    /**
     * Raycast from clicker -> entity
     */
    public raycast: GameRaycastResult,
  ) {}
}

export class GameKeyBoardEvent {
  constructor(
    /**
     * Tick that click event occurred
     */
    public tick: number,
    public keyCode: number,
  ) {}
}

export class GameAnimationEvent<KeyframeType, TargetType> {
  /**
   * @ignore
   */
  constructor(
    public tick: number,

    public target: TargetType,

    public animation: GameAnimation<KeyframeType, TargetType>,

    public cancelled: boolean,
  ) {}
}

/**
 * Selectors are a powerful syntax for searching all of the objects in a game.  The interface for selectors in game is modeled after the DOM APIs.
 *
 * * ```javascript
 * const entities = world.querySelector('*');           // all entities in the world
 * const players = world.querySelectorAll('player');    // all players in the game
 * const theChair = world.querySelector('#chair');      // the first entity whose id is "chair"
 * const boxes = world.querySelectorAll('.box');        // all entities tagged with "box"
 * const boxChair = world.querySelector('.box .red');
 * ```
 */
export type GameSelectorString = string;

/**
 * Interface for all project resources
 */
export class GameResourceSystem {
  constructor(public ls: (path?: string) => GameAssetListEntry[]) {}
}

/**
 * Describes the type of an asset
 */
export enum GameAssetType {
  VOXEL_MESH = 'mesh',
  DIRECTORY = 'directory',
  COLOR_LUT = 'lut',
  JS_SCRIPT = 'js',
  IMAGE = 'image',
  PARTICLE_TEXTURE = 'snow',
  SOUND = 'sound',
  PICTURE = 'picture',
}

/**
 * An entry from an asset list
 */
export class GameAssetListEntry {
  /**
   * @ignore
   */
  constructor(
    /**
     * Fully qualified path of asset, split by directory
     */
    public path: string,
    /**
     * Type of asset
     */
    public type: GameAssetType,
  ) {}
}
