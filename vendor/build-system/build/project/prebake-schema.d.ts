import { MuArray, MuASCII, MuBytes, MuStruct } from '@box/mudb/schema';
export declare const PrebakeCacheSchema: MuStruct<{
    voxelBytes: MuArray<MuBytes>;
    hotProject: MuStruct<{
        version: MuASCII;
        name: import("@box/mudb/schema").MuUTF8;
        blockInfoHash: MuASCII;
        blockInfo: MuStruct<{
            ids: import("@box/schema/utils/relative-array").RelativeArray<import("@box/mudb/schema").MuRelativeVarint>;
            names: MuArray<import("@box/mudb/schema").MuUTF8>;
            emissive: import("@box/schema/utils/relative-array").RelativeArray<import("@box/mudb/schema").MuVarint>;
            texture: import("@box/schema/utils/relative-array").RelativeArray<import("@box/mudb/schema").MuRelativeVarint>;
            animLength: import("@box/schema/utils/relative-array").RelativeArray<import("@box/mudb/schema").MuVarint>;
            friction: import("@box/schema/utils/relative-array").RelativeArray<import("@box/mudb/schema").MuQuantizedFloat>;
            restitution: import("@box/schema/utils/relative-array").RelativeArray<import("@box/mudb/schema").MuQuantizedFloat>;
            velocity: import("@box/schema/utils/relative-array").RelativeArray<import("@box/mudb/schema").MuFloat32>;
            fluids: MuArray<MuStruct<{
                id: import("@box/mudb/schema").MuVarint;
                info: import("@box/mudb/schema").MuUint32;
                mass: import("@box/mudb/schema").MuFloat64;
            }>>;
            category: import("@box/mudb/schema").MuDictionary<import("@box/schema/utils/relative-array").RelativeArray<import("@box/mudb/schema").MuRelativeVarint>>;
            atlasRadius: import("@box/mudb/schema").MuVarint;
            blockBumpShift: import("@box/mudb/schema").MuVarint;
            blockColorShift: import("@box/mudb/schema").MuVarint;
            colorAtlas: MuArray<MuASCII>;
            materialAtlas: MuArray<MuASCII>;
            bumpAtlas: MuArray<MuASCII>;
        }>;
        environment: MuStruct<{
            fog: MuStruct<{
                fogColor: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                fogStartDistance: import("@box/mudb/schema").MuFloat64;
                fogHeightOffset: import("@box/mudb/schema").MuFloat64;
                fogHeightFalloff: import("@box/mudb/schema").MuFloat64;
                fogDensity: import("@box/mudb/schema").MuFloat64;
                maxFog: import("@box/mudb/schema").MuFloat64;
            }>;
            sky: MuStruct<{
                skyType: import("@box/mudb/schema").MuSchema<import("@box/schema/project/project-rda").EnvironmentSkyType>;
                globalLight: import("@box/mudb/schema").MuFloat64;
                sunPhase: import("@box/mudb/schema").MuFloat64;
                sunFrequency: import("@box/mudb/schema").MuFloat64;
                lunarPhase: import("@box/mudb/schema").MuFloat64;
                sunDirection: MuStruct<{
                    x: import("@box/mudb/schema").MuFloat64;
                    y: import("@box/mudb/schema").MuFloat64;
                    z: import("@box/mudb/schema").MuFloat64;
                }>;
                sunColor: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyLeft: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyRight: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyTop: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyBottom: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyFront: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyBack: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                gamma: import("@box/mudb/schema").MuFloat32;
            }>;
            snow: MuStruct<{
                texture: import("@box/mudb/schema").MuUTF8;
                density: import("@box/mudb/schema").MuFloat64;
                size: MuStruct<{
                    w: import("@box/mudb/schema").MuFloat64;
                    h: import("@box/mudb/schema").MuFloat64;
                }>;
                fallSpeed: import("@box/mudb/schema").MuFloat64;
                spinSpeed: import("@box/mudb/schema").MuFloat64;
                color: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                    a: import("@box/mudb/schema").MuFloat64;
                }>;
            }>;
            rain: MuStruct<{
                density: import("@box/mudb/schema").MuFloat64;
                direction: MuStruct<{
                    x: import("@box/mudb/schema").MuFloat64;
                    y: import("@box/mudb/schema").MuFloat64;
                    z: import("@box/mudb/schema").MuFloat64;
                }>;
                speed: import("@box/mudb/schema").MuFloat64;
                size: MuStruct<{
                    w: import("@box/mudb/schema").MuFloat64;
                    h: import("@box/mudb/schema").MuFloat64;
                }>;
                interference: import("@box/mudb/schema").MuFloat64;
                color: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                    a: import("@box/mudb/schema").MuFloat64;
                }>;
            }>;
            drawDistance: import("@box/mudb/schema").MuFloat32;
            bakedShadow: MuStruct<{
                texture: MuASCII;
                data: MuASCII;
                chunkShift: import("@box/mudb/schema").MuVarint;
            }>;
        }>;
        physics: MuStruct<{
            gravity: import("@box/mudb/schema").MuFloat64;
            velocityDamping: import("@box/mudb/schema").MuFloat64;
            useOBB: import("@box/mudb/schema").MuBoolean;
        }>;
        player: MuStruct<{
            cameraType: MuASCII;
            scale: import("@box/mudb/schema").MuFloat64;
            colorLUT: import("@box/mudb/schema").MuUTF8;
            initialPosition: MuStruct<{
                x: import("@box/mudb/schema").MuFloat64;
                y: import("@box/mudb/schema").MuFloat64;
                z: import("@box/mudb/schema").MuFloat64;
            }>;
            initialYaw: import("@box/mudb/schema").MuFloat32;
            movementBounds: MuStruct<{
                lo: MuStruct<{
                    x: import("@box/mudb/schema").MuFloat64;
                    y: import("@box/mudb/schema").MuFloat64;
                    z: import("@box/mudb/schema").MuFloat64;
                }>;
                hi: MuStruct<{
                    x: import("@box/mudb/schema").MuFloat64;
                    y: import("@box/mudb/schema").MuFloat64;
                    z: import("@box/mudb/schema").MuFloat64;
                }>;
            }>;
            allowFlight: import("@box/mudb/schema").MuBoolean;
            allowMove: import("@box/mudb/schema").MuBoolean;
            allowAction0: import("@box/mudb/schema").MuBoolean;
            allowAction1: import("@box/mudb/schema").MuBoolean;
            allowJump: import("@box/mudb/schema").MuBoolean;
            allowDoubleJump: import("@box/mudb/schema").MuBoolean;
            allowCrouch: import("@box/mudb/schema").MuBoolean;
            noClip: import("@box/mudb/schema").MuBoolean;
            walkSpeed: import("@box/mudb/schema").MuFloat32;
            walkAcceleration: import("@box/mudb/schema").MuFloat32;
            runSpeed: import("@box/mudb/schema").MuFloat32;
            runAcceleration: import("@box/mudb/schema").MuFloat32;
            crouchSpeed: import("@box/mudb/schema").MuFloat32;
            crouchAcceleration: import("@box/mudb/schema").MuFloat32;
            swimSpeed: import("@box/mudb/schema").MuFloat32;
            swimAcceleration: import("@box/mudb/schema").MuFloat32;
            flySpeed: import("@box/mudb/schema").MuFloat32;
            flyAcceleration: import("@box/mudb/schema").MuFloat32;
            jumpSpeedFactor: import("@box/mudb/schema").MuFloat32;
            jumpAccelerationFactor: import("@box/mudb/schema").MuFloat32;
            jumpPower: import("@box/mudb/schema").MuFloat32;
            doubleJumpPower: import("@box/mudb/schema").MuFloat32;
            mass: import("@box/mudb/schema").MuFloat64;
            friction: import("@box/mudb/schema").MuFloat64;
            restitution: import("@box/mudb/schema").MuFloat64;
            color: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
            emissive: import("@box/mudb/schema").MuQuantizedFloat;
            shininess: import("@box/mudb/schema").MuQuantizedFloat;
            metalness: import("@box/mudb/schema").MuQuantizedFloat;
            invisible: import("@box/mudb/schema").MuBoolean;
            showName: import("@box/mudb/schema").MuBoolean;
            showIndicator: import("@box/mudb/schema").MuBoolean;
            damage: MuStruct<{
                enabled: import("@box/mudb/schema").MuBoolean;
                showHealth: import("@box/mudb/schema").MuBoolean;
                showDamage: import("@box/mudb/schema").MuBoolean;
                hp: import("@box/mudb/schema").MuVarint;
                maxHp: import("@box/mudb/schema").MuVarint;
            }>;
            sounds: MuStruct<{
                chat: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                hurt: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                die: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                interact: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
            }>;
            playerSounds: MuStruct<{
                spawn: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                jump: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                doubleJump: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                land: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                crouch: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                step: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                action0: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                action1: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                swim: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                enterWater: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                leaveWater: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                startFly: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                endFly: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                music: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
            }>;
        }>;
        voxels: MuStruct<{
            shape: MuStruct<{
                x: import("@box/mudb/schema").MuUint16;
                y: import("@box/mudb/schema").MuUint16;
                z: import("@box/mudb/schema").MuUint16;
            }>;
            chunks: MuArray<MuASCII>;
        }>;
        seeds: import("@box/mudb/schema").MuDictionary<MuStruct<{
            name: import("@box/mudb/schema").MuUTF8;
            tags: MuArray<import("@box/mudb/schema").MuUTF8>;
            editLock: import("@box/mudb/schema").MuBoolean;
            staticShadow: import("@box/mudb/schema").MuBoolean;
            position: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
            collision: import("@box/mudb/schema").MuBoolean;
            gravity: import("@box/mudb/schema").MuBoolean;
            fixed: import("@box/mudb/schema").MuBoolean;
            mass: import("@box/mudb/schema").MuFloat64;
            friction: import("@box/mudb/schema").MuFloat64;
            restitution: import("@box/mudb/schema").MuFloat64;
            bounds: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
            meshId: import("@box/mudb/schema").MuFloat64;
            mesh: import("@box/mudb/schema").MuUTF8;
            scale: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
            orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
            tint: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec4>;
            metalness: import("@box/mudb/schema").MuFloat64;
            shininess: import("@box/mudb/schema").MuFloat64;
            emissive: import("@box/mudb/schema").MuFloat64;
            defaultMotionId: MuASCII;
            particle: MuStruct<{
                rate: import("@box/mudb/schema").MuFloat64;
                rateSpread: import("@box/mudb/schema").MuFloat64;
                limit: import("@box/mudb/schema").MuVarint;
                lifetime: import("@box/mudb/schema").MuFloat64;
                lifetimeSpread: import("@box/mudb/schema").MuFloat64;
                color0: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                color1: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                color2: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                color3: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                color4: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                size0: import("@box/mudb/schema").MuFloat32;
                size1: import("@box/mudb/schema").MuFloat32;
                size2: import("@box/mudb/schema").MuFloat32;
                size3: import("@box/mudb/schema").MuFloat32;
                size4: import("@box/mudb/schema").MuFloat32;
                sizeSpread: import("@box/mudb/schema").MuFloat64;
                velocity: MuStruct<{
                    x: import("@box/mudb/schema").MuFloat64;
                    y: import("@box/mudb/schema").MuFloat64;
                    z: import("@box/mudb/schema").MuFloat64;
                }>;
                velocitySpread: MuStruct<{
                    x: import("@box/mudb/schema").MuFloat64;
                    y: import("@box/mudb/schema").MuFloat64;
                    z: import("@box/mudb/schema").MuFloat64;
                }>;
                acceleration: MuStruct<{
                    x: import("@box/mudb/schema").MuFloat64;
                    y: import("@box/mudb/schema").MuFloat64;
                    z: import("@box/mudb/schema").MuFloat64;
                }>;
                damping: import("@box/mudb/schema").MuFloat64;
                noiseAmpl: import("@box/mudb/schema").MuFloat64;
                noiseFreq: import("@box/mudb/schema").MuFloat64;
            }>;
            damage: MuStruct<{
                enabled: import("@box/mudb/schema").MuBoolean;
                showHealth: import("@box/mudb/schema").MuBoolean;
                showDamage: import("@box/mudb/schema").MuBoolean;
                hp: import("@box/mudb/schema").MuVarint;
                maxHp: import("@box/mudb/schema").MuVarint;
            }>;
            sound: MuStruct<{
                chat: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                hurt: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                die: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                interact: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
            }>;
        }>>;
        assets: import("@box/mudb/schema").MuDictionary<MuStruct<{
            type: import("@box/mudb/schema").MuSchema<import("@box/schema/group-project/rda").AssetType>;
            hash: MuASCII;
            size: import("@box/mudb/schema").MuVarint;
            previewImage: MuASCII;
            ownerId: import("@box/mudb/schema").MuVarint;
            contentId: import("@box/mudb/schema").MuFloat64;
            bounds: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
            animated: import("@box/mudb/schema").MuBoolean;
        }>>;
        audioAssets: import("@box/mudb/schema").MuDictionary<MuStruct<{
            type: import("@box/mudb/schema").MuSchema<import("@box/schema/group-project/rda").AssetType>;
            hash: MuASCII;
            size: import("@box/mudb/schema").MuVarint;
            previewImage: MuASCII;
            id: MuASCII;
            updateAt: import("@box/mudb/schema").MuFloat64;
        }>>;
        sound: MuStruct<{
            ambient: MuStruct<{
                sample: import("@box/mudb/schema").MuUTF8;
                radius: import("@box/mudb/schema").MuFloat32;
                pitch: import("@box/mudb/schema").MuFloat32;
                pitchRange: import("@box/mudb/schema").MuFloat32;
                gain: import("@box/mudb/schema").MuFloat32;
                gainRange: import("@box/mudb/schema").MuFloat32;
            }>;
            breakVoxel: MuStruct<{
                sample: import("@box/mudb/schema").MuUTF8;
                radius: import("@box/mudb/schema").MuFloat32;
                pitch: import("@box/mudb/schema").MuFloat32;
                pitchRange: import("@box/mudb/schema").MuFloat32;
                gain: import("@box/mudb/schema").MuFloat32;
                gainRange: import("@box/mudb/schema").MuFloat32;
            }>;
            placeVoxel: MuStruct<{
                sample: import("@box/mudb/schema").MuUTF8;
                radius: import("@box/mudb/schema").MuFloat32;
                pitch: import("@box/mudb/schema").MuFloat32;
                pitchRange: import("@box/mudb/schema").MuFloat32;
                gain: import("@box/mudb/schema").MuFloat32;
                gainRange: import("@box/mudb/schema").MuFloat32;
            }>;
            playerJoin: MuStruct<{
                sample: import("@box/mudb/schema").MuUTF8;
                radius: import("@box/mudb/schema").MuFloat32;
                pitch: import("@box/mudb/schema").MuFloat32;
                pitchRange: import("@box/mudb/schema").MuFloat32;
                gain: import("@box/mudb/schema").MuFloat32;
                gainRange: import("@box/mudb/schema").MuFloat32;
            }>;
            playerLeave: MuStruct<{
                sample: import("@box/mudb/schema").MuUTF8;
                radius: import("@box/mudb/schema").MuFloat32;
                pitch: import("@box/mudb/schema").MuFloat32;
                pitchRange: import("@box/mudb/schema").MuFloat32;
                gain: import("@box/mudb/schema").MuFloat32;
                gainRange: import("@box/mudb/schema").MuFloat32;
            }>;
        }>;
        features: MuStruct<{
            enableTriggerAPI: import("@box/mudb/schema").MuBoolean;
        }>;
        zones: MuArray<MuStruct<{
            bounds: MuStruct<{
                lox: import("@box/mudb/schema").MuFloat64;
                loy: import("@box/mudb/schema").MuFloat64;
                loz: import("@box/mudb/schema").MuFloat64;
                hix: import("@box/mudb/schema").MuFloat64;
                hiy: import("@box/mudb/schema").MuFloat64;
                hiz: import("@box/mudb/schema").MuFloat64;
            }>;
            selector: import("@box/mudb/schema").MuUTF8;
            massScale: import("@box/mudb/schema").MuFloat64;
            force: MuStruct<{
                x: import("@box/mudb/schema").MuFloat64;
                y: import("@box/mudb/schema").MuFloat64;
                z: import("@box/mudb/schema").MuFloat64;
            }>;
            overrideFog: import("@box/mudb/schema").MuBoolean;
            fog: MuStruct<{
                fogColor: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                fogStartDistance: import("@box/mudb/schema").MuFloat64;
                fogHeightOffset: import("@box/mudb/schema").MuFloat64;
                fogHeightFalloff: import("@box/mudb/schema").MuFloat64;
                fogDensity: import("@box/mudb/schema").MuFloat64;
                maxFog: import("@box/mudb/schema").MuFloat64;
            }>;
            overrideSky: import("@box/mudb/schema").MuBoolean;
            sky: MuStruct<{
                skyType: import("@box/mudb/schema").MuSchema<import("@box/schema/project/project-rda").EnvironmentSkyType>;
                globalLight: import("@box/mudb/schema").MuFloat64;
                sunPhase: import("@box/mudb/schema").MuFloat64;
                sunFrequency: import("@box/mudb/schema").MuFloat64;
                lunarPhase: import("@box/mudb/schema").MuFloat64;
                sunDirection: MuStruct<{
                    x: import("@box/mudb/schema").MuFloat64;
                    y: import("@box/mudb/schema").MuFloat64;
                    z: import("@box/mudb/schema").MuFloat64;
                }>;
                sunColor: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyLeft: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyRight: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyTop: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyBottom: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyFront: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyBack: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                gamma: import("@box/mudb/schema").MuFloat32;
            }>;
            overrideSnow: import("@box/mudb/schema").MuBoolean;
            snow: MuStruct<{
                texture: import("@box/mudb/schema").MuUTF8;
                density: import("@box/mudb/schema").MuFloat64;
                size: MuStruct<{
                    w: import("@box/mudb/schema").MuFloat64;
                    h: import("@box/mudb/schema").MuFloat64;
                }>;
                fallSpeed: import("@box/mudb/schema").MuFloat64;
                spinSpeed: import("@box/mudb/schema").MuFloat64;
                color: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                    a: import("@box/mudb/schema").MuFloat64;
                }>;
            }>;
            overrideRain: import("@box/mudb/schema").MuBoolean;
            rain: MuStruct<{
                density: import("@box/mudb/schema").MuFloat64;
                direction: MuStruct<{
                    x: import("@box/mudb/schema").MuFloat64;
                    y: import("@box/mudb/schema").MuFloat64;
                    z: import("@box/mudb/schema").MuFloat64;
                }>;
                speed: import("@box/mudb/schema").MuFloat64;
                size: MuStruct<{
                    w: import("@box/mudb/schema").MuFloat64;
                    h: import("@box/mudb/schema").MuFloat64;
                }>;
                interference: import("@box/mudb/schema").MuFloat64;
                color: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                    a: import("@box/mudb/schema").MuFloat64;
                }>;
            }>;
        }>>;
        gamepad: MuStruct<{
            joystick: MuStruct<{
                background: import("@box/mudb/schema").MuUTF8;
                controller: import("@box/mudb/schema").MuUTF8;
            }>;
            fly: MuStruct<{
                button: import("@box/mudb/schema").MuUTF8;
                flyingController: import("@box/mudb/schema").MuUTF8;
                flyingBackground: import("@box/mudb/schema").MuUTF8;
            }>;
            buttons: MuStruct<{
                jump: import("@box/mudb/schema").MuUTF8;
                crouch: import("@box/mudb/schema").MuUTF8;
                actionA: import("@box/mudb/schema").MuUTF8;
                actionB: import("@box/mudb/schema").MuUTF8;
            }>;
        }>;
        collisionRules: MuArray<MuStruct<{
            a: import("@box/mudb/schema").MuUTF8;
            b: import("@box/mudb/schema").MuUTF8;
        }>>;
        soundAssets: MuStruct<{
            hashes: MuArray<MuASCII>;
            hashId: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuVarint>;
        }>;
        meshAssets: import("@box/mudb/schema").MuDictionary<MuStruct<{
            hash: MuASCII;
            meshHash: MuASCII;
            bounds: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
            hashType: import("@box/mudb/schema").MuSchema<import("@box/schema/project/hot-schema").HashType>;
            motionList: MuArray<MuStruct<{
                id: MuASCII;
                name: import("@box/mudb/schema").MuUTF8;
                duration: import("@box/mudb/schema").MuFloat32;
            }>>;
            useCustomBounds: import("@box/mudb/schema").MuBoolean;
            customBounds: MuStruct<{
                size: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
                offset: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
            }>;
            renderBoxOffset: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
        }>>;
        modules: import("@box/mudb/schema").MuDictionary<MuStruct<{
            hash: MuASCII;
            isClient: import("@box/mudb/schema").MuBoolean;
        }>>;
        scriptIndex: import("@box/mudb/schema").MuUTF8;
        uiTree: import("@box/mudb/schema").MuDictionary<MuStruct<{
            id: MuASCII;
            type: import("@box/mudb/schema").MuSchema<import("@box/schema/project/murda-tree").TreeNodeType>;
            name: import("@box/mudb/schema").MuUTF8;
            parentId: MuASCII;
            childrenIds: MuArray<MuASCII>;
            value: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuUnion<{
                screen: MuStruct<{
                    enable: import("@box/mudb/schema").MuBoolean;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: import("@box/mudb/schema").MuVoid;
                        autoLayout: MuStruct<{
                            cellSize: MuStruct<{
                                offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: import("@box/mudb/schema").MuBoolean;
                            columnWidthEnabled: import("@box/mudb/schema").MuBoolean;
                            startCorner: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutStartCorner>;
                            fillDirection: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutFillDirection>;
                            maxCells: import("@box/mudb/schema").MuVarint;
                            maxCellsEnabled: import("@box/mudb/schema").MuBoolean;
                            cellPadding: MuStruct<{
                                offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                            verticalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    zIndex: import("@box/mudb/schema").MuVarint;
                }>;
                element: import("@box/mudb/schema").MuUnion<{
                    box: MuStruct<{
                        anchor: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        position: MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        size: MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        autoResize: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoResizeType>;
                        visible: import("@box/mudb/schema").MuBoolean;
                        backgroundColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        zIndex: import("@box/mudb/schema").MuVarint;
                        layoutOrder: import("@box/mudb/schema").MuVarint;
                        layout: import("@box/mudb/schema").MuUnion<{
                            none: import("@box/mudb/schema").MuVoid;
                            autoLayout: MuStruct<{
                                cellSize: MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                lineHeightEnabled: import("@box/mudb/schema").MuBoolean;
                                columnWidthEnabled: import("@box/mudb/schema").MuBoolean;
                                startCorner: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutStartCorner>;
                                fillDirection: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutFillDirection>;
                                maxCells: import("@box/mudb/schema").MuVarint;
                                maxCellsEnabled: import("@box/mudb/schema").MuBoolean;
                                cellPadding: MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                horizontalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                                verticalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                            }>;
                        }>;
                        clipsDescendants: import("@box/mudb/schema").MuBoolean;
                        rotation: import("@box/mudb/schema").MuQuantizedFloat;
                    }>;
                    image: MuStruct<{
                        anchor: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        position: MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        size: MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        autoResize: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoResizeType>;
                        visible: import("@box/mudb/schema").MuBoolean;
                        backgroundColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        zIndex: import("@box/mudb/schema").MuVarint;
                        layoutOrder: import("@box/mudb/schema").MuVarint;
                        clipsDescendants: import("@box/mudb/schema").MuBoolean;
                        layout: import("@box/mudb/schema").MuUnion<{
                            none: import("@box/mudb/schema").MuVoid;
                            autoLayout: MuStruct<{
                                cellSize: MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                lineHeightEnabled: import("@box/mudb/schema").MuBoolean;
                                columnWidthEnabled: import("@box/mudb/schema").MuBoolean;
                                startCorner: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutStartCorner>;
                                fillDirection: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutFillDirection>;
                                maxCells: import("@box/mudb/schema").MuVarint;
                                maxCellsEnabled: import("@box/mudb/schema").MuBoolean;
                                cellPadding: MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                horizontalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                                verticalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                            }>;
                        }>;
                        image: import("@box/mudb/schema").MuUTF8;
                        imageOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        imageDisplayMode: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").ImageDisplayMode>;
                        rotation: import("@box/mudb/schema").MuQuantizedFloat;
                    }>;
                    text: MuStruct<{
                        richText: import("@box/mudb/schema").MuBoolean;
                        rotation: import("@box/mudb/schema").MuQuantizedFloat;
                        textStrokeColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        textStrokeOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        textStrokeThickness: import("@box/mudb/schema").MuQuantizedFloat;
                        textFontFamily: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").UITextFontFamily>;
                        anchor: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        position: MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        size: MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        autoResize: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoResizeType>;
                        visible: import("@box/mudb/schema").MuBoolean;
                        backgroundColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        zIndex: import("@box/mudb/schema").MuVarint;
                        layoutOrder: import("@box/mudb/schema").MuVarint;
                        layout: import("@box/mudb/schema").MuUnion<{
                            none: import("@box/mudb/schema").MuVoid;
                            autoLayout: MuStruct<{
                                cellSize: MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                lineHeightEnabled: import("@box/mudb/schema").MuBoolean;
                                columnWidthEnabled: import("@box/mudb/schema").MuBoolean;
                                startCorner: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutStartCorner>;
                                fillDirection: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutFillDirection>;
                                maxCells: import("@box/mudb/schema").MuVarint;
                                maxCellsEnabled: import("@box/mudb/schema").MuBoolean;
                                cellPadding: MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                horizontalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                                verticalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                            }>;
                        }>;
                        clipsDescendants: import("@box/mudb/schema").MuBoolean;
                        textContent: import("@box/mudb/schema").MuUTF8;
                        textFontSize: import("@box/mudb/schema").MuUint8;
                        textColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        textOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        textXAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").TextXAlignType>;
                        textYAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").TextYAlignType>;
                        textLineHeight: import("@box/mudb/schema").MuQuantizedFloat;
                        autoWordWrap: import("@box/mudb/schema").MuBoolean;
                    }>;
                    scrollBox: MuStruct<{
                        anchor: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        position: MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        size: MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        autoResize: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoResizeType>;
                        visible: import("@box/mudb/schema").MuBoolean;
                        backgroundColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        zIndex: import("@box/mudb/schema").MuVarint;
                        layoutOrder: import("@box/mudb/schema").MuVarint;
                        clipsDescendants: import("@box/mudb/schema").MuBoolean;
                        layout: import("@box/mudb/schema").MuUnion<{
                            none: import("@box/mudb/schema").MuVoid;
                            autoLayout: MuStruct<{
                                cellSize: MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                lineHeightEnabled: import("@box/mudb/schema").MuBoolean;
                                columnWidthEnabled: import("@box/mudb/schema").MuBoolean;
                                startCorner: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutStartCorner>;
                                fillDirection: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutFillDirection>;
                                maxCells: import("@box/mudb/schema").MuVarint;
                                maxCellsEnabled: import("@box/mudb/schema").MuBoolean;
                                cellPadding: MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                horizontalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                                verticalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                            }>;
                        }>;
                        scrollDirection: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").UIScrollDirection>;
                        scrollbarHorizontal: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").UIScrollbarHorizontal>;
                        scrollbarVertical: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").UIScrollbarVertical>;
                        scrollbarVisibility: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").UIScrollbarVisibility>;
                        scrollbarThickness: import("@box/mudb/schema").MuVarint;
                        scrollbarColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        scrollbarOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        scrollCanvasAutoResize: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoResizeType>;
                        scrollCanvasSize: MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        scrollPosition: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        rotation: import("@box/mudb/schema").MuQuantizedFloat;
                    }>;
                    input: MuStruct<{
                        textStrokeColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        textStrokeOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        textStrokeThickness: import("@box/mudb/schema").MuQuantizedFloat;
                        textFontFamily: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").UITextFontFamily>;
                        anchor: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        position: MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        size: MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        autoResize: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoResizeType>;
                        visible: import("@box/mudb/schema").MuBoolean;
                        backgroundColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        zIndex: import("@box/mudb/schema").MuVarint;
                        layoutOrder: import("@box/mudb/schema").MuVarint;
                        layout: import("@box/mudb/schema").MuUnion<{
                            none: import("@box/mudb/schema").MuVoid;
                            autoLayout: MuStruct<{
                                cellSize: MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                lineHeightEnabled: import("@box/mudb/schema").MuBoolean;
                                columnWidthEnabled: import("@box/mudb/schema").MuBoolean;
                                startCorner: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutStartCorner>;
                                fillDirection: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutFillDirection>;
                                maxCells: import("@box/mudb/schema").MuVarint;
                                maxCellsEnabled: import("@box/mudb/schema").MuBoolean;
                                cellPadding: MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                horizontalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                                verticalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                            }>;
                        }>;
                        clipsDescendants: import("@box/mudb/schema").MuBoolean;
                        textContent: import("@box/mudb/schema").MuUTF8;
                        textFontSize: import("@box/mudb/schema").MuUint8;
                        textColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        textOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        textXAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").TextXAlignType>;
                        textYAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").TextYAlignType>;
                        textLineHeight: import("@box/mudb/schema").MuQuantizedFloat;
                        autoWordWrap: import("@box/mudb/schema").MuBoolean;
                        placeholder: import("@box/mudb/schema").MuUTF8;
                        placeholderColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        placeholderOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        rotation: import("@box/mudb/schema").MuQuantizedFloat;
                    }>;
                }>;
            }>>;
        }>>;
        defaultScreenId: import("@box/mudb/schema").MuUTF8;
        pictureAssets: import("@box/mudb/schema").MuDictionary<MuStruct<{
            metadataHash: MuASCII;
            hash: MuASCII;
            width: import("@box/mudb/schema").MuInt32;
            height: import("@box/mudb/schema").MuInt32;
        }>>;
        skinAssets: import("@box/mudb/schema").MuDictionary<MuStruct<{
            hash: MuASCII;
            parts: MuStruct<{
                hips: MuASCII;
                torso: MuASCII;
                neck: MuASCII;
                head: MuASCII;
                leftShoulder: MuASCII;
                leftUpperArm: MuASCII;
                leftLowerArm: MuASCII;
                leftHand: MuASCII;
                rightShoulder: MuASCII;
                rightUpperArm: MuASCII;
                rightLowerArm: MuASCII;
                rightHand: MuASCII;
                leftUpperLeg: MuASCII;
                leftLowerLeg: MuASCII;
                leftFoot: MuASCII;
                rightUpperLeg: MuASCII;
                rightLowerLeg: MuASCII;
                rightFoot: MuASCII;
            }>;
        }>>;
        defaultSkinName: import("@box/mudb/schema").MuUTF8;
    }>;
    coldProject: MuStruct<{
        uiTree: import("@box/mudb/schema").MuDictionary<MuStruct<{
            id: MuASCII;
            type: import("@box/mudb/schema").MuSchema<import("@box/schema/project/murda-tree").TreeNodeType>;
            name: import("@box/mudb/schema").MuUTF8;
            parentId: MuASCII;
            childrenIds: MuArray<MuASCII>;
            value: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuUnion<{
                screen: MuStruct<{
                    enable: import("@box/mudb/schema").MuBoolean;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: import("@box/mudb/schema").MuVoid;
                        autoLayout: MuStruct<{
                            cellSize: MuStruct<{
                                offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: import("@box/mudb/schema").MuBoolean;
                            columnWidthEnabled: import("@box/mudb/schema").MuBoolean;
                            startCorner: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutStartCorner>;
                            fillDirection: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutFillDirection>;
                            maxCells: import("@box/mudb/schema").MuVarint;
                            maxCellsEnabled: import("@box/mudb/schema").MuBoolean;
                            cellPadding: MuStruct<{
                                offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                            verticalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    zIndex: import("@box/mudb/schema").MuVarint;
                }>;
                element: import("@box/mudb/schema").MuUnion<{
                    box: MuStruct<{
                        anchor: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        position: MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        size: MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        autoResize: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoResizeType>;
                        visible: import("@box/mudb/schema").MuBoolean;
                        backgroundColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        zIndex: import("@box/mudb/schema").MuVarint;
                        layoutOrder: import("@box/mudb/schema").MuVarint;
                        layout: import("@box/mudb/schema").MuUnion<{
                            none: import("@box/mudb/schema").MuVoid;
                            autoLayout: MuStruct<{
                                cellSize: MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                lineHeightEnabled: import("@box/mudb/schema").MuBoolean;
                                columnWidthEnabled: import("@box/mudb/schema").MuBoolean;
                                startCorner: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutStartCorner>;
                                fillDirection: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutFillDirection>;
                                maxCells: import("@box/mudb/schema").MuVarint;
                                maxCellsEnabled: import("@box/mudb/schema").MuBoolean;
                                cellPadding: MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                horizontalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                                verticalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                            }>;
                        }>;
                        clipsDescendants: import("@box/mudb/schema").MuBoolean;
                        rotation: import("@box/mudb/schema").MuQuantizedFloat;
                    }>;
                    image: MuStruct<{
                        anchor: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        position: MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        size: MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        autoResize: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoResizeType>;
                        visible: import("@box/mudb/schema").MuBoolean;
                        backgroundColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        zIndex: import("@box/mudb/schema").MuVarint;
                        layoutOrder: import("@box/mudb/schema").MuVarint;
                        clipsDescendants: import("@box/mudb/schema").MuBoolean;
                        layout: import("@box/mudb/schema").MuUnion<{
                            none: import("@box/mudb/schema").MuVoid;
                            autoLayout: MuStruct<{
                                cellSize: MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                lineHeightEnabled: import("@box/mudb/schema").MuBoolean;
                                columnWidthEnabled: import("@box/mudb/schema").MuBoolean;
                                startCorner: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutStartCorner>;
                                fillDirection: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutFillDirection>;
                                maxCells: import("@box/mudb/schema").MuVarint;
                                maxCellsEnabled: import("@box/mudb/schema").MuBoolean;
                                cellPadding: MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                horizontalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                                verticalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                            }>;
                        }>;
                        image: import("@box/mudb/schema").MuUTF8;
                        imageOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        imageDisplayMode: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").ImageDisplayMode>;
                        rotation: import("@box/mudb/schema").MuQuantizedFloat;
                    }>;
                    text: MuStruct<{
                        richText: import("@box/mudb/schema").MuBoolean;
                        rotation: import("@box/mudb/schema").MuQuantizedFloat;
                        textStrokeColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        textStrokeOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        textStrokeThickness: import("@box/mudb/schema").MuQuantizedFloat;
                        textFontFamily: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").UITextFontFamily>;
                        anchor: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        position: MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        size: MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        autoResize: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoResizeType>;
                        visible: import("@box/mudb/schema").MuBoolean;
                        backgroundColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        zIndex: import("@box/mudb/schema").MuVarint;
                        layoutOrder: import("@box/mudb/schema").MuVarint;
                        layout: import("@box/mudb/schema").MuUnion<{
                            none: import("@box/mudb/schema").MuVoid;
                            autoLayout: MuStruct<{
                                cellSize: MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                lineHeightEnabled: import("@box/mudb/schema").MuBoolean;
                                columnWidthEnabled: import("@box/mudb/schema").MuBoolean;
                                startCorner: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutStartCorner>;
                                fillDirection: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutFillDirection>;
                                maxCells: import("@box/mudb/schema").MuVarint;
                                maxCellsEnabled: import("@box/mudb/schema").MuBoolean;
                                cellPadding: MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                horizontalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                                verticalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                            }>;
                        }>;
                        clipsDescendants: import("@box/mudb/schema").MuBoolean;
                        textContent: import("@box/mudb/schema").MuUTF8;
                        textFontSize: import("@box/mudb/schema").MuUint8;
                        textColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        textOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        textXAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").TextXAlignType>;
                        textYAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").TextYAlignType>;
                        textLineHeight: import("@box/mudb/schema").MuQuantizedFloat;
                        autoWordWrap: import("@box/mudb/schema").MuBoolean;
                    }>;
                    scrollBox: MuStruct<{
                        anchor: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        position: MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        size: MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        autoResize: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoResizeType>;
                        visible: import("@box/mudb/schema").MuBoolean;
                        backgroundColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        zIndex: import("@box/mudb/schema").MuVarint;
                        layoutOrder: import("@box/mudb/schema").MuVarint;
                        clipsDescendants: import("@box/mudb/schema").MuBoolean;
                        layout: import("@box/mudb/schema").MuUnion<{
                            none: import("@box/mudb/schema").MuVoid;
                            autoLayout: MuStruct<{
                                cellSize: MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                lineHeightEnabled: import("@box/mudb/schema").MuBoolean;
                                columnWidthEnabled: import("@box/mudb/schema").MuBoolean;
                                startCorner: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutStartCorner>;
                                fillDirection: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutFillDirection>;
                                maxCells: import("@box/mudb/schema").MuVarint;
                                maxCellsEnabled: import("@box/mudb/schema").MuBoolean;
                                cellPadding: MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                horizontalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                                verticalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                            }>;
                        }>;
                        scrollDirection: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").UIScrollDirection>;
                        scrollbarHorizontal: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").UIScrollbarHorizontal>;
                        scrollbarVertical: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").UIScrollbarVertical>;
                        scrollbarVisibility: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").UIScrollbarVisibility>;
                        scrollbarThickness: import("@box/mudb/schema").MuVarint;
                        scrollbarColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        scrollbarOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        scrollCanvasAutoResize: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoResizeType>;
                        scrollCanvasSize: MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        scrollPosition: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        rotation: import("@box/mudb/schema").MuQuantizedFloat;
                    }>;
                    input: MuStruct<{
                        textStrokeColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        textStrokeOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        textStrokeThickness: import("@box/mudb/schema").MuQuantizedFloat;
                        textFontFamily: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").UITextFontFamily>;
                        anchor: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        position: MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        size: MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        autoResize: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoResizeType>;
                        visible: import("@box/mudb/schema").MuBoolean;
                        backgroundColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        zIndex: import("@box/mudb/schema").MuVarint;
                        layoutOrder: import("@box/mudb/schema").MuVarint;
                        layout: import("@box/mudb/schema").MuUnion<{
                            none: import("@box/mudb/schema").MuVoid;
                            autoLayout: MuStruct<{
                                cellSize: MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                lineHeightEnabled: import("@box/mudb/schema").MuBoolean;
                                columnWidthEnabled: import("@box/mudb/schema").MuBoolean;
                                startCorner: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutStartCorner>;
                                fillDirection: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutFillDirection>;
                                maxCells: import("@box/mudb/schema").MuVarint;
                                maxCellsEnabled: import("@box/mudb/schema").MuBoolean;
                                cellPadding: MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                horizontalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                                verticalAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                            }>;
                        }>;
                        clipsDescendants: import("@box/mudb/schema").MuBoolean;
                        textContent: import("@box/mudb/schema").MuUTF8;
                        textFontSize: import("@box/mudb/schema").MuUint8;
                        textColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        textOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        textXAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").TextXAlignType>;
                        textYAlignment: import("@box/mudb/schema").MuSchema<import("@box/schema/project/ui-rda/defs").TextYAlignType>;
                        textLineHeight: import("@box/mudb/schema").MuQuantizedFloat;
                        autoWordWrap: import("@box/mudb/schema").MuBoolean;
                        placeholder: import("@box/mudb/schema").MuUTF8;
                        placeholderColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        placeholderOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        rotation: import("@box/mudb/schema").MuQuantizedFloat;
                    }>;
                }>;
            }>>;
        }>>;
        audioAssets: import("@box/mudb/schema").MuDictionary<MuStruct<{
            type: import("@box/mudb/schema").MuSchema<import("@box/schema/group-project/rda").AssetType>;
            hash: MuASCII;
            size: import("@box/mudb/schema").MuVarint;
            previewImage: MuASCII;
            id: MuASCII;
            updateAt: import("@box/mudb/schema").MuFloat64;
        }>>;
        pictureAssets: import("@box/mudb/schema").MuDictionary<MuStruct<{
            type: import("@box/mudb/schema").MuSchema<import("@box/schema/group-project/rda").AssetType>;
            hash: MuASCII;
            size: import("@box/mudb/schema").MuVarint;
            previewImage: MuASCII;
            id: MuASCII;
            updateAt: import("@box/mudb/schema").MuFloat64;
        }>>;
        type: import("@box/mudb/schema").MuUTF8;
        version: import("@box/mudb/schema").MuUTF8;
        prevHash: MuASCII;
        timestamp: import("@box/mudb/schema").MuDate;
        storageMode: import("@box/mudb/schema").MuUTF8;
        features: MuStruct<{
            enableTriggerAPI: import("@box/mudb/schema").MuBoolean;
        }>;
        info: MuStruct<{
            displayName: import("@box/mudb/schema").MuUTF8;
            description: import("@box/mudb/schema").MuUTF8;
            previewImage: MuASCII;
            bannerImages: MuArray<MuASCII>;
            notice: import("@box/mudb/schema").MuUTF8;
            isNeverChangeDisplayName: import("@box/mudb/schema").MuBoolean;
        }>;
        voxels: MuStruct<{
            shape: MuStruct<{
                x: import("@box/mudb/schema").MuUint16;
                y: import("@box/mudb/schema").MuUint16;
                z: import("@box/mudb/schema").MuUint16;
            }>;
            chunks: MuArray<MuASCII>;
        }>;
        environment: MuStruct<{
            fog: MuStruct<{
                fogColor: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                fogStartDistance: import("@box/mudb/schema").MuFloat64;
                fogHeightOffset: import("@box/mudb/schema").MuFloat64;
                fogHeightFalloff: import("@box/mudb/schema").MuFloat64;
                fogDensity: import("@box/mudb/schema").MuFloat64;
                maxFog: import("@box/mudb/schema").MuFloat64;
            }>;
            sky: MuStruct<{
                skyType: import("@box/mudb/schema").MuSchema<import("@box/schema/project/project-rda").EnvironmentSkyType>;
                globalLight: import("@box/mudb/schema").MuFloat64;
                sunPhase: import("@box/mudb/schema").MuFloat64;
                sunFrequency: import("@box/mudb/schema").MuFloat64;
                lunarPhase: import("@box/mudb/schema").MuFloat64;
                sunDirection: MuStruct<{
                    x: import("@box/mudb/schema").MuFloat64;
                    y: import("@box/mudb/schema").MuFloat64;
                    z: import("@box/mudb/schema").MuFloat64;
                }>;
                sunColor: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyLeft: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyRight: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyTop: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyBottom: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyFront: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyBack: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                gamma: import("@box/mudb/schema").MuFloat32;
            }>;
            snow: MuStruct<{
                texture: import("@box/mudb/schema").MuUTF8;
                density: import("@box/mudb/schema").MuFloat64;
                size: MuStruct<{
                    w: import("@box/mudb/schema").MuFloat64;
                    h: import("@box/mudb/schema").MuFloat64;
                }>;
                fallSpeed: import("@box/mudb/schema").MuFloat64;
                spinSpeed: import("@box/mudb/schema").MuFloat64;
                color: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                    a: import("@box/mudb/schema").MuFloat64;
                }>;
            }>;
            rain: MuStruct<{
                density: import("@box/mudb/schema").MuFloat64;
                direction: MuStruct<{
                    x: import("@box/mudb/schema").MuFloat64;
                    y: import("@box/mudb/schema").MuFloat64;
                    z: import("@box/mudb/schema").MuFloat64;
                }>;
                speed: import("@box/mudb/schema").MuFloat64;
                size: MuStruct<{
                    w: import("@box/mudb/schema").MuFloat64;
                    h: import("@box/mudb/schema").MuFloat64;
                }>;
                interference: import("@box/mudb/schema").MuFloat64;
                color: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                    a: import("@box/mudb/schema").MuFloat64;
                }>;
            }>;
            drawDistance: import("@box/mudb/schema").MuFloat32;
            bakedShadow: MuStruct<{
                texture: MuASCII;
                data: MuASCII;
                chunkShift: import("@box/mudb/schema").MuVarint;
            }>;
        }>;
        ambientSound: MuStruct<{
            ambient: MuStruct<{
                sample: import("@box/mudb/schema").MuUTF8;
                radius: import("@box/mudb/schema").MuFloat32;
                pitch: import("@box/mudb/schema").MuFloat32;
                pitchRange: import("@box/mudb/schema").MuFloat32;
                gain: import("@box/mudb/schema").MuFloat32;
                gainRange: import("@box/mudb/schema").MuFloat32;
            }>;
            breakVoxel: MuStruct<{
                sample: import("@box/mudb/schema").MuUTF8;
                radius: import("@box/mudb/schema").MuFloat32;
                pitch: import("@box/mudb/schema").MuFloat32;
                pitchRange: import("@box/mudb/schema").MuFloat32;
                gain: import("@box/mudb/schema").MuFloat32;
                gainRange: import("@box/mudb/schema").MuFloat32;
            }>;
            placeVoxel: MuStruct<{
                sample: import("@box/mudb/schema").MuUTF8;
                radius: import("@box/mudb/schema").MuFloat32;
                pitch: import("@box/mudb/schema").MuFloat32;
                pitchRange: import("@box/mudb/schema").MuFloat32;
                gain: import("@box/mudb/schema").MuFloat32;
                gainRange: import("@box/mudb/schema").MuFloat32;
            }>;
            playerJoin: MuStruct<{
                sample: import("@box/mudb/schema").MuUTF8;
                radius: import("@box/mudb/schema").MuFloat32;
                pitch: import("@box/mudb/schema").MuFloat32;
                pitchRange: import("@box/mudb/schema").MuFloat32;
                gain: import("@box/mudb/schema").MuFloat32;
                gainRange: import("@box/mudb/schema").MuFloat32;
            }>;
            playerLeave: MuStruct<{
                sample: import("@box/mudb/schema").MuUTF8;
                radius: import("@box/mudb/schema").MuFloat32;
                pitch: import("@box/mudb/schema").MuFloat32;
                pitchRange: import("@box/mudb/schema").MuFloat32;
                gain: import("@box/mudb/schema").MuFloat32;
                gainRange: import("@box/mudb/schema").MuFloat32;
            }>;
        }>;
        physics: MuStruct<{
            gravity: import("@box/mudb/schema").MuFloat64;
            velocityDamping: import("@box/mudb/schema").MuFloat64;
            useOBB: import("@box/mudb/schema").MuBoolean;
        }>;
        collisionFilter: MuArray<MuStruct<{
            selectorA: import("@box/mudb/schema").MuUTF8;
            selectorB: import("@box/mudb/schema").MuUTF8;
        }>>;
        player: MuStruct<{
            cameraType: MuASCII;
            scale: import("@box/mudb/schema").MuFloat64;
            colorLUT: import("@box/mudb/schema").MuUTF8;
            initialPosition: MuStruct<{
                x: import("@box/mudb/schema").MuFloat64;
                y: import("@box/mudb/schema").MuFloat64;
                z: import("@box/mudb/schema").MuFloat64;
            }>;
            initialYaw: import("@box/mudb/schema").MuFloat32;
            movementBounds: MuStruct<{
                lo: MuStruct<{
                    x: import("@box/mudb/schema").MuFloat64;
                    y: import("@box/mudb/schema").MuFloat64;
                    z: import("@box/mudb/schema").MuFloat64;
                }>;
                hi: MuStruct<{
                    x: import("@box/mudb/schema").MuFloat64;
                    y: import("@box/mudb/schema").MuFloat64;
                    z: import("@box/mudb/schema").MuFloat64;
                }>;
            }>;
            allowFlight: import("@box/mudb/schema").MuBoolean;
            allowMove: import("@box/mudb/schema").MuBoolean;
            allowAction0: import("@box/mudb/schema").MuBoolean;
            allowAction1: import("@box/mudb/schema").MuBoolean;
            allowJump: import("@box/mudb/schema").MuBoolean;
            allowDoubleJump: import("@box/mudb/schema").MuBoolean;
            allowCrouch: import("@box/mudb/schema").MuBoolean;
            noClip: import("@box/mudb/schema").MuBoolean;
            walkSpeed: import("@box/mudb/schema").MuFloat32;
            walkAcceleration: import("@box/mudb/schema").MuFloat32;
            runSpeed: import("@box/mudb/schema").MuFloat32;
            runAcceleration: import("@box/mudb/schema").MuFloat32;
            crouchSpeed: import("@box/mudb/schema").MuFloat32;
            crouchAcceleration: import("@box/mudb/schema").MuFloat32;
            swimSpeed: import("@box/mudb/schema").MuFloat32;
            swimAcceleration: import("@box/mudb/schema").MuFloat32;
            flySpeed: import("@box/mudb/schema").MuFloat32;
            flyAcceleration: import("@box/mudb/schema").MuFloat32;
            jumpSpeedFactor: import("@box/mudb/schema").MuFloat32;
            jumpAccelerationFactor: import("@box/mudb/schema").MuFloat32;
            jumpPower: import("@box/mudb/schema").MuFloat32;
            doubleJumpPower: import("@box/mudb/schema").MuFloat32;
            mass: import("@box/mudb/schema").MuFloat64;
            friction: import("@box/mudb/schema").MuFloat64;
            restitution: import("@box/mudb/schema").MuFloat64;
            color: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
            emissive: import("@box/mudb/schema").MuQuantizedFloat;
            shininess: import("@box/mudb/schema").MuQuantizedFloat;
            metalness: import("@box/mudb/schema").MuQuantizedFloat;
            invisible: import("@box/mudb/schema").MuBoolean;
            showName: import("@box/mudb/schema").MuBoolean;
            showIndicator: import("@box/mudb/schema").MuBoolean;
            damage: MuStruct<{
                enabled: import("@box/mudb/schema").MuBoolean;
                showHealth: import("@box/mudb/schema").MuBoolean;
                showDamage: import("@box/mudb/schema").MuBoolean;
                hp: import("@box/mudb/schema").MuVarint;
                maxHp: import("@box/mudb/schema").MuVarint;
            }>;
            sounds: MuStruct<{
                chat: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                hurt: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                die: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                interact: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
            }>;
            playerSounds: MuStruct<{
                spawn: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                jump: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                doubleJump: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                land: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                crouch: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                step: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                action0: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                action1: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                swim: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                enterWater: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                leaveWater: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                startFly: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                endFly: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                music: MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
            }>;
        }>;
        entitiesTree: import("@box/mudb/schema").MuDictionary<MuStruct<{
            id: MuASCII;
            type: import("@box/mudb/schema").MuSchema<import("@box/schema/project/murda-tree").TreeNodeType>;
            name: import("@box/mudb/schema").MuUTF8;
            parentId: MuASCII;
            childrenIds: MuArray<MuASCII>;
            value: import("@box/mudb/schema").MuOption<MuStruct<{
                name: import("@box/mudb/schema").MuUTF8;
                tags: MuArray<import("@box/mudb/schema").MuUTF8>;
                editLock: import("@box/mudb/schema").MuBoolean;
                staticShadow: import("@box/mudb/schema").MuBoolean;
                position: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                collision: import("@box/mudb/schema").MuBoolean;
                gravity: import("@box/mudb/schema").MuBoolean;
                fixed: import("@box/mudb/schema").MuBoolean;
                mass: import("@box/mudb/schema").MuFloat64;
                friction: import("@box/mudb/schema").MuFloat64;
                restitution: import("@box/mudb/schema").MuFloat64;
                bounds: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
                meshId: import("@box/mudb/schema").MuFloat64;
                mesh: import("@box/mudb/schema").MuUTF8;
                scale: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                orientation: import("@box/mudb/schema").MuSchema<import("gl-matrix").quat>;
                tint: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec4>;
                metalness: import("@box/mudb/schema").MuFloat64;
                shininess: import("@box/mudb/schema").MuFloat64;
                emissive: import("@box/mudb/schema").MuFloat64;
                defaultMotionId: MuASCII;
                particle: MuStruct<{
                    rate: import("@box/mudb/schema").MuFloat64;
                    rateSpread: import("@box/mudb/schema").MuFloat64;
                    limit: import("@box/mudb/schema").MuVarint;
                    lifetime: import("@box/mudb/schema").MuFloat64;
                    lifetimeSpread: import("@box/mudb/schema").MuFloat64;
                    color0: MuStruct<{
                        r: import("@box/mudb/schema").MuFloat64;
                        g: import("@box/mudb/schema").MuFloat64;
                        b: import("@box/mudb/schema").MuFloat64;
                    }>;
                    color1: MuStruct<{
                        r: import("@box/mudb/schema").MuFloat64;
                        g: import("@box/mudb/schema").MuFloat64;
                        b: import("@box/mudb/schema").MuFloat64;
                    }>;
                    color2: MuStruct<{
                        r: import("@box/mudb/schema").MuFloat64;
                        g: import("@box/mudb/schema").MuFloat64;
                        b: import("@box/mudb/schema").MuFloat64;
                    }>;
                    color3: MuStruct<{
                        r: import("@box/mudb/schema").MuFloat64;
                        g: import("@box/mudb/schema").MuFloat64;
                        b: import("@box/mudb/schema").MuFloat64;
                    }>;
                    color4: MuStruct<{
                        r: import("@box/mudb/schema").MuFloat64;
                        g: import("@box/mudb/schema").MuFloat64;
                        b: import("@box/mudb/schema").MuFloat64;
                    }>;
                    size0: import("@box/mudb/schema").MuFloat32;
                    size1: import("@box/mudb/schema").MuFloat32;
                    size2: import("@box/mudb/schema").MuFloat32;
                    size3: import("@box/mudb/schema").MuFloat32;
                    size4: import("@box/mudb/schema").MuFloat32;
                    sizeSpread: import("@box/mudb/schema").MuFloat64;
                    velocity: MuStruct<{
                        x: import("@box/mudb/schema").MuFloat64;
                        y: import("@box/mudb/schema").MuFloat64;
                        z: import("@box/mudb/schema").MuFloat64;
                    }>;
                    velocitySpread: MuStruct<{
                        x: import("@box/mudb/schema").MuFloat64;
                        y: import("@box/mudb/schema").MuFloat64;
                        z: import("@box/mudb/schema").MuFloat64;
                    }>;
                    acceleration: MuStruct<{
                        x: import("@box/mudb/schema").MuFloat64;
                        y: import("@box/mudb/schema").MuFloat64;
                        z: import("@box/mudb/schema").MuFloat64;
                    }>;
                    damping: import("@box/mudb/schema").MuFloat64;
                    noiseAmpl: import("@box/mudb/schema").MuFloat64;
                    noiseFreq: import("@box/mudb/schema").MuFloat64;
                }>;
                damage: MuStruct<{
                    enabled: import("@box/mudb/schema").MuBoolean;
                    showHealth: import("@box/mudb/schema").MuBoolean;
                    showDamage: import("@box/mudb/schema").MuBoolean;
                    hp: import("@box/mudb/schema").MuVarint;
                    maxHp: import("@box/mudb/schema").MuVarint;
                }>;
                sound: MuStruct<{
                    chat: MuStruct<{
                        sample: import("@box/mudb/schema").MuUTF8;
                        radius: import("@box/mudb/schema").MuFloat32;
                        pitch: import("@box/mudb/schema").MuFloat32;
                        pitchRange: import("@box/mudb/schema").MuFloat32;
                        gain: import("@box/mudb/schema").MuFloat32;
                        gainRange: import("@box/mudb/schema").MuFloat32;
                    }>;
                    hurt: MuStruct<{
                        sample: import("@box/mudb/schema").MuUTF8;
                        radius: import("@box/mudb/schema").MuFloat32;
                        pitch: import("@box/mudb/schema").MuFloat32;
                        pitchRange: import("@box/mudb/schema").MuFloat32;
                        gain: import("@box/mudb/schema").MuFloat32;
                        gainRange: import("@box/mudb/schema").MuFloat32;
                    }>;
                    die: MuStruct<{
                        sample: import("@box/mudb/schema").MuUTF8;
                        radius: import("@box/mudb/schema").MuFloat32;
                        pitch: import("@box/mudb/schema").MuFloat32;
                        pitchRange: import("@box/mudb/schema").MuFloat32;
                        gain: import("@box/mudb/schema").MuFloat32;
                        gainRange: import("@box/mudb/schema").MuFloat32;
                    }>;
                    interact: MuStruct<{
                        sample: import("@box/mudb/schema").MuUTF8;
                        radius: import("@box/mudb/schema").MuFloat32;
                        pitch: import("@box/mudb/schema").MuFloat32;
                        pitchRange: import("@box/mudb/schema").MuFloat32;
                        gain: import("@box/mudb/schema").MuFloat32;
                        gainRange: import("@box/mudb/schema").MuFloat32;
                    }>;
                }>;
            }>>;
        }>>;
        scriptIndex: import("@box/mudb/schema").MuUTF8;
        zones: MuArray<MuStruct<{
            bounds: MuStruct<{
                lox: import("@box/mudb/schema").MuFloat64;
                loy: import("@box/mudb/schema").MuFloat64;
                loz: import("@box/mudb/schema").MuFloat64;
                hix: import("@box/mudb/schema").MuFloat64;
                hiy: import("@box/mudb/schema").MuFloat64;
                hiz: import("@box/mudb/schema").MuFloat64;
            }>;
            selector: import("@box/mudb/schema").MuUTF8;
            massScale: import("@box/mudb/schema").MuFloat64;
            force: MuStruct<{
                x: import("@box/mudb/schema").MuFloat64;
                y: import("@box/mudb/schema").MuFloat64;
                z: import("@box/mudb/schema").MuFloat64;
            }>;
            overrideFog: import("@box/mudb/schema").MuBoolean;
            fog: MuStruct<{
                fogColor: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                fogStartDistance: import("@box/mudb/schema").MuFloat64;
                fogHeightOffset: import("@box/mudb/schema").MuFloat64;
                fogHeightFalloff: import("@box/mudb/schema").MuFloat64;
                fogDensity: import("@box/mudb/schema").MuFloat64;
                maxFog: import("@box/mudb/schema").MuFloat64;
            }>;
            overrideSky: import("@box/mudb/schema").MuBoolean;
            sky: MuStruct<{
                skyType: import("@box/mudb/schema").MuSchema<import("@box/schema/project/project-rda").EnvironmentSkyType>;
                globalLight: import("@box/mudb/schema").MuFloat64;
                sunPhase: import("@box/mudb/schema").MuFloat64;
                sunFrequency: import("@box/mudb/schema").MuFloat64;
                lunarPhase: import("@box/mudb/schema").MuFloat64;
                sunDirection: MuStruct<{
                    x: import("@box/mudb/schema").MuFloat64;
                    y: import("@box/mudb/schema").MuFloat64;
                    z: import("@box/mudb/schema").MuFloat64;
                }>;
                sunColor: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyLeft: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyRight: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyTop: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyBottom: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyFront: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyBack: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                gamma: import("@box/mudb/schema").MuFloat32;
            }>;
            overrideSnow: import("@box/mudb/schema").MuBoolean;
            snow: MuStruct<{
                texture: import("@box/mudb/schema").MuUTF8;
                density: import("@box/mudb/schema").MuFloat64;
                size: MuStruct<{
                    w: import("@box/mudb/schema").MuFloat64;
                    h: import("@box/mudb/schema").MuFloat64;
                }>;
                fallSpeed: import("@box/mudb/schema").MuFloat64;
                spinSpeed: import("@box/mudb/schema").MuFloat64;
                color: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                    a: import("@box/mudb/schema").MuFloat64;
                }>;
            }>;
            overrideRain: import("@box/mudb/schema").MuBoolean;
            rain: MuStruct<{
                density: import("@box/mudb/schema").MuFloat64;
                direction: MuStruct<{
                    x: import("@box/mudb/schema").MuFloat64;
                    y: import("@box/mudb/schema").MuFloat64;
                    z: import("@box/mudb/schema").MuFloat64;
                }>;
                speed: import("@box/mudb/schema").MuFloat64;
                size: MuStruct<{
                    w: import("@box/mudb/schema").MuFloat64;
                    h: import("@box/mudb/schema").MuFloat64;
                }>;
                interference: import("@box/mudb/schema").MuFloat64;
                color: MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                    a: import("@box/mudb/schema").MuFloat64;
                }>;
            }>;
        }>>;
        gamepad: MuStruct<{
            joystick: MuStruct<{
                background: import("@box/mudb/schema").MuUTF8;
                controller: import("@box/mudb/schema").MuUTF8;
            }>;
            fly: MuStruct<{
                button: import("@box/mudb/schema").MuUTF8;
                flyingController: import("@box/mudb/schema").MuUTF8;
                flyingBackground: import("@box/mudb/schema").MuUTF8;
            }>;
            buttons: MuStruct<{
                jump: import("@box/mudb/schema").MuUTF8;
                crouch: import("@box/mudb/schema").MuUTF8;
                actionA: import("@box/mudb/schema").MuUTF8;
                actionB: import("@box/mudb/schema").MuUTF8;
            }>;
        }>;
        assets: import("@box/mudb/schema").MuDictionary<MuStruct<{
            type: import("@box/mudb/schema").MuSchema<import("@box/schema/group-project/rda").AssetType>;
            hash: MuASCII;
            size: import("@box/mudb/schema").MuVarint;
            previewImage: MuASCII;
            ownerId: import("@box/mudb/schema").MuVarint;
            contentId: import("@box/mudb/schema").MuFloat64;
            bounds: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
            animated: import("@box/mudb/schema").MuBoolean;
        }>>;
        deleteAssets: MuArray<MuStruct<{
            key: import("@box/mudb/schema").MuUTF8;
            value: MuStruct<{
                type: import("@box/mudb/schema").MuSchema<import("@box/schema/group-project/rda").AssetType>;
                hash: MuASCII;
                size: import("@box/mudb/schema").MuVarint;
                previewImage: MuASCII;
                ownerId: import("@box/mudb/schema").MuVarint;
                contentId: import("@box/mudb/schema").MuFloat64;
                bounds: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
                animated: import("@box/mudb/schema").MuBoolean;
            }>;
        }>>;
        committerId: import("@box/mudb/schema").MuVarint;
        defaultScreenId: import("@box/mudb/schema").MuUTF8;
    }>;
    permissions: MuStruct<{
        type: import("@box/mudb/schema").MuUTF8;
        version: MuASCII;
        prevHash: MuASCII;
        timestamp: import("@box/mudb/schema").MuDate;
        versionControl: MuStruct<{
            branches: import("@box/mudb/schema").MuDictionary<MuStruct<{
                name: import("@box/mudb/schema").MuUTF8;
                headHash: MuASCII;
            }>>;
            currentBranch: import("@box/mudb/schema").MuUTF8;
        }>;
        groups: import("@box/mudb/schema").MuDictionary<MuStruct<{
            permissions: MuStruct<{
                publish: import("@box/mudb/schema").MuBoolean;
                playButton: import("@box/mudb/schema").MuBoolean;
                debugger: import("@box/mudb/schema").MuBoolean;
                editScripts: import("@box/mudb/schema").MuBoolean;
                editProject: import("@box/mudb/schema").MuBoolean;
                editModel: import("@box/mudb/schema").MuBoolean;
                editScene: import("@box/mudb/schema").MuBoolean;
                editFile: import("@box/mudb/schema").MuBoolean;
                editHierarchy: import("@box/mudb/schema").MuBoolean;
                editVoxels: import("@box/mudb/schema").MuBoolean;
                editPermissions: import("@box/mudb/schema").MuBoolean;
                versionControl: import("@box/mudb/schema").MuBoolean;
                chatEnabled: import("@box/mudb/schema").MuBoolean;
                editMarket: import("@box/mudb/schema").MuBoolean;
                editStatisticsData: import("@box/mudb/schema").MuBoolean;
                editPublish: import("@box/mudb/schema").MuBoolean;
                editPlayer: import("@box/mudb/schema").MuBoolean;
            }>;
            members: import("@box/mudb/schema").MuDictionary<MuStruct<{
                addedAt: import("@box/mudb/schema").MuDate;
            }>>;
            defaultGroup: import("@box/mudb/schema").MuBoolean;
        }>>;
        users: import("@box/mudb/schema").MuDictionary<MuStruct<{
            createdAt: import("@box/mudb/schema").MuDate;
        }>>;
        collaborators: MuArray<import("@box/mudb/schema").MuUTF8>;
        owner: import("@box/mudb/schema").MuUTF8;
        accessLevel: import("@box/mudb/schema").MuSchema<import("@box/schema/permissions/permission-rda").PermissionAccessLevel>;
        banned: import("@box/mudb/schema").MuDictionary<MuStruct<{
            reason: import("@box/mudb/schema").MuUTF8;
            bannedBy: import("@box/mudb/schema").MuUTF8;
        }>>;
    }>;
    extraProjectInfo: MuStruct<{
        meshAssets: import("@box/mudb/schema").MuDictionary<MuStruct<{
            modelId: import("@box/mudb/schema").MuFloat64;
            hash: MuASCII;
            modelPreviewHash: MuASCII;
            animated: import("@box/mudb/schema").MuBoolean;
            updatedAt: MuASCII;
        }>>;
        skinAssets: import("@box/mudb/schema").MuDictionary<MuStruct<{
            hash: MuASCII;
        }>>;
        defaultSkinName: import("@box/mudb/schema").MuUTF8;
        scriptAssets: import("@box/mudb/schema").MuDictionary<MuStruct<{
            hash: MuASCII;
            name: import("@box/mudb/schema").MuUTF8;
            isClient: import("@box/mudb/schema").MuBoolean;
            isShare: import("@box/mudb/schema").MuBoolean;
            order: import("@box/mudb/schema").MuInt32;
            lockedMapTitle: import("@box/mudb/schema").MuUTF8;
            lockedMapId: import("@box/mudb/schema").MuUint32;
            id: import("@box/mudb/schema").MuUTF8;
        }>>;
    }>;
    permissionsHash: MuASCII;
    projectHash: MuASCII;
}>;
export type PrebakeCache = typeof PrebakeCacheSchema.identity;
//# sourceMappingURL=prebake-schema.d.ts.map