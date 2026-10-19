"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameAssetListEntry = exports.GameAssetType = exports.GameResourceSystem = exports.GameAnimationEvent = exports.GameKeyBoardEvent = exports.GameClickEvent = exports.GameInputEvent = exports.GameButtonType = exports.GameInteractEvent = exports.GameChatEvent = exports.GameFluidContactEvent = exports.GameVoxelContactEvent = exports.GameEntityContactEvent = exports.GameRespawnEvent = exports.GameDieEvent = exports.GameDamageEvent = exports.GameTriggerEvent = exports.GameEntityEvent = exports.GameTickEvent = exports.GameEventHandlerToken = exports.GameRaycastResult = exports.PlayerNavigator = exports.GamePlayer = exports.GameInputDirection = exports.GameCameraFreezedAxis = exports.GameCameraMode = exports.GameDialogType = exports.GameWearable = exports.GameBodyPart = exports.GamePlayerWalkState = exports.GamePlayerMoveState = exports.GameFluidContact = exports.GameVoxelContact = exports.GameEntityContact = exports.GameMotionEvent = exports.GameMotionHandler = exports.GameMotionController = exports.GameEntity = exports.GameVoxels = exports.GameWorld = exports.Sound = exports.GameAnimation = exports.GameEasing = exports.GameAnimationDirection = exports.GameAnimationPlaybackState = exports.GameZone = exports.GameSoundEffect = void 0;
const math_1 = require("./math");
/**
 * A single sound effect table
 */
class GameSoundEffect {
    constructor() {
        /**
         * Sample weight
         */
        this.radius = 32;
        /**
         * Volume gain, makes sound louder
         */
        this.gain = 1;
        /**
         * Variability in volume gain
         */
        this.gainRange = 0;
        /**
         * Pitch adjustment multiplier.
         * * 1 : normal
         * * < 1 : slower playback
         * * > 1 : faster playback
         */
        this.pitch = 1;
        /**
         * Variability in pitch
         */
        this.pitchRange = 0;
        /**
         * Path to sample
         */
        this.sample = '';
    }
}
exports.GameSoundEffect = GameSoundEffect;
/**
 * Triggers can be used to detect when an object enters some zone or leaves.
 */
class GameZone {
    /**
     * @ignore
     */
    constructor(
    /**
     * List all entities
     */
    entities, 
    /**
     * Triggered when an entity enters the zone
     */
    onEnter, nextEnter, 
    /**
     * Triggers when an entity leaves the zone
     */
    onLeave, nextLeave, 
    /**
     * Destroys the zone
     */
    remove) {
        this.entities = entities;
        this.onEnter = onEnter;
        this.nextEnter = nextEnter;
        this.onLeave = onLeave;
        this.nextLeave = nextLeave;
        this.remove = remove;
        /**
         * Bounds of the zone
         */
        this.bounds = new math_1.GameBounds3(new math_1.GameVector3(0, 0, 0), new math_1.GameVector3(0, 0, 0));
        /**
         * Selector filter
         */
        this.selector = '*';
        /**
         * Controls how much the object's mass applies to the force
         * 0 = behaves like gravity
         * 1 = behaves like wind
         */
        this.massScale = 0;
        /**
         * The amount of force to apply to the object
         */
        this.force = new math_1.GameVector3(0, 0, 0);
        this.fogEnabled = false;
        this.fogColor = new math_1.GameRGBColor(1, 1, 1);
        this.fogStartDistance = 0;
        this.fogHeightOffset = -8;
        this.fogHeightFalloff = 0.8;
        this.fogDensity = 0;
        this.fogMax = 1;
        this.snowEnabled = false;
        this.snowDensity = 1;
        this.snowSizeLo = 0.1;
        this.snowSizeHi = 1;
        this.snowFallSpeed = 1;
        this.snowSpinSpeed = 0;
        this.snowColor = new math_1.GameRGBAColor(1, 1, 1, 1);
        this.snowTexture = 'snow/snow2.part';
        this.rainEnabled = false;
        this.rainDensity = 1;
        this.rainDirection = new math_1.GameVector3(0, 1, 0);
        this.rainSpeed = 1;
        this.rainSizeLo = 0.5;
        this.rainSizeHi = 0.5;
        this.rainInterference = 0;
        this.rainColor = new math_1.GameRGBAColor(1, 1, 1, 1);
        this.skyEnabled = false;
        this.skyMode = 'natural';
        this.skySunPhase = 4 / 24;
        this.skySunFrequency = 0;
        this.skyLunarPhase = 0;
        this.skySunDirection = new math_1.GameVector3(0, -1, 0);
        this.skySunLight = new math_1.GameRGBColor(1000, 1000, 1000);
        this.skyLeftLight = new math_1.GameRGBColor(0, 0, 0);
        this.skyRightLight = new math_1.GameRGBColor(0, 0, 0);
        this.skyBottomLight = new math_1.GameRGBColor(0, 0, 0);
        this.skyTopLight = new math_1.GameRGBColor(0, 0, 0);
        this.skyFrontLight = new math_1.GameRGBColor(0, 0, 0);
        this.skyBackLight = new math_1.GameRGBColor(0, 0, 0);
    }
}
exports.GameZone = GameZone;
var GameAnimationPlaybackState;
(function (GameAnimationPlaybackState) {
    GameAnimationPlaybackState["PENDING"] = "pending";
    GameAnimationPlaybackState["RUNNING"] = "running";
    GameAnimationPlaybackState["FINISHED"] = "finished";
})(GameAnimationPlaybackState || (exports.GameAnimationPlaybackState = GameAnimationPlaybackState = {}));
var GameAnimationDirection;
(function (GameAnimationDirection) {
    GameAnimationDirection["NORMAL"] = "normal";
    GameAnimationDirection["REVERSE"] = "reverse";
    GameAnimationDirection["WRAP"] = "wrap";
    GameAnimationDirection["WRAP_REVERSE"] = "wrap-reverse";
    GameAnimationDirection["ALTERNATE"] = "alternate";
    GameAnimationDirection["ALTERNATE_REVERSE"] = "alternate-reverse";
})(GameAnimationDirection || (exports.GameAnimationDirection = GameAnimationDirection = {}));
var GameEasing;
(function (GameEasing) {
    GameEasing["NONE"] = "none";
    GameEasing["LINEAR"] = "linear";
    GameEasing["QUADRATIC"] = "quadratic";
    GameEasing["SINE"] = "sine";
    GameEasing["EXP"] = "exp";
    GameEasing["BACK"] = "back";
    GameEasing["ELASTIC"] = "elastic";
    GameEasing["BOUNCE"] = "bounce";
    GameEasing["CIRCLE"] = "circle";
})(GameEasing || (exports.GameEasing = GameEasing = {}));
class GameAnimation {
    /**
     * @ignore
     */
    constructor(
    /**
     * Animation target object (could be world, player or entity)
     */
    target, 
    /**
     * Returns all animation keyframes
     */
    keyframes, currentTime, startTime, playState, playbackRate, 
    /**
     * Starts or restarts playback for the animation.
     */
    play, 
    /**
     * Cancels current animation playback
     */
    cancel, 
    /**
     * Fires when animation begins
     */
    onReady, nextReady, 
    /**
     * Fires when animation completes successfully
     */
    onFinish, nextFinish) {
        this.target = target;
        this.keyframes = keyframes;
        this.play = play;
        this.cancel = cancel;
        this.onReady = onReady;
        this.nextReady = nextReady;
        this.onFinish = onFinish;
        this.nextFinish = nextFinish;
        /**
         * Current playback time for animation (in animation frames)
         */
        this.currentTime = 0;
        /**
         * Start tick for animation
         */
        this.startTime = 0;
        /**
         * Current playback state for animation
         */
        this.playState = GameAnimationPlaybackState.PENDING;
        /**
         * Playback rate in frames per tick
         */
        this.playbackRate = 1;
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
    then(resolve, reject) {
        return this.nextFinish().then(resolve, reject);
    }
}
exports.GameAnimation = GameAnimation;
class Sound {
    constructor(resume, setCurrentTime, pause, stop) {
        this.resume = resume;
        this.setCurrentTime = setCurrentTime;
        this.pause = pause;
        this.stop = stop;
    }
}
exports.Sound = Sound;
/**
 * {@link Game.GameWorld} is the main entry point to the engine API.  Using this object you can control
 * global scene properties like the weather, timeOfDay, etc. and perform searches on the set of all {@link Game.GameEntity}
 * which exist in the world.
 */
class GameWorld {
    /**
     * @ignore
     */
    constructor(
    /**
     * Public URL of the currently running world
     */
    url, 
    /**
     * Returns the remaining number of entities the script is allowed to create
     * @category entities
     */
    entityQuota, 
    /**
     * @category health
     */
    onRespawn, nextRespawn, 
    /**
     * Creates a new {@link Game.GameEntity} or makes a copy of an existing entity.
     * If entity quota is exceeded, then returns null.
     * @param config A set of initial values for the entity or a new entity which we want to copy
     * @returns A newly created entity with the given parameters
     * @category entity
     */
    createEntity, 
    /**
     * The entities in game can be searched using a jQuery selector-like syntax.
     * For more examples see {@link Game.GameSelectorString}
     *
     * @param selector a selector search pattern
     * @returns the first entity which matches the selector/
     * @category entity
     */
    querySelector, 
    /**
     * The entities in game can be searched using a jQuery selector-like syntax
     * For more examples see {@link Game.GameSelectorString}
     *
     * @param selector a selector search pattern
     * @returns All entities which match the selector
     * @category entity
     */
    querySelectorAll, 
    /**
     * Test a selector on an entity
     *
     * @param selector the selector pattern to test
     * @param entity The entity to test
     * @category entity
     */
    testSelector, 
    /**
     * Disables collisions between the set of all entities matching aSelector and bSelector
     *
     * @param aSelector the selector for the first set of entities
     * @param bSelector the selector for the second set of entities
     * @category physics
     */
    addCollisionFilter, 
    /**
     * Removes collision filter between aSelector and bSelector
     *
     * @param aSelector the selector for the first set of entities
     * @param bSelector the selector for the second set of entities
     * @category physics
     */
    removeCollisionFilter, 
    /**
     * Clears all collision filters
     *
     * @category physics
     */
    clearCollisionFilters, 
    /**
     * Returns a list of all currently active collision filters
     *
     * @returns All currently active collision filters
     * @category physics
     */
    collisionFilters, 
    /**
     * Shoots a ray through the world from `origin` in `direction`
     * @param origin the start point of the ray
     * @param direction the direction of the ray
     * @param options An option configuration parameter
     * @returns Information about the resulting raycast
     * @category search
     */
    raycast, 
    /**
     * Search for all entities contained in a bounding box
     * @param bounds the bounding box to search
     * @returns All entities contained in ``bounds``
     */
    searchBox, 
    /**
     * Plays an animation on the world object
     */
    animate, getAnimations, getEntityAnimations, getPlayerAnimations, 
    /**
     * An event handler called each tick
     * @category tick
     */
    onTick, nextTick, 
    /**
     * Called when an entity takes damage
     * @category health
     */
    onTakeDamage, nextTakeDamage, 
    /**
     * Called when an entity dies
     * @category health
     */
    onDie, nextDie, 
    /**
     * Called whenever a player joins the game
     * @category player
     */
    onPlayerJoin, nextPlayerJoin, 
    /**
     * Called whenever a player leaves the game
     * @category player
     */
    onPlayerLeave, nextPlayerLeave, 
    /**
     * Called whenever an entity is created
     * @category entity
     */
    onEntityCreate, nextEntityCreate, 
    /**
     * Called whenever an entity is destroyed
     * @category chat
     */
    onEntityDestroy, nextEntityDestroy, 
    /**
     * Broadcast a global message to all players
     * @param message is some text we want to broadcast
     * @category player
     */
    say, 
    /**
     * Called whenever a player says something
     * @category player
     */
    onChat, nextChat, 
    /**
     * Called whenever a player clicks on an object
     * @category player
     */
    onClick, nextClick, 
    /**
     * Called whenever a player pushes a button
     * @category player
     */
    onPress, nextPress, 
    /**
     * Called whenever a player releases a button
     * @category player
     */
    onRelease, nextRelease, 
    /**
     * Called whenever two entities collide
     * @category entity
     */
    onEntityContact, nextEntityContact, 
    /**
     * Called whenever two entities stop colliding
     * @category entity
     */
    onEntitySeparate, nextEntitySeparate, 
    /**
     * Called whenever an entity touches a voxel
     * @category entity
     */
    onVoxelContact, nextVoxelContact, 
    /**
     * Called whenever an entity stops touching a voxel
     * @category entity
     */
    onVoxelSeparate, nextVoxelSeparate, 
    /**
     * Called when an entity enters a fluid
     * @category entity
     */
    onFluidEnter, nextFluidEnter, 
    /**
     * Called when an entity leaves a fluid
     * @category entity
     */
    onFluidLeave, nextFluidLeave, 
    /**
     * Zones
     * @category zone
     */
    zones, addZone, removeZone, 
    /**
     * @category interactive
     */
    onInteract, nextInteract, 
    /**
     * Plays a sound at a given location
     */
    sound, 
    /**
     * 地图组内传送能力。mapId 必须是目标地图不可变的 20 位永久地图 ID，不能使用
     * 可修改的访问 ID、地图名称或本地工程 ID。默认创建仅被传送玩家可见的独立房间；传入返回的
     * serverId 可让其他玩家加入同一房间，传入 public 则进入公共实例。
     */
    teleport, 
    /**
     * 当前运行实例的稳定 ID。普通实例使用 20 位永久地图 ID，传送创建的
     * 独立房间使用房间 ID；修改地图访问 ID 不会改变此值。
     */
    serverId) {
        this.url = url;
        this.entityQuota = entityQuota;
        this.onRespawn = onRespawn;
        this.nextRespawn = nextRespawn;
        this.createEntity = createEntity;
        this.querySelector = querySelector;
        this.querySelectorAll = querySelectorAll;
        this.testSelector = testSelector;
        this.addCollisionFilter = addCollisionFilter;
        this.removeCollisionFilter = removeCollisionFilter;
        this.clearCollisionFilters = clearCollisionFilters;
        this.collisionFilters = collisionFilters;
        this.raycast = raycast;
        this.searchBox = searchBox;
        this.animate = animate;
        this.getAnimations = getAnimations;
        this.getEntityAnimations = getEntityAnimations;
        this.getPlayerAnimations = getPlayerAnimations;
        this.onTick = onTick;
        this.nextTick = nextTick;
        this.onTakeDamage = onTakeDamage;
        this.nextTakeDamage = nextTakeDamage;
        this.onDie = onDie;
        this.nextDie = nextDie;
        this.onPlayerJoin = onPlayerJoin;
        this.nextPlayerJoin = nextPlayerJoin;
        this.onPlayerLeave = onPlayerLeave;
        this.nextPlayerLeave = nextPlayerLeave;
        this.onEntityCreate = onEntityCreate;
        this.nextEntityCreate = nextEntityCreate;
        this.onEntityDestroy = onEntityDestroy;
        this.nextEntityDestroy = nextEntityDestroy;
        this.say = say;
        this.onChat = onChat;
        this.nextChat = nextChat;
        this.onClick = onClick;
        this.nextClick = nextClick;
        this.onPress = onPress;
        this.nextPress = nextPress;
        this.onRelease = onRelease;
        this.nextRelease = nextRelease;
        this.onEntityContact = onEntityContact;
        this.nextEntityContact = nextEntityContact;
        this.onEntitySeparate = onEntitySeparate;
        this.nextEntitySeparate = nextEntitySeparate;
        this.onVoxelContact = onVoxelContact;
        this.nextVoxelContact = nextVoxelContact;
        this.onVoxelSeparate = onVoxelSeparate;
        this.nextVoxelSeparate = nextVoxelSeparate;
        this.onFluidEnter = onFluidEnter;
        this.nextFluidEnter = nextFluidEnter;
        this.onFluidLeave = onFluidLeave;
        this.nextFluidLeave = nextFluidLeave;
        this.zones = zones;
        this.addZone = addZone;
        this.removeZone = removeZone;
        this.onInteract = onInteract;
        this.nextInteract = nextInteract;
        this.sound = sound;
        this.teleport = teleport;
        this.serverId = serverId;
        /**
         * The name of the project (read only)
         */
        this.projectName = 'Project';
        this.currentTick = 0;
        /**
         * Type of lighting to use for the sky and ambient light
         */
        this.lightMode = 'natural';
        /**
         * Global scene-light intensity. This feeds the renderer's shared lighting
         * uniform, so it is safe to animate from a map script without recompiling a
         * shader. Values are clamped to the supported range of 0 through 0.6.
         * @category rendering
         */
        this.globalLight = 0.3;
        /**
         * The initial phase of the sun's motion through the sky.  The time of day is calculated using the formula:
         * `timeOfDay = (sunPhase + sunFrequency * tick) % 1`
         * @category weather
         */
        this.sunPhase = 0;
        /**
         * The frequency at which the sun moves through the sky.  Higher values = faster sun movement.
         * @category weather
         */
        this.sunFrequency = 0;
        /**
         * The phase of the moon.  Must be between 0 and 1
         * @category weather
         */
        this.lunarPhase = 0;
        /**
         * Direction of sun (only used if ambientLightMode === 'manual)
         * @category weather
         */
        this.sunDirection = new math_1.GameVector3(0, -1, 0);
        /**
         * Light level of the sun (only used if ambientLightMode === 'manual')
         * @category weather
         */
        this.sunLight = new math_1.GameRGBColor(1000, 1000, 1000);
        /**
         * -x direction ambient light value (only used if ambientLightMode === 'manual')
         * @category weather
         */
        this.skyLeftLight = new math_1.GameRGBColor(0, 0, 0);
        /**
         * +x direction ambient light value (only used if ambientLightMode === 'manual')
         * @category weather
         */
        this.skyRightLight = new math_1.GameRGBColor(0, 0, 0);
        /**
         * -y direction ambient light value (only used if ambientLightMode === 'manual')
         * @category weather
         */
        this.skyBottomLight = new math_1.GameRGBColor(0, 0, 0);
        /**
         * +y direction ambient light value (only used if ambientLightMode === 'manual')
         * @category weather
         */
        this.skyTopLight = new math_1.GameRGBColor(0, 0, 0);
        /**
         * -z direction ambient light value (only used if ambientLightMode === 'manual')
         * @category weather
         */
        this.skyFrontLight = new math_1.GameRGBColor(0, 0, 0);
        /**
         * +z direction ambient light value (only used if ambientLightMode === 'manual')
         * @category weather
         */
        this.skyBackLight = new math_1.GameRGBColor(0, 0, 0);
        /**
         * Display gamma used by the final render pass. This is a renderer parameter,
         * not shader source: setting it changes the image immediately and does not
         * create a material or shader-program variant. Values are clamped to 0.1
         * through 3.
         * @category rendering
         */
        this.gamma = 1.3;
        /**
         * Fog color
         * @category weather
         */
        this.fogColor = new math_1.GameRGBColor(1, 1, 1);
        /**
         * Distance when fog starts
         * @category weather
         */
        this.fogStartDistance = 0;
        /**
         * Height that fog starts at
         * @category weather
         */
        this.fogHeightOffset = 0;
        /**
         * Rate that height fog decays
         * @category weather
         */
        this.fogHeightFalloff = 0.8;
        /**
         * Amount of uniform fog (if > 0, cannot see skybox)
         * @category weather
         */
        this.fogUniformDensity = 0;
        /**
         * Maximum amount of fog
         * @category weather
         */
        this.maxFog = 1;
        /**
         * @category weather
         */
        this.snowDensity = 0;
        /**
         * @category weather
         */
        this.snowSizeLo = 0;
        /**
         * @category weather
         */
        this.snowSizeHi = 1;
        /**
         * @category weather
         */
        this.snowFallSpeed = 1;
        /**
         * @category weather
         */
        this.snowSpinSpeed = 0;
        /**
         * @category weather
         */
        this.snowColor = new math_1.GameRGBAColor(1, 1, 1, 1);
        /**
         * @category weather
         */
        this.snowTexture = '';
        /**
         * @category weather
         */
        this.rainDensity = 0;
        /**
         * @category weather
         */
        this.rainDirection = new math_1.GameVector3(0, 1, 0);
        /**
         * @category weather
         */
        this.rainSpeed = 1;
        /**
         * @category weather
         */
        this.rainSizeLo = 0;
        /**
         * @category weather
         */
        this.rainSizeHi = 1;
        /**
         * @category weather
         */
        this.rainInterference = 0;
        /**
         * @category weather
         */
        this.rainColor = new math_1.GameRGBAColor(1, 1, 1, 1);
        /**
         * Amount and direction of gravitational field
         * @category physics
         */
        this.gravity = -0.1;
        /**
         * Amount of air friction
         * @category physics
         */
        this.airFriction = 0.001;
        /**
         * Use obb rigid body to solve physics
         * @category physics
         */
        this.useOBB = false;
        /**
         * Plays when a voxel breaks
         * @category sound
         */
        this.breakVoxelSound = new GameSoundEffect();
        /**
         * Plays when a voxel is placed
         * @category sound
         */
        this.placeVoxelSound = new GameSoundEffect();
        /**
         * Plays when a player joins
         * @category sound
         */
        this.playerJoinSound = new GameSoundEffect();
        /**
         * Plays when a player leaves
         * @category sound
         */
        this.playerLeaveSound = new GameSoundEffect();
        /**
         * Ambient sound, plays in background globally
         * @category sound
         */
        this.ambientSound = new GameSoundEffect();
    }
}
exports.GameWorld = GameWorld;
/**
 * {@link Game.GameVoxels} gives an interface for all the voxels in Game.  You can use it to control the terrain
 */
class GameVoxels {
    /**
     * @ignore
     */
    constructor(
    /**
     * Size of the voxel grid along the x/y/z dimensions
     */
    shape, 
    /**
     * An array of all supported voxel types
     * @category names
     */
    VoxelTypes, 
    /**
     * @param name the human readable name for the voxel
     * @returns the voxel id number
     * @category names
     */
    id, 
    /**
     * @param id the numerical id of a voxel
     * @returns the human readable voxel name
     * @category names
     */
    name, 
    /**
     * Sets a voxel in the grid
     * @param voxel The name of the voxel or its voxel id
     * @param rotation The rotation code of the voxel
     * @returns the id of the updated voxel
     */
    setVoxel, 
    /**
     * Get the type of a voxel at some point
     * @returns the voxel type code at point x/y/z
     */
    getVoxel, 
    /**
     * Get the rotation of a voxel at point x/y/z
     * @returns the voxel rotation code
     */
    getVoxelRotation, 
    /**
     * Sets a voxel in the grid directly using its id code
     * @category advanced
     */
    setVoxelId, 
    /**
     * Retrieves the voxel id in the grid
     * @category advanced
     */
    getVoxelId) {
        this.shape = shape;
        this.VoxelTypes = VoxelTypes;
        this.id = id;
        this.name = name;
        this.setVoxel = setVoxel;
        this.getVoxel = getVoxel;
        this.getVoxelRotation = getVoxelRotation;
        this.setVoxelId = setVoxelId;
        this.getVoxelId = getVoxelId;
    }
}
exports.GameVoxels = GameVoxels;
/**
 * Entities are game objects in Game.  They can be used to encode things like players, objects, etc.
 */
class GameEntity {
    /**
     * @ignore
     */
    constructor(
    /**
     * Set of all tags assigned to the entity in the editor
     * @category selectors
     */
    tags, 
    /**
     * Adds a new tag to the entity
     * @category selectors
     */
    addTag, 
    /**
     * Removes a tag from the entity
     * @category selectors
     */
    removeTag, 
    /**
     * Tests if an entity has a tag
     * @category selectors
     */
    hasTag, 
    /**
     * Destroys the entity
     * @category destroy
     */
    destroy, 
    /**
     * Called when the entity is destroyed
     * @category destroy
     */
    onDestroy, nextDestroy, 
    /**
     * Called when entity takes damage
     * @category health
     */
    onTakeDamage, nextTakeDamage, 
    /**
     * Called when an entity dies
     * @category health
     */
    onDie, nextDie, 
    /**
     * Deals damage to an entity
     * @category health
     */
    hurt, 
    /**
     * Makes the entity talk
     * @category chat
     * @param options.duration - The duration in milliseconds. A positive number represents the time in milliseconds,
     *                           while a negative number means the bubble will be permanent.
     * @param options.hideFloat - whether the float is displayed.
     */
    say, 
    /**
     * Plays an animation on an entity
     */
    animate, getAnimations, 
    /**
     * Called whenever a player clicks on this entity
     */
    onClick, nextClick, 
    /**
     * Called when the entity touches another entity
     * @category physics
     */
    onEntityContact, nextEntityContact, 
    /**
     * Called when the entity stops touching another entity
     * @category physics
     */
    onEntitySeparate, nextEntitySeparate, 
    /**
     * Called when the entity touches a voxel
     * @category physics
     */
    onVoxelContact, nextVoxelContact, 
    /**
     * Called when the entity stops touching a voxel
     * @category physics
     */
    onVoxelSeparate, nextVoxelSeparate, 
    /**
     * Called when the entity enters a fluid
     * @category physics
     */
    onFluidEnter, nextFluidEnter, 
    /**
     * Called when the entity leaves a fluid
     * @category physics
     */
    onFluidLeave, nextFluidLeave, 
    /**
     * Called when an entity interact with another entity
     * @category interactive
     */
    onInteract, nextInteract, 
    /**
     * Play a sound effect at the location of this entity
     * @category sound
     */
    sound, 
    /**
     * motion controller
     * @category motion
     */
    motion, lookAt, 
    /**
     * 围绕模型自身坐标系下的某个点进行旋转
     * @category mesh
     */
    rotateLocal, 
    /**
     * 参照模型自身坐标系下的某个点进行缩放
     * @category mesh
     */
    scaleLocal) {
        this.tags = tags;
        this.addTag = addTag;
        this.removeTag = removeTag;
        this.hasTag = hasTag;
        this.destroy = destroy;
        this.onDestroy = onDestroy;
        this.nextDestroy = nextDestroy;
        this.onTakeDamage = onTakeDamage;
        this.nextTakeDamage = nextTakeDamage;
        this.onDie = onDie;
        this.nextDie = nextDie;
        this.hurt = hurt;
        this.say = say;
        this.animate = animate;
        this.getAnimations = getAnimations;
        this.onClick = onClick;
        this.nextClick = nextClick;
        this.onEntityContact = onEntityContact;
        this.nextEntityContact = nextEntityContact;
        this.onEntitySeparate = onEntitySeparate;
        this.nextEntitySeparate = nextEntitySeparate;
        this.onVoxelContact = onVoxelContact;
        this.nextVoxelContact = nextVoxelContact;
        this.onVoxelSeparate = onVoxelSeparate;
        this.nextVoxelSeparate = nextVoxelSeparate;
        this.onFluidEnter = onFluidEnter;
        this.nextFluidEnter = nextFluidEnter;
        this.onFluidLeave = onFluidLeave;
        this.nextFluidLeave = nextFluidLeave;
        this.onInteract = onInteract;
        this.nextInteract = nextInteract;
        this.sound = sound;
        this.motion = motion;
        this.lookAt = lookAt;
        this.rotateLocal = rotateLocal;
        this.scaleLocal = scaleLocal;
        /**
         * Name of entity seed in the editor
         * @category selectors
         */
        this.id = '';
        /**
         * If true, entity is destroyed.
         * @category destroy
         */
        this.destroyed = false;
        /**
         * @category physics
         */
        this.position = new math_1.GameVector3(0, 0, 0);
        /**
         * @category physics
         */
        this.velocity = new math_1.GameVector3(0, 0, 0);
        /**
         * Radius of the entity's bounding box along x/y/z
         * @category physics
         */
        this.bounds = new math_1.GameVector3(1, 1, 1);
        /**
         * Mass of entity
         * @category physics
         */
        this.mass = 1;
        /**
         * Controls object stickiness (0 = slippery, 1 = sticky)
         * @category physics
         */
        this.friction = 0;
        /**
         * Controls bouncy (0 = soft, 1 = bouncy)
         * @category physics
         */
        this.restitution = 0;
        /**
         * If false, object does not collide
         * @category physics
         */
        this.collides = true;
        /**
         * If false, object does not fall
         * @category physics
         */
        this.gravity = true;
        /**
         * If true, object does not move
         * @category physics
         */
        this.fixed = false;
        /**
         * Net contact force applied to this object
         * @category physics
         */
        this.contactForce = new math_1.GameVector3(0, 0, 0);
        /**
         * Returns a list of all active body contacts
         * @category physics
         */
        this.entityContacts = [];
        /**
         * Returns a list of all active voxel contacts
         * @category physics
         */
        this.voxelContacts = [];
        /**
         * Returns a list of all active fluid contacts
         * @category physics
         */
        this.fluidContacts = [];
        /**
         * Hash of entity mesh.  If set to empty string/'' then entity does not have a mesh.
         * Unless object is a player, if mesh is set then mesh is used to compute object bounds
         * @category mesh
         */
        this.mesh = '';
        /**
         * Makes the mesh invisible
         * @category mesh
         */
        this.meshInvisible = false;
        /**
         * @category mesh
         */
        this.meshScale = new math_1.GameVector3(1 / 64, 1 / 64, 1 / 64);
        /**
         * @category mesh
         */
        this.meshOrientation = new math_1.GameQuaternion(0, 0, 0, 1);
        /**
         * @category mesh
         */
        this.meshOffset = new math_1.GameVector3(0, 0, 0);
        /**
         * @category mesh
         */
        this.meshColor = new math_1.GameRGBAColor(1, 1, 1, 1);
        /**
         * @category mesh
         */
        this.meshMetalness = 0;
        /**
         * @category mesh
         */
        this.meshEmissive = 0;
        /**
         * @category mesh
         */
        this.meshShininess = 0;
        /**
         * 几何中心与锚点的偏移量
         * @category mesh
         */
        this.anchorOffset = new math_1.GameVector3(0, 0, 0);
        /**
         * @category health
         */
        this.enableDamage = false;
        /**
         * @category health
         */
        this.showHealthBar = true;
        /**
         * @category health
         */
        this.hp = 100;
        /**
         * @category health
         */
        this.maxHp = 100;
        /**
         * If true, then the entity is a player
         * @category player
         */
        this.isPlayer = false;
        /**
         * Particle emission in rate in particles / second
         * @category particle
         */
        this.particleRate = 0;
        /**
         * Variability in particle emission.
         * @category particle
         */
        this.particleRateSpread = 0;
        /**
         * Maxmimum number of particles this entity can emit
         * @category particle
         */
        this.particleLimit = 100;
        /**
         * Particle color spline.  Maximum 5 entries, particles interpolate colors along these 5 points over their lifetime.
         * Colors are emissive values and can be any number between 0 and 256
         * @category particle
         */
        this.particleColor = [
            new math_1.GameRGBColor(1, 1, 1),
            new math_1.GameRGBColor(1, 1, 1),
            new math_1.GameRGBColor(1, 1, 1),
            new math_1.GameRGBColor(1, 1, 1),
            new math_1.GameRGBColor(1, 1, 1),
        ];
        /**
         * Particle size spline.  Maximum 5 entries, particles interpolate size along these 5 points over their lifetime.
         * @category particle
         */
        this.particleSize = [1, 1, 1, 1, 1];
        /**
         * Particle size distribution
         * @category particle
         */
        this.particleSizeSpread = 0;
        /**
         * Controls how long each particle lives in seconds
         * @category particle
         */
        this.particleLifetime = 10;
        /**
         * Variation in particle lifetime in seconds
         * @category particle
         */
        this.particleLifetimeSpread = 0;
        /**
         * Particle velocity bias.  Units are voxels/tick
         * @category particle
         */
        this.particleVelocity = new math_1.GameVector3(0, 0, 0);
        /**
         * Particle velocity randomization range.  Units are voxels/tick
         * @category particle
         */
        this.particleVelocitySpread = new math_1.GameVector3(0, 0, 0);
        /**
         * Particle damping exponent.
         * 0 = no damping
         * positive values slow particles
         * negative values accelerate particles
         * @category particle
         */
        this.particleDamping = 0;
        /**
         * Particle acceleration/gravity force vector
         * Units are voxels/(tick^2)
         * @category particle
         */
        this.particleAcceleration = new math_1.GameVector3(0, 0, 0);
        /**
         * Particle noise amplitude.  Affects particle movement
         * @category particle
         */
        this.particleNoise = 0;
        /**
         * Particle noise frequency.  Increase rate of movement from noise bias
         * @category particle
         */
        this.particleNoiseFrequency = 1;
        /**
         * Particle target entity
         * @category particle
         */
        this.particleTarget = null;
        /**
         * Particle target weight
         * @category particle
         */
        this.particleTargetWeight = 1;
        /**
         * Enables interaction
         * @category interact
         */
        this.enableInteract = false;
        /**
         * Color of the interact hint text
         * @category interact
         */
        this.interactColor = new math_1.GameRGBColor(0, 1, 0);
        /**
         * Hint text of interactive entity
         * @category interact
         */
        this.interactHint = '';
        /**
         * Radius around entity for interactivity
         * @category interact
         */
        this.interactRadius = 16;
        /**
         * Show name of entity
         * @category entityName
         */
        this.showEntityName = false;
        /**
         * Name of entity
         * @category entityName
         */
        this.customName = '';
        /**
         * Radius around entity for show entity name
         * @category entityName
         */
        this.nameRadius = 16;
        /**
         * Radius around entity for show entity name
         * @category entityName
         */
        this.nameColor = new math_1.GameRGBColor(1, 1, 1);
        /**
         * Plays when an entity chat
         * @category sound
         */
        this.chatSound = new GameSoundEffect();
        /**
         * Plays when entity takes damage
         * @category sound
         */
        this.hurtSound = new GameSoundEffect();
        /**
         * Plays when entity dies
         * @category sound
         */
        this.dieSound = new GameSoundEffect();
        /**
         * Plays when entity is interacted with
         * @category sound
         */
        this.interactSound = new GameSoundEffect();
    }
}
exports.GameEntity = GameEntity;
class GameMotionController {
    /**
     * @ignore
     */
    constructor(
    /**
     * Create motion handler by name (could be motion list)
     */
    loadByName, 
    /**
     * Pause motion
     */
    pause, 
    /**
     * Resume motion
     */
    resume, 
    /**
     * Set default motion by name
     */
    setDefaultMotionByName) {
        this.loadByName = loadByName;
        this.pause = pause;
        this.resume = resume;
        this.setDefaultMotionByName = setDefaultMotionByName;
    }
}
exports.GameMotionController = GameMotionController;
class GameMotionHandler {
    /**
     * @ignore
     */
    constructor(
    /**
     * Motion target object (entity)
     */
    target, 
    /**
     * Starts playback for the motion.
     */
    play, 
    /**
     * Cancels current motion playback
     */
    cancel, 
    /**
     * Fires when motion completes successfully
     */
    onFinish, nextFinish) {
        this.target = target;
        this.play = play;
        this.cancel = cancel;
        this.onFinish = onFinish;
        this.nextFinish = nextFinish;
    }
}
exports.GameMotionHandler = GameMotionHandler;
class GameMotionEvent {
    /**
     * @ignore
     */
    constructor(
    /**
     * Tick that click event occurred
     */
    tick, target, motionHandler, cancelled) {
        this.tick = tick;
        this.target = target;
        this.motionHandler = motionHandler;
        this.cancelled = cancelled;
    }
}
exports.GameMotionEvent = GameMotionEvent;
/**
 * An active entity pair contact
 */
class GameEntityContact {
    constructor(other, force, axis) {
        this.other = other;
        this.force = force;
        this.axis = axis;
    }
}
exports.GameEntityContact = GameEntityContact;
/**
 * An active voxel contact state
 */
class GameVoxelContact {
    constructor(x, y, z, voxel, force, axis) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.voxel = voxel;
        this.force = force;
        this.axis = axis;
    }
}
exports.GameVoxelContact = GameVoxelContact;
/**
 * An active fluid contact
 */
class GameFluidContact {
    constructor(voxel, volume) {
        this.voxel = voxel;
        this.volume = volume;
    }
}
exports.GameFluidContact = GameFluidContact;
/**
 * Player movement state
 */
var GamePlayerMoveState;
(function (GamePlayerMoveState) {
    GamePlayerMoveState["FLYING"] = "fly";
    GamePlayerMoveState["GROUND"] = "ground";
    GamePlayerMoveState["SWIM"] = "swim";
    GamePlayerMoveState["FALL"] = "fall";
    GamePlayerMoveState["JUMP"] = "jump";
    GamePlayerMoveState["DOUBLE_JUMP"] = "jump2";
})(GamePlayerMoveState || (exports.GamePlayerMoveState = GamePlayerMoveState = {}));
/**
 * Player walking state
 */
var GamePlayerWalkState;
(function (GamePlayerWalkState) {
    GamePlayerWalkState["NONE"] = "";
    GamePlayerWalkState["CROUCH"] = "crouch";
    GamePlayerWalkState["WALK"] = "walk";
    GamePlayerWalkState["RUN"] = "run";
})(GamePlayerWalkState || (exports.GamePlayerWalkState = GamePlayerWalkState = {}));
var GameBodyPart;
(function (GameBodyPart) {
    GameBodyPart["HIPS"] = "hips";
    GameBodyPart["TORSO"] = "torso";
    GameBodyPart["NECK"] = "neck";
    GameBodyPart["HEAD"] = "head";
    GameBodyPart["LEFT_SHOULDER"] = "leftShoulder";
    GameBodyPart["LEFT_UPPER_ARM"] = "leftUpperArm";
    GameBodyPart["LEFT_LOWER_ARM"] = "leftLowerArm";
    GameBodyPart["LEFT_HAND"] = "leftHand";
    GameBodyPart["LEFT_UPPER_LEG"] = "leftUpperLeg";
    GameBodyPart["LEFT_LOWER_LEG"] = "leftLowerLeg";
    GameBodyPart["LEFT_FOOT"] = "leftFoot";
    GameBodyPart["RIGHT_SHOULDER"] = "rightShoulder";
    GameBodyPart["RIGHT_UPPER_ARM"] = "rightUpperArm";
    GameBodyPart["RIGHT_LOWER_ARM"] = "rightLowerArm";
    GameBodyPart["RIGHT_HAND"] = "rightHand";
    GameBodyPart["RIGHT_UPPER_LEG"] = "rightUpperLeg";
    GameBodyPart["RIGHT_LOWER_LEG"] = "rightLowerLeg";
    GameBodyPart["RIGHT_FOOT"] = "rightFoot";
})(GameBodyPart || (exports.GameBodyPart = GameBodyPart = {}));
class GameWearable {
    constructor() {
        /**
         * The player this wearable is attached to
         */
        this.player = null;
        /**
         * Which body part this wearable is attached to
         */
        this.bodyPart = GameBodyPart.HEAD;
        /**
         * The mesh of this wearable
         */
        this.mesh = '';
        /**
         * Optional color tint of the wearable
         */
        this.color = new math_1.GameRGBColor(1, 1, 1);
        /**
         * Emissive modifier for wearable
         */
        this.emissive = 0;
        /**
         * Metalness modifier for wearable
         */
        this.metalness = 0;
        /**
         * Shininess modifier for wearable
         */
        this.shininess = 0;
        /**
         * Orientation of wearable
         */
        this.orientation = new math_1.GameQuaternion(0, 1, 0, 0);
        /**
         * Scale of wearable along x/y/z
         */
        this.scale = new math_1.GameVector3(1, 1, 1);
        /**
         * Offset of wearable
         */
        this.offset = new math_1.GameVector3(0, 0, 0);
    }
    remove() {
        if (this.player) {
            this.player.removeWearable(this);
        }
    }
}
exports.GameWearable = GameWearable;
/**
 * Dialog stuff
 */
var GameDialogType;
(function (GameDialogType) {
    GameDialogType["TEXT"] = "text";
    GameDialogType["SELECT"] = "select";
    GameDialogType["INPUT"] = "input";
})(GameDialogType || (exports.GameDialogType = GameDialogType = {}));
var GameCameraMode;
(function (GameCameraMode) {
    GameCameraMode["FOLLOW"] = "follow";
    GameCameraMode["FPS"] = "fps";
    GameCameraMode["FIXED"] = "fixed";
    GameCameraMode["RELATIVE"] = "relative";
})(GameCameraMode || (exports.GameCameraMode = GameCameraMode = {}));
var GameCameraFreezedAxis;
(function (GameCameraFreezedAxis) {
    GameCameraFreezedAxis["NONE"] = "";
    GameCameraFreezedAxis["X"] = "x";
    GameCameraFreezedAxis["Y"] = "y";
    GameCameraFreezedAxis["Z"] = "z";
    GameCameraFreezedAxis["XY"] = "xy";
    GameCameraFreezedAxis["XZ"] = "xz";
    GameCameraFreezedAxis["YZ"] = "yz";
    GameCameraFreezedAxis["XYZ"] = "xyz";
})(GameCameraFreezedAxis || (exports.GameCameraFreezedAxis = GameCameraFreezedAxis = {}));
var GameInputDirection;
(function (GameInputDirection) {
    GameInputDirection["NONE"] = "none";
    GameInputDirection["VERTICAL"] = "vertical";
    GameInputDirection["HORIZONTAL"] = "horizontal";
    GameInputDirection["BOTH"] = "both";
})(GameInputDirection || (exports.GameInputDirection = GameInputDirection = {}));
/**
 * Players correspond to users which are connected to the game
 */
class GamePlayer {
    /**
     * @ignore
     */
    constructor(
    /**
     * Sends a private message directly to player
     * @category chat
     */
    directMessage, 
    /**
     * Called whenever player initiates a chat event
     * @category chat
     */
    onChat, nextChat, 
    /**
     * Called whenever player presses a button
     * @category input
     */
    onPress, nextPress, 
    /**
     * Called whenever a player releases a buttin
     * @category input
     */
    onRelease, nextRelease, 
    /**
     * @category health
     */
    onRespawn, nextRespawn, 
    /**
     * @category health
     */
    forceRespawn, 
    /**
     * Opens a dialog for this player
     * @category dialog
     */
    dialog, 
    /**
     * Cancels any open dialogs for this player
     * @category dialog
     */
    cancelDialogs, 
    /**
     * Opens a hyperlink on the client
     * @category web
     */
    link, 
    /**
     * List all wearable objects attached to the player
     * @param bodyPart is an optional filter to show only wearables attached to a specific body part
     * @category display
     */
    wearables, 
    /**
     * Attach a new wearable object to the player
     * @category display
     */
    addWearable, 
    /**
     * Remove a wearable object from a player
     * @param wearable is the wearable to remove
     * @category display
     */
    removeWearable, 
    /**
     * Set player skin by skin name
     * @category display
     */
    setSkinByName, 
    /**
     * Reset player to default skin
     * @category display
     */
    resetToDefaultSkin, 
    /**
     * Clear player custom skin and restore to avatar skin
     * @category display
     */
    clearSkin, 
    /**
     * Play sound for player
     * @category sound
     */
    sound, 
    /**
     * Play an animation
     */
    animate, getAnimations, 
    /**
     * Kick the user off the server
     */
    kick, 
    /**
     * Reset camera pitch
     */
    setCameraPitch, 
    /**
     * Reset camera pitch
     */
    setCameraYaw, 
    /**
     * post message to iframe parent
     * @category web
     */
    postMessage, 
    /**
     * add listener for message event of iframe parent
     * @category web
     */
    addEventListener, 
    /**
     * Called whenever player press down or up
     * @category input
     */
    onKeyDown, onKeyUp) {
        this.directMessage = directMessage;
        this.onChat = onChat;
        this.nextChat = nextChat;
        this.onPress = onPress;
        this.nextPress = nextPress;
        this.onRelease = onRelease;
        this.nextRelease = nextRelease;
        this.onRespawn = onRespawn;
        this.nextRespawn = nextRespawn;
        this.forceRespawn = forceRespawn;
        this.dialog = dialog;
        this.cancelDialogs = cancelDialogs;
        this.link = link;
        this.wearables = wearables;
        this.addWearable = addWearable;
        this.removeWearable = removeWearable;
        this.setSkinByName = setSkinByName;
        this.resetToDefaultSkin = resetToDefaultSkin;
        this.clearSkin = clearSkin;
        this.sound = sound;
        this.animate = animate;
        this.getAnimations = getAnimations;
        this.kick = kick;
        this.setCameraPitch = setCameraPitch;
        this.setCameraYaw = setCameraYaw;
        this.onKeyDown = onKeyDown;
        this.onKeyUp = onKeyUp;
        this.gamepad = {
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
        this.name = 'player';
        /**
         * user id for login player
         */
        this.userId = '';
        /**
         * Unique user key for this player.  Can be used to save their info into the database.
         */
        this.userKey = '';
        /**
         * User id of player if logged in.
         */
        this.boxId = '';
        /**
         * User avatar player if logged in.
         */
        this.avatar = '';
        /**
         * Player URL
         */
        this.url = null;
        /**
         * Initial spawn point of player
         * @category spawn
         */
        this.spawnPoint = new math_1.GameVector3(0, 0, 0);
        /**
         * Movement bounds
         * @category spawn
         */
        this.movementBounds = new math_1.GameBounds3(new math_1.GameVector3(-50, -50, -50), new math_1.GameVector3(178, 178, 178));
        /**
         * @category display
         */
        this.scale = 1;
        /**
         * @category dipsplay
         */
        this.color = new math_1.GameRGBColor(1, 1, 1);
        /**
         * @category display
         */
        this.metalness = 0;
        /**
         * @category display
         */
        this.emissive = 0;
        /**
         * @category display
         */
        this.shininess = 0;
        /**
         * @category display
         */
        this.invisible = false;
        /**
         * @category display
         */
        this.showName = true;
        /**
         * @category display
         */
        this.showIndicator = false;
        /**
         * @category health
         */
        this.dead = false;
        /**
         * Color grading look up table, applied to player to tint game state
         */
        this.colorLUT = '';
        /**
         * Camera behavior mode.
         *  + `"FPS"` - First person camera
         *  + `"FOLLOW"` - Third person follow camera (default)
         *  + `"FIXED"` - Third person fixed camera
         *  + `"RELATIVE"` - Third person camera relative to player position
         * @category camera
         */
        this.cameraMode = GameCameraMode.FOLLOW;
        /**
         * In FPS or FOLLOW mode, the entity which the player's camera follows
         * @category camera
         */
        this.cameraEntity = null;
        /**
         * Target point for the camera in FIXED mode
         * @category camera
         */
        this.cameraTarget = new math_1.GameVector3(0, 0, 0);
        /**
         * Up vector for camera in FIXED mode
         * @category camera
         */
        this.cameraUp = new math_1.GameVector3(0, 1, 0);
        /**
         * Eye position of camera in FIXED mode
         * @category camera
         */
        this.cameraPosition = new math_1.GameVector3(0, 0, 0);
        /**
         * Freeze camera axis in RELATIVE mode
         * @category camera
         */
        this.cameraFreezedAxis = GameCameraFreezedAxis.NONE;
        /**
         * Camera fov y
         * @category camera
         */
        this.cameraFovY = 0.25;
        /**
         * Camera distance
         * @category camera
         */
        this.cameraDistance = 8.5;
        /**
         * If true, player is allowed to fly
         * @category movement
         */
        this.canFly = false;
        /**
         * If true, player is a ghost and can pass through walls
         * @category movement
         */
        this.spectator = false;
        /**
         * Maximum walking speed
         * @category movement
         */
        this.walkSpeed = 0.22;
        /**
         * Walking acceleration
         * @category movement
         */
        this.walkAcceleration = 0.19;
        /**
         * Maximum running speed
         * @category movement
         */
        this.runSpeed = 0.4;
        /**
         * Running acceleration
         * @category movement
         */
        this.runAcceleration = 0.35;
        /**
         * Crouching walk speed
         * @category movement
         */
        this.crouchSpeed = 0.1;
        /**
         * Crouching walk acceleration
         * @category movement
         */
        this.crouchAcceleration = 0.09;
        /**
         * Maximum swim speed
         * @category movement
         */
        this.swimSpeed = 0.4;
        /**
         * Swim acceleration
         * @category movement
         */
        this.swimAcceleration = 0.1;
        /**
         * Maximum flying speed
         * @category movement
         */
        this.flySpeed = 2;
        /**
         * Flying acceleration
         * @category movement
         */
        this.flyAcceleration = 2;
        /**
         * Jump speed
         * @category movement
         */
        this.jumpSpeedFactor = 0.85;
        /**
         * Jump acceleration rate
         * @category movement
         */
        this.jumpAccelerationFactor = 0.55;
        /**
         * Jump velocity impulse
         * @category movement
         */
        this.jumpPower = 0.96;
        /**
         * Double jump velocity impulse
         * @category movement
         */
        this.doubleJumpPower = 0.9;
        /**
         * @category movement
         */
        this.freezedForwardDirection = null;
        /**
         * @category state
         */
        this.moveState = GamePlayerMoveState.FALL;
        /**
         * @category state
         */
        this.walkState = GamePlayerWalkState.NONE;
        /**
         * @category input
         */
        this.swapInputDirection = false;
        /**
         * @category input
         */
        this.reverseInputDirection = GameInputDirection.NONE;
        /**
         * @category input
         */
        this.disableInputDirection = GameInputDirection.NONE;
        /**
         * @category input
         */
        this.walkButton = false;
        /**
         * @category input
         */
        this.crouchButton = false;
        /**
         * @category input
         */
        this.jumpButton = false;
        /**
         * If true, player input button action 0 is enabled
         * @category input
         */
        this.enableAction0 = true;
        /**
         * If true, player input button action 1 is enabled
         * @category input
         */
        this.enableAction1 = true;
        /**
         * @category input
         */
        this.action0Button = false;
        /**
         * @category input
         */
        this.action1Button = false;
        /**
         * @category input
         */
        this.enableJump = true;
        /**
         * @category input
         */
        this.enableDoubleJump = true;
        /**
         * @category input
         */
        this.enableCrouch = true;
        /**
         * @category input
         */
        this.enable3DCursor = false;
        /**
         * @category input
         */
        this.facingDirection = new math_1.GameVector3(1, 0, 0);
        /**
         * @category input
         */
        this.cameraYaw = 0;
        /**
         * @category input
         */
        this.cameraPitch = 0;
        /**
         * Plays when player respawns
         * @category sound
         */
        this.spawnSound = new GameSoundEffect();
        /**
         * Plays when player jumps
         * @category sound
         */
        this.jumpSound = new GameSoundEffect();
        /**
         * Plays when player double jumps
         * @category sound
         */
        this.doubleJumpSound = new GameSoundEffect();
        /**
         * Plays when player lands
         * @category sound
         */
        this.landSound = new GameSoundEffect();
        /**
         * Plays when player crouches
         * @category sound
         */
        this.crouchSound = new GameSoundEffect();
        /**
         * Plays when player takes a step
         * @category sound
         */
        this.stepSound = new GameSoundEffect();
        /**
         * Plays when player takes a single swim stroke
         * @category sound
         */
        this.swimSound = new GameSoundEffect();
        /**
         * Plays when player presses action 0
         * @category sound
         */
        this.action0Sound = new GameSoundEffect();
        /**
         * Plays when player presses action 1
         * @category sound
         */
        this.action1Sound = new GameSoundEffect();
        /**
         * Plays when entity enters water
         * @category sound
         */
        this.enterWaterSound = new GameSoundEffect();
        /**
         * Plays when entity leaves water
         * @category sound
         */
        this.leaveWaterSound = new GameSoundEffect();
        /**
         * Sound for player start flying
         * @category sound
         */
        this.startFlySound = new GameSoundEffect();
        /**
         * Sound for player stop flying
         * @category sound
         */
        this.stopFlySound = new GameSoundEffect();
        /**
         * Background music for this player
         * @category sound
         */
        this.music = new GameSoundEffect();
        /**
         * Skin parts
         * @category display
         */
        this.skin = {
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
        this.skinInvisible = {
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
        this.navigator = new PlayerNavigator((type, value) => postMessage({ type, value, isOld: true }), (type, listener) => addEventListener(type, listener), (type, value) => postMessage({ type, value, isOld: false }));
    }
}
exports.GamePlayer = GamePlayer;
/**
 * Player 用户设备相关的接口
 */
class PlayerNavigator {
    constructor(emitEvent, addEventListener, dispatchEvent) {
        this.emitEvent = emitEvent;
        this.addEventListener = addEventListener;
        this.dispatchEvent = dispatchEvent;
    }
}
exports.PlayerNavigator = PlayerNavigator;
/**
 * Result of performing a raycast.  Contains information about the raycast and what it hit.
 */
class GameRaycastResult {
    /**
     * @ignore
     */
    constructor(
    /**
     * If true, raycast hit an object
     */
    hit, 
    /**
     * The entity hit by the raycast
     */
    hitEntity, 
    /**
     * The voxel id hit by the raycast (0 if no voxel was hit)
     */
    hitVoxel, 
    /**
     * Start point of the ray cast
     */
    origin, 
    /**
     * Direction of the raycast
     */
    direction, 
    /**
     * Distance traveled along the ray
     */
    distance, 
    /**
     * Position of the ray intersection
     */
    hitPosition, 
    /**
     * Normal vector on surface at point of intersection
     */
    normal, 
    /**
     * If a voxel was hit, the grid coordinates of the hit voxel
     */
    voxelIndex) {
        this.hit = hit;
        this.hitEntity = hitEntity;
        this.hitVoxel = hitVoxel;
        this.origin = origin;
        this.direction = direction;
        this.distance = distance;
        this.hitPosition = hitPosition;
        this.normal = normal;
        this.voxelIndex = voxelIndex;
    }
}
exports.GameRaycastResult = GameRaycastResult;
/**
 * Returned by a {@link Game.GameEventChannel} whenever a handler is registered.  Can be used to cancel the handler.
 * @category events
 */
class GameEventHandlerToken {
    /**
     * @ignore
     */
    constructor(
    /**
     * Cancels the event handler
     */
    cancel, 
    /**
     * Resumes listening with the event handler
     */
    resume, 
    /**
     * Checks if the handler is active
     */
    active) {
        this.cancel = cancel;
        this.resume = resume;
        this.active = active;
    }
}
exports.GameEventHandlerToken = GameEventHandlerToken;
/**
 * An event which is fired each tick by {@link Game.GameWorld.onTick}.
 * @category events
 */
class GameTickEvent {
    /**
     * @ignore
     */
    constructor(
    /**
     * Tick at which the event was fired
     */
    tick, 
    /**
     * Last tick which was handled
     */
    prevTick, 
    /**
     * If we had to skip any ticks due to the scripts lagging
     */
    skip, 
    /**
     * Wall clock time between ticks
     */
    elapsedTimeMS) {
        this.tick = tick;
        this.prevTick = prevTick;
        this.skip = skip;
        this.elapsedTimeMS = elapsedTimeMS;
    }
}
exports.GameTickEvent = GameTickEvent;
/**
 * An event which is fired whenever some entity is created or destroyed.
 * Triggered by {@link Game.GameWorld.onPlayerJoin}, {@link Game.GameWorld.onPlayerLeave}, {@link Game.GameWorld.onEntityCreate}, {@link Game.GameWorld.onEntityDestroy} and {@link Game.GameEntity.onDestroy}
 * @category events
 */
class GameEntityEvent {
    /**
     * @ignore
     */
    constructor(
    /**
     * The time the event occured
     */
    tick, 
    /**
     * The entity that was created/destroyed
     */
    entity) {
        this.tick = tick;
        this.entity = entity;
    }
}
exports.GameEntityEvent = GameEntityEvent;
/**
 * Fired whenever an entity activates or deactivates a trigger
 * @category events
 */
class GameTriggerEvent {
    /**
     * @ignore
     */
    constructor(
    /**
     * Time event occured
     */
    tick, 
    /**
     * Entity which triggered event
     */
    entity) {
        this.tick = tick;
        this.entity = entity;
    }
}
exports.GameTriggerEvent = GameTriggerEvent;
/**
 * Fired whenever an entity takes damage
 * Triggered by {@link Game.GameWorld.onTakeDamage} {@link Game.GameEntity.onTakeDamage}
 * @category events
 */
class GameDamageEvent {
    /**
     * @ignore
     */
    constructor(
    /**
     * Time event occured
     */
    tick, 
    /**
     * Entity which received damage
     */
    entity, 
    /**
     * Amount of damage
     */
    damage, 
    /**
     * Entity attacker
     */
    attacker, 
    /**
     * Damage type
     */
    damageType) {
        this.tick = tick;
        this.entity = entity;
        this.damage = damage;
        this.attacker = attacker;
        this.damageType = damageType;
    }
}
exports.GameDamageEvent = GameDamageEvent;
/**
 * Fired whenever an entity takes dies.
 * Triggered by {@link Game.GameWorld.onTakeDamage} {@link Game.GameEntity.onTakeDamage}
 * @category events
 */
class GameDieEvent {
    /**
     * @ignore
     */
    constructor(
    /**
     * Time event occured
     */
    tick, 
    /**
     * Entity which received damage
     */
    entity, 
    /**
     * Entity attacker
     */
    attacker, 
    /**
     * Damage type
     */
    damageType) {
        this.tick = tick;
        this.entity = entity;
        this.attacker = attacker;
        this.damageType = damageType;
    }
}
exports.GameDieEvent = GameDieEvent;
/**
 * Triggered whenever a player respawns
 * @category events
 */
class GameRespawnEvent {
    /**
     * @ignore
     */
    constructor(
    /**
     * Time event occured
     */
    tick, 
    /**
     * Entity which received damage
     */
    entity) {
        this.tick = tick;
        this.entity = entity;
    }
}
exports.GameRespawnEvent = GameRespawnEvent;
/**
 * An event which is fired whenever two entities collide
 * Triggered by {@link Game.GameWorld.onEntityContact}, {@link Game.GameWorld.onEntitySeparate}, {@link Game.GameEntity.onEntityContact}, {@link Game.GameEntity.onEntitySeparate}
 * @category events
 */
class GameEntityContactEvent {
    /**
     * @ignore
     */
    constructor(
    /**
     * Time at which the entities collided
     */
    tick, 
    /**
     * The first entity in the pair
     */
    entity, 
    /**
     * The second entity in the pair
     */
    other, 
    /**
     * The separating axis of the collision
     */
    axis, 
    /**
     * The amount of force imparted by the collision
     */
    force) {
        this.tick = tick;
        this.entity = entity;
        this.other = other;
        this.axis = axis;
        this.force = force;
    }
}
exports.GameEntityContactEvent = GameEntityContactEvent;
/**
 * An event which is fired whenever an entity comes into contact with terrain
 * Triggered by {@link Game.GameWorld.onVoxelContact}, {@link Game.GameWorld.onVoxelSeparate}, {@link Game.GameEntity.onVoxelContact}, {@link Game.GameEntity.onVoxelSeparate}
 * @category events
 */
class GameVoxelContactEvent {
    /**
     * @ignore
     */
    constructor(
    /**
     * The time of the contact event
     */
    tick, 
    /**
     * The entity which touched the terrain
     */
    entity, 
    /**
     * x coordinate of voxel which was touched
     */
    x, 
    /**
     * y coordinate of voxel which was touched
     */
    y, 
    /**
     * z coordinate of voxel which was touched
     */
    z, 
    /**
     * id of voxel
     */
    voxel, 
    /**
     * Separating axis
     */
    axis, 
    /**
     * Collision force
     */
    force) {
        this.tick = tick;
        this.entity = entity;
        this.x = x;
        this.y = y;
        this.z = z;
        this.voxel = voxel;
        this.axis = axis;
        this.force = force;
    }
}
exports.GameVoxelContactEvent = GameVoxelContactEvent;
/**
 * An event which is fired whenever an entity enters or leaves a fluid
 * Triggered by {@link Game.GameWorld.onFluidEnter}, {@link Game.GameWorld.onFluidLeave}, {@link Game.GameEntity.onFluidEnter}, {@link Game.GameEntity.onFluidLeave}
 * @category events
 */
class GameFluidContactEvent {
    /**
     * @ignore
     */
    constructor(
    /**
     * Time event occured
     */
    tick, 
    /**
     * Entity which modified
     */
    entity, 
    /**
     * The id of the fluid voxel
     */
    voxel) {
        this.tick = tick;
        this.entity = entity;
        this.voxel = voxel;
    }
}
exports.GameFluidContactEvent = GameFluidContactEvent;
/**
 * Triggered by {@link Game.GameWorld.onChat} and {@link Game.GameEntity.onChat}
 * @category events
 */
class GameChatEvent {
    /**
     * @ignore
     */
    constructor(
    /**
     * Time chat event occured
     */
    tick, 
    /**
     * Entity which initiated chat event
     */
    entity, 
    /**
     * What the entity said in the chat event
     */
    message) {
        this.tick = tick;
        this.entity = entity;
        this.message = message;
    }
}
exports.GameChatEvent = GameChatEvent;
/**
 * Triggered by {@link Game.GameWorld.onInteract} and {@link Game.GameEntity.onInteract}
 * @category events
 */
class GameInteractEvent {
    /**
     * @ignore
     */
    constructor(
    /**
     * Time of event
     */
    tick, 
    /**
     * Entity initiating interaction
     */
    entity, 
    /**
     * Entity which received interaction
     */
    targetEntity) {
        this.tick = tick;
        this.entity = entity;
        this.targetEntity = targetEntity;
    }
}
exports.GameInteractEvent = GameInteractEvent;
/**
 * Type of a button pressed by a player
 * @category events
 */
var GameButtonType;
(function (GameButtonType) {
    GameButtonType["WALK"] = "walk";
    GameButtonType["RUN"] = "run";
    GameButtonType["CROUCH"] = "crouch";
    GameButtonType["JUMP"] = "jump";
    GameButtonType["DOUBLE_JUMP"] = "jump2";
    GameButtonType["FLY"] = "fly";
    GameButtonType["ACTION0"] = "action0";
    GameButtonType["ACTION1"] = "action1";
})(GameButtonType || (exports.GameButtonType = GameButtonType = {}));
/**
 * Input events are generated whenever a player presses a button.
 * The tick of an event occurs at the exact instant the button was pressed by the player.
 * Triggered by {@link Game.GameWorld.onPress}, {@link Game.GameWorld.onRelease}, {@link Game.GamePlayer.onPress}, {@link Game.GamePlayer.onRelease}
 * @category events
 */
class GameInputEvent {
    /**
     * @ignore
     */
    constructor(
    /**
     * The time the button was pressed
     */
    tick, 
    /**
     * A reference to the player which pressed the button
     */
    entity, 
    /**
     * The position of the entity at the time the pressed the button
     */
    position, 
    /**
     * The button which was input by the player
     */
    button, 
    /**
     * If true, then this is a press event.  Otherwise if false this is a release event
     */
    pressed, 
    /**
     * The result of a raycast query initiated by the player at the exact instant they pressed the button from the perspective of their camera.
     */
    raycast) {
        this.tick = tick;
        this.entity = entity;
        this.position = position;
        this.button = button;
        this.pressed = pressed;
        this.raycast = raycast;
    }
}
exports.GameInputEvent = GameInputEvent;
class GameClickEvent {
    /**
     * @ignore
     */
    constructor(
    /**
     * Tick that click event occurred
     */
    tick, 
    /**
     * Entity that got clicked
     */
    entity, 
    /**
     * Entity which initiated the click event
     */
    clicker, 
    /**
     * Button which was pressed ACTION0 = LeftClick, ACTION1 = RightClick
     */
    button, 
    /**
     * Distance from clicker to entity
     */
    distance, 
    /**
     * Position of clicker at time of click
     */
    clickerPosition, 
    /**
     * Raycast from clicker -> entity
     */
    raycast) {
        this.tick = tick;
        this.entity = entity;
        this.clicker = clicker;
        this.button = button;
        this.distance = distance;
        this.clickerPosition = clickerPosition;
        this.raycast = raycast;
    }
}
exports.GameClickEvent = GameClickEvent;
class GameKeyBoardEvent {
    constructor(
    /**
     * Tick that click event occurred
     */
    tick, keyCode) {
        this.tick = tick;
        this.keyCode = keyCode;
    }
}
exports.GameKeyBoardEvent = GameKeyBoardEvent;
class GameAnimationEvent {
    /**
     * @ignore
     */
    constructor(tick, target, animation, cancelled) {
        this.tick = tick;
        this.target = target;
        this.animation = animation;
        this.cancelled = cancelled;
    }
}
exports.GameAnimationEvent = GameAnimationEvent;
/**
 * Interface for all project resources
 */
class GameResourceSystem {
    constructor(ls) {
        this.ls = ls;
    }
}
exports.GameResourceSystem = GameResourceSystem;
/**
 * Describes the type of an asset
 */
var GameAssetType;
(function (GameAssetType) {
    GameAssetType["VOXEL_MESH"] = "mesh";
    GameAssetType["DIRECTORY"] = "directory";
    GameAssetType["COLOR_LUT"] = "lut";
    GameAssetType["JS_SCRIPT"] = "js";
    GameAssetType["IMAGE"] = "image";
    GameAssetType["PARTICLE_TEXTURE"] = "snow";
    GameAssetType["SOUND"] = "sound";
    GameAssetType["PICTURE"] = "picture";
})(GameAssetType || (exports.GameAssetType = GameAssetType = {}));
/**
 * An entry from an asset list
 */
class GameAssetListEntry {
    /**
     * @ignore
     */
    constructor(
    /**
     * Fully qualified path of asset, split by directory
     */
    path, 
    /**
     * Type of asset
     */
    type) {
        this.path = path;
        this.type = type;
    }
}
exports.GameAssetListEntry = GameAssetListEntry;
//# sourceMappingURL=api.js.map