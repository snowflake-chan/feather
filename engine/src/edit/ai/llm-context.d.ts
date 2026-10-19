// File: api/api/common.d.ts
type JSONValue = string | number | boolean | {
    [x: string]: JSONValue;
} | Array<JSONValue>;


// File: api/api/console.d.ts
declare enum GameLogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3
}
type GameLoggerMethod = (...args: any[]) => void;
declare class GameConsole {
    clear: () => void;
    constructor(log: (level: GameLogLevel, message: string) => void, clear: () => void);
    assert: (assertion: any, ...args: any[]) => void;
    log: GameLoggerMethod;
    debug: GameLoggerMethod;
    error: GameLoggerMethod;
    warn: GameLoggerMethod;
    dir: () => void;
    dirxml: () => void;
    group: () => void;
    groupCollapsed: () => void;
    groupEnd: () => void;
    table: () => void;
    time: () => void;
    timeEnd: () => void;
    timeLog: () => void;
    timeStamp: () => void;
    trace: () => void;
}


// File: api/api/js/api.d.ts


type TELEPORT_ERROR_STATUS = 'PLAYER_OFFLINE' | 'ACCESS_DENIED' | 'UNKNOWN';
type TeleportType = (mapId: string, players: GameEntity[], serverId?: string) => Promise<TeleportResult>;
type TeleportResult = {
    serverId: string;
};
interface GameSoundEffectConfig {
    sample: string;
    radius: number;
    gain: number;
    gainRange: number;
    pitch: number;
    pitchRange: number;
}
declare class GameSoundEffect implements GameSoundEffectConfig {
    radius: number;
    gain: number;
    gainRange: number;
    pitch: number;
    pitchRange: number;
    sample: string;
}
declare class GameZone {
    entities: () => GameEntity[];
    onEnter: GameEventChannel<GameTriggerEvent>;
    nextEnter: GameEventFuture<GameTriggerEvent>;
    onLeave: GameEventChannel<GameTriggerEvent>;
    nextLeave: GameEventFuture<GameTriggerEvent>;
    remove: () => void;
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
    constructor(entities: () => GameEntity[], onEnter: GameEventChannel<GameTriggerEvent>, nextEnter: GameEventFuture<GameTriggerEvent>, onLeave: GameEventChannel<GameTriggerEvent>, nextLeave: GameEventFuture<GameTriggerEvent>, remove: () => void);
}
type GameZoneConfig = {
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
declare enum GameAnimationPlaybackState {
    PENDING = "pending",
    RUNNING = "running",
    FINISHED = "finished"
}
declare enum GameAnimationDirection {
    NORMAL = "normal",
    REVERSE = "reverse",
    WRAP = "wrap",
    WRAP_REVERSE = "wrap-reverse",
    ALTERNATE = "alternate",
    ALTERNATE_REVERSE = "alternate-reverse"
}
declare enum GameEasing {
    NONE = "none",
    LINEAR = "linear",
    QUADRATIC = "quadratic",
    SINE = "sine",
    EXP = "exp",
    BACK = "back",
    ELASTIC = "elastic",
    BOUNCE = "bounce",
    CIRCLE = "circle"
}
interface GameAnimationPlaybackConfig {
    startTick: number;
    delay: number;
    endDelay: number;
    duration: number;
    direction: GameAnimationDirection;
    iterationStart: number;
    iterations: number;
}
declare class GameAnimation<KeyframeType, TargetType> {
    target: TargetType;
    keyframes: () => Partial<KeyframeType>[];
    play: (playback?: Partial<GameAnimationPlaybackConfig>) => void;
    cancel: () => void;
    onReady: GameEventChannel<GameAnimationEvent<KeyframeType, TargetType>>;
    nextReady: GameEventFuture<GameAnimationEvent<KeyframeType, TargetType>>;
    onFinish: GameEventChannel<GameAnimationEvent<KeyframeType, TargetType>>;
    nextFinish: GameEventFuture<GameAnimationEvent<KeyframeType, TargetType>>;
    currentTime: number;
    startTime: number;
    playState: GameAnimationPlaybackState;
    playbackRate: number;
    constructor(target: TargetType, keyframes: () => Partial<KeyframeType>[], currentTime: () => number, startTime: () => number, playState: () => GameAnimationPlaybackState, playbackRate: () => number, play: (playback?: Partial<GameAnimationPlaybackConfig>) => void, cancel: () => void, onReady: GameEventChannel<GameAnimationEvent<KeyframeType, TargetType>>, nextReady: GameEventFuture<GameAnimationEvent<KeyframeType, TargetType>>, onFinish: GameEventChannel<GameAnimationEvent<KeyframeType, TargetType>>, nextFinish: GameEventFuture<GameAnimationEvent<KeyframeType, TargetType>>);
    then<T>(resolve: (event: GameAnimationEvent<KeyframeType, TargetType>) => T, reject?: (error: any) => any): Promise<any>;
}
interface GameWorldKeyframe {
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
declare class Sound {
    resume: (currentTime?: number) => void;
    setCurrentTime: (currentTime: number) => void;
    pause: () => void;
    stop: () => void;
    constructor(resume: (currentTime?: number) => void, setCurrentTime: (currentTime: number) => void, pause: () => void, stop: () => void);
}
declare class GameWorld {
    url: URL;
    entityQuota: () => number;
    onRespawn: GameEventChannel<GameRespawnEvent>;
    nextRespawn: GameEventFuture<GameRespawnEvent>;
    createEntity: (config: Partial<GameEntityConfig>) => GameEntity | null;
    querySelector: (selector: GameSelectorString) => GameEntity | null;
    querySelectorAll: (selector: GameSelectorString) => GameEntity[];
    testSelector: (selector: GameSelectorString, entity: GameEntity) => boolean;
    addCollisionFilter: (aSelector: GameSelectorString, bSelector: GameSelectorString) => void;
    removeCollisionFilter: (aSelector: GameSelectorString, bSelector: GameSelectorString) => void;
    clearCollisionFilters: () => void;
    collisionFilters: () => string[][];
    raycast: (origin: GameVector3, direction: GameVector3, options?: Partial<GameRaycastOptions>) => GameRaycastResult;
    searchBox: (bounds: GameBounds3) => GameEntity[];
    animate: (keyframes: Partial<GameWorldKeyframe>[], playbackInfo?: Partial<GameAnimationPlaybackConfig>) => GameAnimation<GameWorldKeyframe, GameWorld>;
    getAnimations: () => GameAnimation<GameWorldKeyframe, GameWorld>[];
    getEntityAnimations: () => GameAnimation<GameEntityKeyframe, GameEntity>[];
    getPlayerAnimations: () => GameAnimation<GamePlayerKeyframe, GamePlayer>[];
    onTick: GameEventChannel<GameTickEvent>;
    nextTick: GameEventFuture<GameTickEvent>;
    onTakeDamage: GameEventChannel<GameDamageEvent>;
    nextTakeDamage: GameEventFuture<GameDamageEvent>;
    onDie: GameEventChannel<GameDieEvent>;
    nextDie: GameEventFuture<GameDieEvent>;
    onPlayerJoin: GameEventChannel<GamePlayerEntityEvent>;
    nextPlayerJoin: GameEventFuture<GamePlayerEntityEvent>;
    onPlayerLeave: GameEventChannel<GamePlayerEntityEvent>;
    nextPlayerLeave: GameEventFuture<GamePlayerEntityEvent>;
    onEntityCreate: GameEventChannel<GameEntityEvent>;
    nextEntityCreate: GameEventFuture<GameEntityEvent>;
    onEntityDestroy: GameEventChannel<GameEntityEvent>;
    nextEntityDestroy: GameEventFuture<GameEntityEvent>;
    say: (message: string) => void;
    onChat: GameEventChannel<GameChatEvent>;
    nextChat: GameEventFuture<GameChatEvent>;
    onClick: GameEventChannel<GameClickEvent>;
    nextClick: GameEventFuture<GameClickEvent>;
    onPress: GameEventChannel<GameInputEvent>;
    nextPress: GameEventFuture<GameInputEvent>;
    onRelease: GameEventChannel<GameInputEvent>;
    nextRelease: GameEventFuture<GameInputEvent>;
    onEntityContact: GameEventChannel<GameEntityContactEvent>;
    nextEntityContact: GameEventFuture<GameEntityContactEvent>;
    onEntitySeparate: GameEventChannel<GameEntityContactEvent>;
    nextEntitySeparate: GameEventFuture<GameEntityContactEvent>;
    onVoxelContact: GameEventChannel<GameVoxelContactEvent>;
    nextVoxelContact: GameEventFuture<GameVoxelContactEvent>;
    onVoxelSeparate: GameEventChannel<GameVoxelContactEvent>;
    nextVoxelSeparate: GameEventFuture<GameVoxelContactEvent>;
    onFluidEnter: GameEventChannel<GameFluidContactEvent>;
    nextFluidEnter: GameEventFuture<GameFluidContactEvent>;
    onFluidLeave: GameEventChannel<GameFluidContactEvent>;
    nextFluidLeave: GameEventFuture<GameFluidContactEvent>;
    zones: () => GameZone[];
    addZone: (config: Partial<GameZoneConfig>) => GameZone;
    removeZone: (trigger: GameZone) => void;
    onInteract: GameEventChannel<GameInteractEvent>;
    nextInteract: GameEventFuture<GameInteractEvent>;
    sound: (spec: {
        sample: string;
        position?: GameVector3;
        radius?: number;
        gain?: number;
        pitch?: number;
    } | string) => Sound;
    teleport: TeleportType;
    serverId: string;
    projectName: string;
    currentTick: number;
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
    fogColor: GameRGBColor;
    fogStartDistance: number;
    fogHeightOffset: number;
    fogHeightFalloff: number;
    fogUniformDensity: number;
    maxFog: number;
    snowDensity: number;
    snowSizeLo: number;
    snowSizeHi: number;
    snowFallSpeed: number;
    snowSpinSpeed: number;
    snowColor: GameRGBAColor;
    snowTexture: string;
    rainDensity: number;
    rainDirection: GameVector3;
    rainSpeed: number;
    rainSizeLo: number;
    rainSizeHi: number;
    rainInterference: number;
    rainColor: GameRGBAColor;
    gravity: number;
    airFriction: number;
    useOBB: boolean;
    breakVoxelSound: GameSoundEffect;
    placeVoxelSound: GameSoundEffect;
    playerJoinSound: GameSoundEffect;
    playerLeaveSound: GameSoundEffect;
    ambientSound: GameSoundEffect;
    constructor(url: URL, entityQuota: () => number, onRespawn: GameEventChannel<GameRespawnEvent>, nextRespawn: GameEventFuture<GameRespawnEvent>, createEntity: (config: Partial<GameEntityConfig>) => GameEntity | null, querySelector: (selector: GameSelectorString) => GameEntity | null, querySelectorAll: (selector: GameSelectorString) => GameEntity[], testSelector: (selector: GameSelectorString, entity: GameEntity) => boolean, addCollisionFilter: (aSelector: GameSelectorString, bSelector: GameSelectorString) => void, removeCollisionFilter: (aSelector: GameSelectorString, bSelector: GameSelectorString) => void, clearCollisionFilters: () => void, collisionFilters: () => string[][], raycast: (origin: GameVector3, direction: GameVector3, options?: Partial<GameRaycastOptions>) => GameRaycastResult, searchBox: (bounds: GameBounds3) => GameEntity[], animate: (keyframes: Partial<GameWorldKeyframe>[], playbackInfo?: Partial<GameAnimationPlaybackConfig>) => GameAnimation<GameWorldKeyframe, GameWorld>, getAnimations: () => GameAnimation<GameWorldKeyframe, GameWorld>[], getEntityAnimations: () => GameAnimation<GameEntityKeyframe, GameEntity>[], getPlayerAnimations: () => GameAnimation<GamePlayerKeyframe, GamePlayer>[], onTick: GameEventChannel<GameTickEvent>, nextTick: GameEventFuture<GameTickEvent>, onTakeDamage: GameEventChannel<GameDamageEvent>, nextTakeDamage: GameEventFuture<GameDamageEvent>, onDie: GameEventChannel<GameDieEvent>, nextDie: GameEventFuture<GameDieEvent>, onPlayerJoin: GameEventChannel<GamePlayerEntityEvent>, nextPlayerJoin: GameEventFuture<GamePlayerEntityEvent>, onPlayerLeave: GameEventChannel<GamePlayerEntityEvent>, nextPlayerLeave: GameEventFuture<GamePlayerEntityEvent>, onEntityCreate: GameEventChannel<GameEntityEvent>, nextEntityCreate: GameEventFuture<GameEntityEvent>, onEntityDestroy: GameEventChannel<GameEntityEvent>, nextEntityDestroy: GameEventFuture<GameEntityEvent>, say: (message: string) => void, onChat: GameEventChannel<GameChatEvent>, nextChat: GameEventFuture<GameChatEvent>, onClick: GameEventChannel<GameClickEvent>, nextClick: GameEventFuture<GameClickEvent>, onPress: GameEventChannel<GameInputEvent>, nextPress: GameEventFuture<GameInputEvent>, onRelease: GameEventChannel<GameInputEvent>, nextRelease: GameEventFuture<GameInputEvent>, onEntityContact: GameEventChannel<GameEntityContactEvent>, nextEntityContact: GameEventFuture<GameEntityContactEvent>, onEntitySeparate: GameEventChannel<GameEntityContactEvent>, nextEntitySeparate: GameEventFuture<GameEntityContactEvent>, onVoxelContact: GameEventChannel<GameVoxelContactEvent>, nextVoxelContact: GameEventFuture<GameVoxelContactEvent>, onVoxelSeparate: GameEventChannel<GameVoxelContactEvent>, nextVoxelSeparate: GameEventFuture<GameVoxelContactEvent>, onFluidEnter: GameEventChannel<GameFluidContactEvent>, nextFluidEnter: GameEventFuture<GameFluidContactEvent>, onFluidLeave: GameEventChannel<GameFluidContactEvent>, nextFluidLeave: GameEventFuture<GameFluidContactEvent>, zones: () => GameZone[], addZone: (config: Partial<GameZoneConfig>) => GameZone, removeZone: (trigger: GameZone) => void, onInteract: GameEventChannel<GameInteractEvent>, nextInteract: GameEventFuture<GameInteractEvent>, sound: (spec: {
        sample: string;
        position?: GameVector3;
        radius?: number;
        gain?: number;
        pitch?: number;
    } | string) => Sound, teleport: TeleportType, serverId: string);
}
declare class GameVoxels {
    shape: GameVector3;
    VoxelTypes: string[];
    id: (name: string) => number;
    name: (id: number) => string;
    setVoxel: (x: number, y: number, z: number, voxel: number | string, rotation?: number | string) => number;
    getVoxel: (x: number, y: number, z: number) => number;
    getVoxelRotation: (x: number, y: number, z: number) => number;
    setVoxelId: (x: number, y: number, z: number, voxel: number) => number;
    getVoxelId: (x: number, y: number, z: number) => number;
    constructor(shape: GameVector3, VoxelTypes: string[], id: (name: string) => number, name: (id: number) => string, setVoxel: (x: number, y: number, z: number, voxel: number | string, rotation?: number | string) => number, getVoxel: (x: number, y: number, z: number) => number, getVoxelRotation: (x: number, y: number, z: number) => number, setVoxelId: (x: number, y: number, z: number, voxel: number) => number, getVoxelId: (x: number, y: number, z: number) => number);
}
type GamePlayerEntity = GameEntity & {
    player: GamePlayer;
    isPlayer: true;
};
type GamePlayerEntityEvent = GameEntityEvent & {
    entity: GamePlayerEntity;
};
interface GameEntityConfig {
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
interface GameHurtOptions {
    attacker: GameEntity;
    damageType: string;
}
interface GameEntityKeyframe {
    duration: number;
    easeIn: GameEasing;
    easeOut: GameEasing;
    position: GameVector3;
    velocity: GameVector3;
    mass: number;
    friction: number;
    restitution: number;
    collides: boolean;
    fixed: boolean;
    gravity: boolean;
    mesh: string;
    meshInvisible: boolean;
    meshScale: GameVector3;
    meshOrientation: GameQuaternion;
    meshOffset: GameVector3;
    meshColor: GameRGBAColor;
    meshMetalness: number;
    meshEmissive: number;
    meshShininess: number;
    particleRate: number;
    particleRateSpread: number;
    particleLimit: number;
    particleLifetime: number;
    particleLifetimeSpread: number;
    particleVelocity: GameVector3;
    particleVelocitySpread: GameVector3;
    particleColor: GameRGBColor[];
    particleSize: number[];
    particleSizeSpread: number;
    particleDamping: number;
    particleAcceleration: GameVector3;
    particleNoise: number;
    particleNoiseFrequency: number;
    particleTarget: GameEntity | null;
    particleTargetWeight: number;
    interactColor: GameRGBColor;
}
declare class GameEntity implements GameEntityConfig {
    tags: () => string[];
    addTag: (tag: string) => void;
    removeTag: (tag: string) => void;
    hasTag: (tag: string) => boolean;
    destroy: () => void;
    onDestroy: GameEventChannel<GameEntityEvent>;
    nextDestroy: GameEventFuture<GameEntityEvent>;
    onTakeDamage: GameEventChannel<GameDamageEvent>;
    nextTakeDamage: GameEventFuture<GameDamageEvent>;
    onDie: GameEventChannel<GameDieEvent>;
    nextDie: GameEventFuture<GameDieEvent>;
    hurt: (amount: number, options?: Partial<GameHurtOptions>) => void;
    say: (message: string, options?: {
        duration?: number;
        hideFloat?: boolean;
    }) => void;
    animate: (keyframes: Partial<GameEntityKeyframe>[], playbackInfo?: Partial<GameAnimationPlaybackConfig>) => GameAnimation<GameEntityKeyframe, GameEntity>;
    getAnimations: () => GameAnimation<GameEntityKeyframe, GameEntity>[];
    onClick: GameEventChannel<GameClickEvent>;
    nextClick: GameEventFuture<GameClickEvent>;
    onEntityContact: GameEventChannel<GameEntityContactEvent>;
    nextEntityContact: GameEventFuture<GameEntityContactEvent>;
    onEntitySeparate: GameEventChannel<GameEntityContactEvent>;
    nextEntitySeparate: GameEventFuture<GameEntityContactEvent>;
    onVoxelContact: GameEventChannel<GameVoxelContactEvent>;
    nextVoxelContact: GameEventFuture<GameVoxelContactEvent>;
    onVoxelSeparate: GameEventChannel<GameVoxelContactEvent>;
    nextVoxelSeparate: GameEventFuture<GameVoxelContactEvent>;
    onFluidEnter: GameEventChannel<GameFluidContactEvent>;
    nextFluidEnter: GameEventFuture<GameFluidContactEvent>;
    onFluidLeave: GameEventChannel<GameFluidContactEvent>;
    nextFluidLeave: GameEventFuture<GameFluidContactEvent>;
    onInteract: GameEventChannel<GameInteractEvent>;
    nextInteract: GameEventFuture<GameInteractEvent>;
    sound: (spec: {
        sample: string;
        radius?: number;
        pitch?: number;
        gain?: number;
    } | string) => Sound;
    motion: GameMotionController<GameEntity>;
    lookAt: (targetPosition: GameVector3, facingDirection?: 'X' | 'Y' | 'Z', up?: GameVector3) => void;
    rotateLocal: (localPosition: GameVector3, axis: 'X' | 'Y' | 'Z', rad: number) => void;
    scaleLocal: (localPosition: GameVector3, v: GameVector3) => void;
    id: string;
    destroyed: boolean;
    position: GameVector3;
    velocity: GameVector3;
    bounds: GameVector3;
    mass: number;
    friction: number;
    restitution: number;
    collides: boolean;
    gravity: boolean;
    fixed: boolean;
    contactForce: GameVector3;
    entityContacts: GameEntityContact[];
    voxelContacts: GameVoxelContact[];
    fluidContacts: GameFluidContact[];
    mesh: string;
    meshInvisible: boolean;
    meshScale: GameVector3;
    meshOrientation: GameQuaternion;
    meshOffset: GameVector3;
    meshColor: GameRGBAColor;
    meshMetalness: number;
    meshEmissive: number;
    meshShininess: number;
    anchorOffset: GameVector3;
    enableDamage: boolean;
    showHealthBar: boolean;
    hp: number;
    maxHp: number;
    isPlayer: boolean;
    player?: GamePlayer;
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
    showEntityName: boolean;
    customName: string;
    nameRadius: number;
    nameColor: GameRGBColor;
    chatSound: GameSoundEffect;
    hurtSound: GameSoundEffect;
    dieSound: GameSoundEffect;
    interactSound: GameSoundEffect;
    constructor(tags: () => string[], addTag: (tag: string) => void, removeTag: (tag: string) => void, hasTag: (tag: string) => boolean, destroy: () => void, onDestroy: GameEventChannel<GameEntityEvent>, nextDestroy: GameEventFuture<GameEntityEvent>, onTakeDamage: GameEventChannel<GameDamageEvent>, nextTakeDamage: GameEventFuture<GameDamageEvent>, onDie: GameEventChannel<GameDieEvent>, nextDie: GameEventFuture<GameDieEvent>, hurt: (amount: number, options?: Partial<GameHurtOptions>) => void, say: (message: string, options?: {
        duration?: number;
        hideFloat?: boolean;
    }) => void, animate: (keyframes: Partial<GameEntityKeyframe>[], playbackInfo?: Partial<GameAnimationPlaybackConfig>) => GameAnimation<GameEntityKeyframe, GameEntity>, getAnimations: () => GameAnimation<GameEntityKeyframe, GameEntity>[], onClick: GameEventChannel<GameClickEvent>, nextClick: GameEventFuture<GameClickEvent>, onEntityContact: GameEventChannel<GameEntityContactEvent>, nextEntityContact: GameEventFuture<GameEntityContactEvent>, onEntitySeparate: GameEventChannel<GameEntityContactEvent>, nextEntitySeparate: GameEventFuture<GameEntityContactEvent>, onVoxelContact: GameEventChannel<GameVoxelContactEvent>, nextVoxelContact: GameEventFuture<GameVoxelContactEvent>, onVoxelSeparate: GameEventChannel<GameVoxelContactEvent>, nextVoxelSeparate: GameEventFuture<GameVoxelContactEvent>, onFluidEnter: GameEventChannel<GameFluidContactEvent>, nextFluidEnter: GameEventFuture<GameFluidContactEvent>, onFluidLeave: GameEventChannel<GameFluidContactEvent>, nextFluidLeave: GameEventFuture<GameFluidContactEvent>, onInteract: GameEventChannel<GameInteractEvent>, nextInteract: GameEventFuture<GameInteractEvent>, sound: (spec: {
        sample: string;
        radius?: number;
        pitch?: number;
        gain?: number;
    } | string) => Sound, motion: GameMotionController<GameEntity>, lookAt: (targetPosition: GameVector3, facingDirection?: 'X' | 'Y' | 'Z', up?: GameVector3) => void, rotateLocal: (localPosition: GameVector3, axis: 'X' | 'Y' | 'Z', rad: number) => void, scaleLocal: (localPosition: GameVector3, v: GameVector3) => void);
}
interface GameMotionConfig {
    name: string;
    iterations: number;
}
interface GameMotionClipConfig {
    motions: GameMotionConfig[];
    iterations: number;
}
declare class GameMotionController<TargetType> {
    loadByName: (config: string | GameMotionConfig[] | GameMotionClipConfig) => GameMotionHandler<TargetType>;
    pause: () => void;
    resume: () => void;
    setDefaultMotionByName: (motionName?: string) => void;
    constructor(loadByName: (config: string | GameMotionConfig[] | GameMotionClipConfig) => GameMotionHandler<TargetType>, pause: () => void, resume: () => void, setDefaultMotionByName: (motionName?: string) => void);
}
declare class GameMotionHandler<TargetType> {
    readonly target: TargetType;
    play: () => void;
    cancel: () => void;
    onFinish: GameEventChannel<GameMotionEvent<TargetType>>;
    nextFinish: GameEventFuture<GameMotionEvent<TargetType>>;
    constructor(target: TargetType, play: () => void, cancel: () => void, onFinish: GameEventChannel<GameMotionEvent<TargetType>>, nextFinish: GameEventFuture<GameMotionEvent<TargetType>>);
}
declare class GameMotionEvent<TargetType> {
    tick: number;
    readonly target: TargetType;
    motionHandler: GameMotionHandler<TargetType>;
    cancelled: boolean;
    constructor(tick: number, target: TargetType, motionHandler: GameMotionHandler<TargetType>, cancelled: boolean);
}
declare class GameEntityContact {
    other: GameEntity;
    force: GameVector3;
    axis: GameVector3;
    constructor(other: GameEntity, force: GameVector3, axis: GameVector3);
}
declare class GameVoxelContact {
    x: number;
    y: number;
    z: number;
    voxel: number;
    force: GameVector3;
    axis: GameVector3;
    constructor(x: number, y: number, z: number, voxel: number, force: GameVector3, axis: GameVector3);
}
declare class GameFluidContact {
    voxel: number;
    volume: number;
    constructor(voxel: number, volume: number);
}
declare enum GamePlayerMoveState {
    FLYING = "fly",
    GROUND = "ground",
    SWIM = "swim",
    FALL = "fall",
    JUMP = "jump",
    DOUBLE_JUMP = "jump2"
}
declare enum GamePlayerWalkState {
    NONE = "",
    CROUCH = "crouch",
    WALK = "walk",
    RUN = "run"
}
declare enum GameBodyPart {
    HIPS = "hips",
    TORSO = "torso",
    NECK = "neck",
    HEAD = "head",
    LEFT_SHOULDER = "leftShoulder",
    LEFT_UPPER_ARM = "leftUpperArm",
    LEFT_LOWER_ARM = "leftLowerArm",
    LEFT_HAND = "leftHand",
    LEFT_UPPER_LEG = "leftUpperLeg",
    LEFT_LOWER_LEG = "leftLowerLeg",
    LEFT_FOOT = "leftFoot",
    RIGHT_SHOULDER = "rightShoulder",
    RIGHT_UPPER_ARM = "rightUpperArm",
    RIGHT_LOWER_ARM = "rightLowerArm",
    RIGHT_HAND = "rightHand",
    RIGHT_UPPER_LEG = "rightUpperLeg",
    RIGHT_LOWER_LEG = "rightLowerLeg",
    RIGHT_FOOT = "rightFoot"
}
type GameSkinValue = string | undefined | null;
type GameSkin = {
    [key in GameBodyPart]: GameSkinValue;
};
type GameSkinInvisible = {
    [key in GameBodyPart]: boolean;
};
interface GameWearableSpec {
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
declare class GameWearable implements GameWearableSpec {
    player: GamePlayer | null;
    bodyPart: GameBodyPart;
    mesh: string;
    color: GameRGBColor;
    emissive: number;
    metalness: number;
    shininess: number;
    orientation: GameQuaternion;
    scale: GameVector3;
    offset: GameVector3;
    remove(): void;
}
declare enum GameDialogType {
    TEXT = "text",
    SELECT = "select",
    INPUT = "input"
}
type GameDialogSelectResponse = {
    index: number;
    value: string;
};
type GameDialogResponse = GameDialogSelectResponse | string | null;
type GameDialogParams = {
    type: GameDialogType;
    title?: string;
    content: string;
    titleBackgroundColor?: GameRGBAColor;
    titleTextColor?: GameRGBAColor;
    contentBackgroundColor?: GameRGBAColor;
    contentTextColor?: GameRGBAColor;
    hasArrow?: boolean;
    options?: string[];
    placeholder?: string;
    confirmText?: string;
    lookTarget?: GameVector3 | GameEntity;
    lookTargetOffset?: GameVector3;
    lookUp?: GameVector3;
    lookEye?: GameVector3 | GameEntity;
    lookEyeOffset?: GameVector3;
};
type GameTextDialogParams = {
    type: GameDialogType.TEXT;
    title?: string;
    content: string;
    titleBackgroundColor?: GameRGBAColor;
    titleTextColor?: GameRGBAColor;
    contentBackgroundColor?: GameRGBAColor;
    contentTextColor?: GameRGBAColor;
    hasArrow?: boolean;
    lookTarget?: GameVector3 | GameEntity;
    lookTargetOffset?: GameVector3;
    lookUp?: GameVector3;
    lookEye?: GameVector3 | GameEntity;
    lookEyeOffset?: GameVector3;
};
type GameSelectDialogParams = {
    type: GameDialogType.SELECT;
    title?: string;
    content: string;
    titleBackgroundColor?: GameRGBAColor;
    titleTextColor?: GameRGBAColor;
    contentBackgroundColor?: GameRGBAColor;
    contentTextColor?: GameRGBAColor;
    options: string[];
    lookTarget?: GameVector3 | GameEntity;
    lookTargetOffset?: GameVector3;
    lookUp?: GameVector3;
    lookEye?: GameVector3 | GameEntity;
    lookEyeOffset?: GameVector3;
};
type GameInputDialogParams = {
    type: GameDialogType.INPUT;
    title?: string;
    content: string;
    titleBackgroundColor?: GameRGBAColor;
    titleTextColor?: GameRGBAColor;
    contentBackgroundColor?: GameRGBAColor;
    contentTextColor?: GameRGBAColor;
    placeholder?: string;
    confirmText?: string;
    lookTarget?: GameVector3 | GameEntity;
    lookTargetOffset?: GameVector3;
    lookUp?: GameVector3;
    lookEye?: GameVector3 | GameEntity;
    lookEyeOffset?: GameVector3;
};
type GameDialogCancelOption = {
    cancel: () => void;
};
type GameDialogCall = ((params: GameTextDialogParams) => Promise<string | null> & GameDialogCancelOption) | ((params: GameSelectDialogParams) => Promise<GameDialogSelectResponse | null> & GameDialogCancelOption) | ((params: GameInputDialogParams) => Promise<string | null> & GameDialogCancelOption);
declare enum GameCameraMode {
    FOLLOW = "follow",
    FPS = "fps",
    FIXED = "fixed",
    RELATIVE = "relative"
}
declare enum GameCameraFreezedAxis {
    NONE = "",
    X = "x",
    Y = "y",
    Z = "z",
    XY = "xy",
    XZ = "xz",
    YZ = "yz",
    XYZ = "xyz"
}
declare enum GameInputDirection {
    NONE = "none",
    VERTICAL = "vertical",
    HORIZONTAL = "horizontal",
    BOTH = "both"
}
interface GamePlayerKeyframe {
    duration: number;
    easeIn: GameEasing;
    easeOut: GameEasing;
    scale: number;
    color: GameRGBColor;
    metalness: number;
    emissive: number;
    shininess: number;
    invisible: boolean;
    showName: boolean;
    showIndicator: boolean;
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
interface Gamepad {
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
declare class GamePlayer {
    directMessage: (message: string) => void;
    onChat: GameEventChannel<GameChatEvent>;
    nextChat: GameEventFuture<GameChatEvent>;
    onPress: GameEventChannel<GameInputEvent>;
    nextPress: GameEventFuture<GameInputEvent>;
    onRelease: GameEventChannel<GameInputEvent>;
    nextRelease: GameEventFuture<GameInputEvent>;
    onRespawn: GameEventChannel<GameRespawnEvent>;
    nextRespawn: GameEventFuture<GameRespawnEvent>;
    forceRespawn: () => void;
    dialog: GameDialogCall;
    cancelDialogs: () => void;
    link: (href: string, options?: {
        isConfirm?: boolean;
        isNewTab?: boolean;
    }) => void;
    wearables: (bodyPart?: GameBodyPart) => GameWearable[];
    addWearable: (spec: Partial<GameWearable>) => GameWearable;
    removeWearable: (wearable: GameWearable) => void;
    setSkinByName: (skinName: string) => void;
    resetToDefaultSkin: () => void;
    clearSkin: () => void;
    sound: (spec: {
        sample: string;
        gain?: number;
        pitch?: number;
    } | string) => Sound;
    animate: (keyframes: Partial<GamePlayerKeyframe>[], playbackConfig?: GameAnimationPlaybackConfig) => GameAnimation<GamePlayerKeyframe, GamePlayer>;
    getAnimations: () => GameAnimation<GamePlayerKeyframe, GamePlayer>[];
    kick: () => void;
    setCameraPitch: (value: number) => void;
    setCameraYaw: (value: number) => void;
    onKeyDown: GameEventChannel<GameKeyBoardEvent>;
    onKeyUp: GameEventChannel<GameKeyBoardEvent>;
    gamepad: Gamepad;
    name: string;
    userId: string;
    userKey: string;
    boxId: string;
    avatar: string;
    url: URL;
    spawnPoint: GameVector3;
    movementBounds: GameBounds3;
    scale: number;
    color: GameRGBColor;
    metalness: number;
    emissive: number;
    shininess: number;
    invisible: boolean;
    showName: boolean;
    showIndicator: boolean;
    dead: boolean;
    colorLUT: string;
    cameraMode: GameCameraMode;
    cameraEntity: GameEntity | null;
    cameraTarget: GameVector3;
    cameraUp: GameVector3;
    cameraPosition: GameVector3;
    cameraFreezedAxis: GameCameraFreezedAxis;
    cameraFovY: number;
    cameraDistance: number;
    canFly: boolean;
    spectator: boolean;
    walkSpeed: number;
    walkAcceleration: number;
    runSpeed: number;
    runAcceleration: number;
    crouchSpeed: number;
    crouchAcceleration: number;
    swimSpeed: number;
    swimAcceleration: number;
    flySpeed: number;
    flyAcceleration: number;
    jumpSpeedFactor: number;
    jumpAccelerationFactor: number;
    jumpPower: number;
    doubleJumpPower: number;
    freezedForwardDirection: GameVector3 | null;
    moveState: GamePlayerMoveState;
    walkState: GamePlayerWalkState;
    swapInputDirection: boolean;
    reverseInputDirection: GameInputDirection;
    disableInputDirection: GameInputDirection;
    walkButton: boolean;
    crouchButton: boolean;
    jumpButton: boolean;
    enableAction0: boolean;
    enableAction1: boolean;
    action0Button: boolean;
    action1Button: boolean;
    enableJump: boolean;
    enableDoubleJump: boolean;
    enableCrouch: boolean;
    enable3DCursor: boolean;
    facingDirection: GameVector3;
    cameraYaw: number;
    cameraPitch: number;
    spawnSound: GameSoundEffect;
    jumpSound: GameSoundEffect;
    doubleJumpSound: GameSoundEffect;
    landSound: GameSoundEffect;
    crouchSound: GameSoundEffect;
    stepSound: GameSoundEffect;
    swimSound: GameSoundEffect;
    action0Sound: GameSoundEffect;
    action1Sound: GameSoundEffect;
    enterWaterSound: GameSoundEffect;
    leaveWaterSound: GameSoundEffect;
    startFlySound: GameSoundEffect;
    stopFlySound: GameSoundEffect;
    music: GameSoundEffect;
    muted: boolean;
    skin: GameSkin;
    skinInvisible: GameSkinInvisible;
    navigator: PlayerNavigator;
    constructor(directMessage: (message: string) => void, onChat: GameEventChannel<GameChatEvent>, nextChat: GameEventFuture<GameChatEvent>, onPress: GameEventChannel<GameInputEvent>, nextPress: GameEventFuture<GameInputEvent>, onRelease: GameEventChannel<GameInputEvent>, nextRelease: GameEventFuture<GameInputEvent>, onRespawn: GameEventChannel<GameRespawnEvent>, nextRespawn: GameEventFuture<GameRespawnEvent>, forceRespawn: () => void, dialog: GameDialogCall, cancelDialogs: () => void, link: (href: string, options?: {
        isConfirm?: boolean;
        isNewTab?: boolean;
    }) => void, wearables: (bodyPart?: GameBodyPart) => GameWearable[], addWearable: (spec: Partial<GameWearable>) => GameWearable, removeWearable: (wearable: GameWearable) => void, setSkinByName: (skinName: string) => void, resetToDefaultSkin: () => void, clearSkin: () => void, sound: (spec: {
        sample: string;
        gain?: number;
        pitch?: number;
    } | string) => Sound, animate: (keyframes: Partial<GamePlayerKeyframe>[], playbackConfig?: GameAnimationPlaybackConfig) => GameAnimation<GamePlayerKeyframe, GamePlayer>, getAnimations: () => GameAnimation<GamePlayerKeyframe, GamePlayer>[], kick: () => void, setCameraPitch: (value: number) => void, setCameraYaw: (value: number) => void, postMessage: (event: {
        type: string;
        value: object;
        isOld: boolean;
    }) => void, addEventListener: (type: NavigatorEventType, listener: (event: {
        data: object;
    }) => void) => void, onKeyDown: GameEventChannel<GameKeyBoardEvent>, onKeyUp: GameEventChannel<GameKeyBoardEvent>);
}
declare class PlayerNavigator {
    emitEvent: (type: string, value: object) => void;
    addEventListener: (type: NavigatorEventType, listener: (event: {
        data: object;
    }) => void) => void;
    dispatchEvent: (type: string, value: object) => void;
    constructor(emitEvent: (type: string, value: object) => void, addEventListener: (type: NavigatorEventType, listener: (event: {
        data: object;
    }) => void) => void, dispatchEvent: (type: string, value: object) => void);
}
type NavigatorEventType = 'message';
declare class GameRaycastResult {
    hit: boolean;
    hitEntity: GameEntity | null;
    hitVoxel: number;
    origin: GameVector3;
    direction: GameVector3;
    distance: number;
    hitPosition: GameVector3;
    normal: GameVector3;
    voxelIndex: GameVector3;
    constructor(hit: boolean, hitEntity: GameEntity | null, hitVoxel: number, origin: GameVector3, direction: GameVector3, distance: number, hitPosition: GameVector3, normal: GameVector3, voxelIndex: GameVector3);
}
interface GameRaycastOptions {
    maxDistance: number;
    ignoreFluid: boolean;
    ignoreVoxel: boolean;
    ignoreEntities: boolean;
    ignoreSelector: GameSelectorString;
}
type GameEventChannel<EventType> = (handler: (event: EventType) => void) => GameEventHandlerToken;
type GameEventFuture<EventType> = (filter?: (event: EventType) => boolean) => Promise<EventType>;
declare class GameEventHandlerToken {
    cancel: () => void;
    resume: () => void;
    active: () => boolean;
    constructor(cancel: () => void, resume: () => void, active: () => boolean);
}
declare class GameTickEvent {
    tick: number;
    prevTick: number;
    skip: boolean;
    elapsedTimeMS: number;
    constructor(tick: number, prevTick: number, skip: boolean, elapsedTimeMS: number);
}
declare class GameEntityEvent {
    tick: number;
    entity: GameEntity;
    constructor(tick: number, entity: GameEntity);
}
declare class GameTriggerEvent {
    tick: number;
    entity: GameEntity;
    constructor(tick: number, entity: GameEntity);
}
declare class GameDamageEvent {
    tick: number;
    entity: GameEntity;
    damage: number;
    attacker: GameEntity | null;
    damageType: string;
    constructor(tick: number, entity: GameEntity, damage: number, attacker: GameEntity | null, damageType: string);
}
declare class GameDieEvent {
    tick: number;
    entity: GameEntity;
    attacker: GameEntity | null;
    damageType: string;
    constructor(tick: number, entity: GameEntity, attacker: GameEntity | null, damageType: string);
}
declare class GameRespawnEvent {
    tick: number;
    entity: GamePlayerEntity;
    constructor(tick: number, entity: GamePlayerEntity);
}
declare class GameEntityContactEvent {
    tick: number;
    entity: GameEntity;
    other: GameEntity;
    axis: GameVector3;
    force: GameVector3;
    constructor(tick: number, entity: GameEntity, other: GameEntity, axis: GameVector3, force: GameVector3);
}
declare class GameVoxelContactEvent {
    tick: number;
    entity: GameEntity;
    x: number;
    y: number;
    z: number;
    voxel: number;
    axis: GameVector3;
    force: GameVector3;
    constructor(tick: number, entity: GameEntity, x: number, y: number, z: number, voxel: number, axis: GameVector3, force: GameVector3);
}
declare class GameFluidContactEvent {
    tick: number;
    entity: GameEntity;
    voxel: number;
    constructor(tick: number, entity: GameEntity, voxel: number);
}
declare class GameChatEvent {
    tick: number;
    entity: GameEntity;
    message: string;
    constructor(tick: number, entity: GameEntity, message: string);
}
declare class GameInteractEvent {
    tick: number;
    entity: GamePlayerEntity;
    targetEntity: GameEntity;
    constructor(tick: number, entity: GamePlayerEntity, targetEntity: GameEntity);
}
declare enum GameButtonType {
    WALK = "walk",
    RUN = "run",
    CROUCH = "crouch",
    JUMP = "jump",
    DOUBLE_JUMP = "jump2",
    FLY = "fly",
    ACTION0 = "action0",
    ACTION1 = "action1"
}
declare class GameInputEvent {
    tick: number;
    entity: GamePlayerEntity;
    position: GameVector3;
    button: GameButtonType;
    pressed: boolean;
    raycast: GameRaycastResult;
    constructor(tick: number, entity: GamePlayerEntity, position: GameVector3, button: GameButtonType, pressed: boolean, raycast: GameRaycastResult);
}
declare class GameClickEvent {
    tick: number;
    entity: GameEntity;
    clicker: GamePlayerEntity;
    button: GameButtonType.ACTION0 | GameButtonType.ACTION1;
    distance: number;
    clickerPosition: GameVector3;
    raycast: GameRaycastResult;
    constructor(tick: number, entity: GameEntity, clicker: GamePlayerEntity, button: GameButtonType.ACTION0 | GameButtonType.ACTION1, distance: number, clickerPosition: GameVector3, raycast: GameRaycastResult);
}
declare class GameKeyBoardEvent {
    tick: number;
    keyCode: number;
    constructor(tick: number, keyCode: number);
}
declare class GameAnimationEvent<KeyframeType, TargetType> {
    tick: number;
    target: TargetType;
    animation: GameAnimation<KeyframeType, TargetType>;
    cancelled: boolean;
    constructor(tick: number, target: TargetType, animation: GameAnimation<KeyframeType, TargetType>, cancelled: boolean);
}
type GameSelectorString = string;
declare class GameResourceSystem {
    ls: (path?: string) => GameAssetListEntry[];
    constructor(ls: (path?: string) => GameAssetListEntry[]);
}
declare enum GameAssetType {
    VOXEL_MESH = "mesh",
    DIRECTORY = "directory",
    COLOR_LUT = "lut",
    JS_SCRIPT = "js",
    IMAGE = "image",
    PARTICLE_TEXTURE = "snow",
    SOUND = "sound",
    PICTURE = "picture"
}
declare class GameAssetListEntry {
    path: string;
    type: GameAssetType;
    constructor(path: string, type: GameAssetType);
}


// File: api/api/js/db.d.ts
declare class GameDatabase {
    sql: (sql: string[], ...params: (number | string | Uint8Array | boolean | null)[]) => GameQueryResult;
    constructor(sql: (sql: string[], ...params: (number | string | Uint8Array | boolean | null)[]) => GameQueryResult);
}
declare class GameQueryResult implements AsyncIterable<any> {
    next: () => Promise<{
        done: boolean;
        value: any;
    }>;
    [Symbol.asyncIterator](): this;
    return: () => Promise<{
        done: boolean;
        value: any;
    }>;
    throw: (err: any) => Promise<{
        done: boolean;
        value: any;
    }>;
    then: (resolve: (rows: any[]) => any, reject: (err: any) => any) => void;
    constructor(next: () => Promise<{
        done: boolean;
        value: any;
    }>, abort: () => Promise<{
        done: boolean;
        value: any;
    }>, error: (err: any) => Promise<{
        done: boolean;
        value: any;
    }>, then: (resolve: (rows: any[]) => any, reject: (err: any) => any) => void);
}


// File: api/api/js/error.d.ts
type CommonError<T> = {
    status: T;
    code: number;
    msg: string;
};


// File: api/api/js/gui.d.ts


interface GameGUIEvent {
    entity: GamePlayerEntity;
    name: string;
    payload: any;
}
interface GameGUIEventListener {
    (event: GameGUIEvent): void;
}
declare class GameGUI {
    init: <T extends string, U extends T>(entity: GamePlayerEntity, config: GUIConfig<T, U>) => Promise<void>;
    show: (entity: GamePlayerEntity, name: string, allowMultiple?: boolean) => Promise<void>;
    remove: (entity: GamePlayerEntity, selector: string) => Promise<void>;
    getAttribute: (entity: GamePlayerEntity, selector: string, name: string) => Promise<any>;
    setAttribute: (entity: GamePlayerEntity, selector: string, name: string, value: any) => Promise<void>;
    onMessage: (listener: GameGUIEventListener) => void;
    ui: InstanceType<any>['ui'];
    constructor(init: <T extends string, U extends T>(entity: GamePlayerEntity, config: GUIConfig<T, U>) => Promise<void>, show: (entity: GamePlayerEntity, name: string, allowMultiple?: boolean) => Promise<void>, remove: (entity: GamePlayerEntity, selector: string) => Promise<void>, getAttribute: (entity: GamePlayerEntity, selector: string, name: string) => Promise<any>, setAttribute: (entity: GamePlayerEntity, selector: string, name: string, value: any) => Promise<void>, onMessage: (listener: GameGUIEventListener) => void);
}


// File: api/api/js/http.d.ts
type GameHttpFetchHeaders = {
    [name: string]: string | string[];
};
type GameHttpFetchRequestOptions = {
    timeout?: number;
    method?: 'OPTIONS' | 'GET' | 'HEAD' | 'PUT' | 'POST' | 'DELETE' | 'PATCH';
    headers?: GameHttpFetchHeaders;
    body?: string | ArrayBuffer;
};
declare class GameHttpFetchResponse {
    status: number;
    statusText: string;
    headers: GameHttpFetchHeaders;
    json: () => Promise<any>;
    text: () => Promise<string>;
    arrayBuffer: () => Promise<ArrayBuffer>;
    close: () => Promise<void>;
    constructor(status: number, statusText: string, headers: GameHttpFetchHeaders, json: () => Promise<any>, text: () => Promise<string>, arrayBuffer: () => Promise<ArrayBuffer>, close: () => Promise<void>);
    get ok(): boolean;
}
declare class GameHttpRequest {
}
declare class GameHttpResponse {
}
type GameHttpHandler = (request: GameHttpRequest, response: GameHttpResponse) => void;
declare class GameHttpAPI {
    fetch: (url: string, options?: GameHttpFetchRequestOptions) => Promise<GameHttpFetchResponse>;
    constructor(fetch: (url: string, options?: GameHttpFetchRequestOptions) => Promise<GameHttpFetchResponse>);
}


// File: api/api/js/math.d.ts
declare class GameQuaternion {
    w: number;
    x: number;
    y: number;
    z: number;
    constructor(w: number, x: number, y: number, z: number);
    static rotationBetween(a: GameVector3, b: GameVector3): GameQuaternion;
    static fromAxisAngle(axis: GameVector3, rad: number): GameQuaternion;
    static fromEuler(x: number, y: number, z: number): GameQuaternion;
    set(w: number, x: number, y: number, z: number): GameQuaternion;
    copy(q: GameQuaternion): GameQuaternion;
    getAxisAngle(_q: GameQuaternion): {
        axis: GameVector3;
        angle: number;
    };
    rotateX(_rad: number): GameQuaternion;
    rotateY(_rad: number): GameQuaternion;
    rotateZ(_rad: number): GameQuaternion;
    dot(q: GameQuaternion): number;
    add(v: GameQuaternion): GameQuaternion;
    sub(v: GameQuaternion): GameQuaternion;
    angle(q: GameQuaternion): number;
    mul(q: GameQuaternion): GameQuaternion;
    inv(): GameQuaternion;
    div(q: GameQuaternion): GameQuaternion;
    slerp(q: GameQuaternion, n: number): GameQuaternion;
    mag(): number;
    sqrMag(): number;
    normalize(): GameQuaternion;
    equals(q: GameQuaternion): boolean;
    clone(): GameQuaternion;
    toString(): string;
}
declare class GameVector3 {
    x: number;
    y: number;
    z: number;
    constructor(x: number, y: number, z: number);
    static fromPolar(mag: number, phi: number, theta: number): GameVector3;
    set(x: number, y: number, z: number): GameVector3;
    copy(v: GameVector3): GameVector3;
    add(v: GameVector3): GameVector3;
    sub(v: GameVector3): GameVector3;
    mul(v: GameVector3): GameVector3;
    div(v: GameVector3): GameVector3;
    addEq(v: GameVector3): GameVector3;
    subEq(v: GameVector3): GameVector3;
    mulEq(v: GameVector3): GameVector3;
    divEq(v: GameVector3): GameVector3;
    dot(v: GameVector3): number;
    cross(v: GameVector3): GameVector3;
    scale(n: number): GameVector3;
    clone(): GameVector3;
    lerp(v: GameVector3, n: number): GameVector3;
    mag(): number;
    sqrMag(): number;
    towards(v: GameVector3): GameVector3;
    distance(v: GameVector3): number;
    normalize(): GameVector3;
    angle(v: GameVector3): number;
    max(v: GameVector3): GameVector3;
    min(v: GameVector3): GameVector3;
    exactEquals(v: GameVector3): boolean;
    equals(v: GameVector3): boolean;
    toString(): string;
}
declare class GameBounds3 {
    lo: GameVector3;
    hi: GameVector3;
    constructor(lo: GameVector3, hi: GameVector3);
    static fromPoints(...points: GameVector3[]): GameBounds3;
    intersect(b: GameBounds3): GameBounds3;
    contains(b: GameVector3): boolean;
    containsBounds(b: GameBounds3): boolean;
    intersects(b: GameBounds3): boolean;
    set(lox: number, loy: number, loz: number, hix: number, hiy: number, hiz: number): GameBounds3;
    copy(b: GameBounds3): GameBounds3;
    toString(): string;
}
declare class GameRGBAColor {
    r: number;
    g: number;
    b: number;
    a: number;
    constructor(r: number, g: number, b: number, a: number);
    set(r: number, g: number, b: number, a: number): GameRGBAColor;
    copy(c: GameRGBAColor): GameRGBAColor;
    add(rgba: GameRGBAColor): GameRGBAColor;
    sub(rgba: GameRGBAColor): GameRGBAColor;
    mul(rgba: GameRGBAColor): GameRGBAColor;
    div(rgba: GameRGBAColor): GameRGBAColor;
    addEq(rgba: GameRGBAColor): GameRGBAColor;
    subEq(rgba: GameRGBAColor): GameRGBAColor;
    mulEq(rgba: GameRGBAColor): GameRGBAColor;
    divEq(rgba: GameRGBAColor): GameRGBAColor;
    lerp(rgba: GameRGBAColor, n: number): GameRGBAColor;
    blendEq(rgb: GameRGBColor): GameRGBColor;
    equals(rgba: GameRGBAColor): boolean;
    clone(): GameRGBAColor;
    toString(): string;
}
declare class GameRGBColor {
    r: number;
    g: number;
    b: number;
    static random(): GameRGBColor;
    constructor(r: number, g: number, b: number);
    set(r: number, g: number, b: number): GameRGBColor;
    copy(c: GameRGBColor): GameRGBColor;
    add(rgb: GameRGBColor): GameRGBColor;
    sub(rgb: GameRGBColor): GameRGBColor;
    mul(rgb: GameRGBColor): GameRGBColor;
    div(rgb: GameRGBColor): GameRGBColor;
    addEq(rgb: GameRGBColor): GameRGBColor;
    subEq(rgb: GameRGBColor): GameRGBColor;
    mulEq(rgb: GameRGBColor): GameRGBColor;
    divEq(rgb: GameRGBColor): GameRGBColor;
    lerp(rgb: GameRGBColor, n: number): GameRGBColor;
    equals(rgb: GameRGBColor): boolean;
    clone(): GameRGBColor;
    toRGBA(): GameRGBAColor;
    toString(): string;
}


// File: api/api/js/remote-channel.d.ts


type SendClientEventType = (entities: GamePlayerEntity | GamePlayerEntity[], clientEvent: JSONValue) => void;
type ServerEvent = {
    tick: number;
    entity: GamePlayerEntity;
    args: JSONValue;
};
declare class ServerRemoteChannel {
    sendClientEvent: SendClientEventType;
    broadcastClientEvent: (clientEvent: JSONValue) => void;
    onServerEvent: GameEventChannel<ServerEvent>;
    constructor(sendClientEvent: SendClientEventType, broadcastClientEvent: (clientEvent: JSONValue) => void, onServerEvent: GameEventChannel<ServerEvent>);
}


// File: api/api/js/rtc.d.ts

declare class GameRTCChannel {
    add: (entity: GamePlayerEntity) => Promise<void>;
    remove: (entity: GamePlayerEntity) => Promise<void>;
    unpublish: (entity: GamePlayerEntity) => Promise<void>;
    publishMicrophone: (entity: GamePlayerEntity) => Promise<void>;
    getPlayers: () => Promise<GamePlayerEntity[]>;
    destroy: () => Promise<void>;
    getVolume: (entity: GamePlayerEntity) => Promise<number>;
    setVolume: (entity: GamePlayerEntity, volume: number) => Promise<void>;
    getMicrophonePermission: (entity: GamePlayerEntity) => Promise<boolean>;
    constructor(add: (entity: GamePlayerEntity) => Promise<void>, remove: (entity: GamePlayerEntity) => Promise<void>, unpublish: (entity: GamePlayerEntity) => Promise<void>, publishMicrophone: (entity: GamePlayerEntity) => Promise<void>, getPlayers: () => Promise<GamePlayerEntity[]>, destroy: () => Promise<void>, getVolume: (entity: GamePlayerEntity) => Promise<number>, setVolume: (entity: GamePlayerEntity, volume: number) => Promise<void>, getMicrophonePermission: (entity: GamePlayerEntity) => Promise<boolean>);
}
declare class GameRTC {
    createChannel: (channelId?: string) => Promise<GameRTCChannel>;
    constructor(createChannel: (channelId?: string) => Promise<GameRTCChannel>);
}


// File: api/api/js/storage.d.ts

type DB_ERROR_STATUS = 'CONSTRAINT_TARGET_INVALID' | 'PARAMS_INVALID' | 'DB_NAME_INVALID' | 'KEY_INVALID' | 'VALUE_INVALID' | 'SERVER_FETCH_ERROR' | 'REQUEST_THROTTLED' | 'INCREMENT_INVALID' | 'UNKNOWN';
declare class GameStorage implements I.GameStorage {
    getDataStorage: (key: string) => GameDataStorage;
    getGroupStorage: (key: string) => GameDataStorage | undefined;
    constructor(getDataStorage: (key: string) => GameDataStorage, getGroupStorage: (key: string) => GameDataStorage | undefined);
}
type JSONValue = I.JSONValue;
type ResultValue = {
    key: string;
    value: JSONValue;
    version: string;
    updateTime: number;
    createTime: number;
};
type ListReturnValue = {
    items: ResultValue[];
    isLastPage: boolean;
};
type ReturnValue = I.ReturnValue;
type ListPageOptions = I.ListPageOptions;
declare class GameDataStorage implements I.GameDataStorage {
    readonly key: string;
    set: (key: string, value: JSONValue) => Promise<void>;
    update: (key: string, handler: (prevValue: ReturnValue) => JSONValue) => Promise<void>;
    get: (key: string) => Promise<ReturnValue>;
    increment: (key: string, value?: number) => Promise<number>;
    list: (options: ListPageOptions) => Promise<QueryList>;
    remove: (key: string) => Promise<ReturnValue>;
    destroy: () => Promise<void>;
    constructor(key: string, set: (key: string, value: JSONValue) => Promise<void>, update: (key: string, handler: (prevValue: ReturnValue) => JSONValue) => Promise<void>, get: (key: string) => Promise<ReturnValue>, increment: (key: string, value?: number) => Promise<number>, list: (options: ListPageOptions) => Promise<QueryList>, remove: (key: string) => Promise<ReturnValue>, destroy: () => Promise<void>);
}
declare class QueryList implements I.QueryList {
    getCurrentPage: () => ReturnValue[];
    nextPage: () => Promise<void>;
    isLastPage: boolean;
    constructor(getCurrentPage: () => ReturnValue[], nextPage: () => Promise<void>);
}


// File: api/api/js/url.d.ts
declare class URLSearchParams {
    constructor(args: any);
    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string | null;
    getAll(name: string): string[];
    forEach(callback: (this: URLSearchParams, value: string, key: string, url: URLSearchParams) => any): void;
    has(name: string): boolean;
    set(name: string, value: string): void;
    keys(): ArrayIterator<string>;
    values(): ArrayIterator<string>;
    entries(): ArrayIterator<string[]>;
    sort(): void;
    toString(): string;
    [Symbol.iterator](): ArrayIterator<string[]>;
}
declare class URL {
    constructor(url: any, base?: any);
    get hash(): string;
    set hash(value: string);
    get host(): string;
    set host(value: string);
    get hostname(): any;
    set hostname(value: any);
    get port(): string;
    set port(value: string);
    get href(): string;
    set href(value: string);
    get origin(): string;
    get username(): string;
    set username(value: string);
    get password(): string;
    set password(value: string);
    get pathname(): string;
    set pathname(value: string);
    get protocol(): string;
    set protocol(value: string);
    get search(): string;
    set search(value: string);
    get searchParams(): URLSearchParams;
    toString(): string;
    toJSON(): string;
}


// File: api/gui/types.d.ts
interface GUIData {
    name: string;
    attributes?: {
        [name: string]: string | number;
    };
    children?: GUIData[];
}
interface GUIBind<T extends string> {
    event: string;
    selector?: string;
    action: T;
}
interface GUIBindDefinition<T> {
    drag: {
        attributes: {
            [name: string]: 'x' | '-x' | 'y' | '-y';
        };
        targetSelector: string;
    };
    show: {
        name: T;
        allowMultiple?: boolean;
    };
    remove: {
        targetSelector: string;
    };
    sendMessage: {
        messageName: string;
        messageData?: string[];
    };
    clipboardWrite: {
        targetSelector: string;
        attributeName: string;
    };
}
type GUIBindTypeMap<T> = {
    [key in keyof GUIBindDefinition<T>]: GUIBind<key> & GUIBindDefinition<T>[key];
};
type GUIBindTypes<T> = GUIBindTypeMap<T>[keyof GUIBindTypeMap<T>];
interface GUIConfigItem<T extends string> {
    display?: boolean;
    bindings?: GUIBindTypes<T>[];
    data: string | GUIData;
}
type GUIConfig<T extends string, U extends T> = {
    [name in T]: GUIConfigItem<U>;
};
