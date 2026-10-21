import { BuildSystemAPI } from '../type';
import * as Cold from '@box/schema/project/project-rda';
import * as Hot from '@box/schema/project/hot-schema';
import { ContentServer } from '@box/content-server';
import { MuSchema } from '@box/mudb/schema';
import { TreeNodeType } from '@box/schema/project/murda-tree';
export declare function copySoundAssets(hp: Hot.HotProject): void;
export type RuntimeMeshInfo = {
    hash: string;
    path: string;
    bounds: [number, number, number];
    motionIds: string[];
};
/**
 * An imported cloud project can contain a dangling model-library entry whose
 * hash was never saved. Do not pass an empty value into migrateVoxel: there is
 * no resource to migrate, and failing the complete prebake makes an otherwise
 * playable map permanently unavailable.
 */
export declare function hasRuntimeAssetHash(hash: unknown): hash is string;
/**
 * A local project model and its VOXA source can legitimately have the same
 * numeric model id. The entity path is authoritative in that case. Falling
 * back to model id preserves Boxes' rename/migration behaviour for legacy
 * entities whose old path no longer exists.
 */
export declare function resolveSeedMeshInfo(meshPath: string, meshId: number, meshAssets: Hot.HotProject['meshAssets'], meshIdSetCache: {
    [id: number]: RuntimeMeshInfo;
}): RuntimeMeshInfo | undefined;
export declare class ProjectBakeCache {
    blockInfoHash: string;
    content: ContentServer;
    build: BuildSystemAPI;
    meshIdSetCache: {
        [id: number]: RuntimeMeshInfo;
    };
    private _meshInfoCache;
    private _blockInfoCache;
    private _pictureInfoCache;
    private _skinInfoCache;
    constructor(content: ContentServer, build: BuildSystemAPI, blockInfoHash: string);
    destroy(): void;
    getMeshInfo(hash: string, type: Cold.AssetType): Promise<Hot.MeshAssetInfo>;
    private _retrieveImageBounds;
    private _retrieveVoxelMetaData;
    private retrieveGLTFMetaData;
    private _getPicture;
    private _getSkinAsset;
    private _getBlockInfo;
    bake(cold: Cold.ProjectInfo, extra: Hot.ExtraProjectInfo, hp_?: Hot.HotProject): Promise<import("@box/mudb/schema/struct").Struct<{
        version: import("@box/mudb/schema").MuASCII;
        name: import("@box/mudb/schema").MuUTF8;
        blockInfoHash: import("@box/mudb/schema").MuASCII;
        blockInfo: import("@box/mudb/schema").MuStruct<{
            ids: import("@box/schema/utils/relative-array").RelativeArray<import("@box/mudb/schema").MuRelativeVarint>;
            names: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUTF8>;
            emissive: import("@box/schema/utils/relative-array").RelativeArray<import("@box/mudb/schema").MuVarint>;
            texture: import("@box/schema/utils/relative-array").RelativeArray<import("@box/mudb/schema").MuRelativeVarint>;
            animLength: import("@box/schema/utils/relative-array").RelativeArray<import("@box/mudb/schema").MuVarint>;
            friction: import("@box/schema/utils/relative-array").RelativeArray<import("@box/mudb/schema").MuQuantizedFloat>;
            restitution: import("@box/schema/utils/relative-array").RelativeArray<import("@box/mudb/schema").MuQuantizedFloat>;
            velocity: import("@box/schema/utils/relative-array").RelativeArray<import("@box/mudb/schema").MuFloat32>;
            fluids: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuVarint;
                info: import("@box/mudb/schema").MuUint32;
                mass: import("@box/mudb/schema").MuFloat64;
            }>>;
            category: import("@box/mudb/schema").MuDictionary<import("@box/schema/utils/relative-array").RelativeArray<import("@box/mudb/schema").MuRelativeVarint>>;
            atlasRadius: import("@box/mudb/schema").MuVarint;
            blockBumpShift: import("@box/mudb/schema").MuVarint;
            blockColorShift: import("@box/mudb/schema").MuVarint;
            colorAtlas: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
            materialAtlas: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
            bumpAtlas: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
        }>;
        environment: import("@box/mudb/schema").MuStruct<{
            fog: import("@box/mudb/schema").MuStruct<{
                fogColor: import("@box/mudb/schema").MuStruct<{
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
            sky: import("@box/mudb/schema").MuStruct<{
                skyType: MuSchema<Cold.EnvironmentSkyType>;
                globalLight: import("@box/mudb/schema").MuFloat64;
                sunPhase: import("@box/mudb/schema").MuFloat64;
                sunFrequency: import("@box/mudb/schema").MuFloat64;
                lunarPhase: import("@box/mudb/schema").MuFloat64;
                sunDirection: import("@box/mudb/schema").MuStruct<{
                    x: import("@box/mudb/schema").MuFloat64;
                    y: import("@box/mudb/schema").MuFloat64;
                    z: import("@box/mudb/schema").MuFloat64;
                }>;
                sunColor: import("@box/mudb/schema").MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyLeft: import("@box/mudb/schema").MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyRight: import("@box/mudb/schema").MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyTop: import("@box/mudb/schema").MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyBottom: import("@box/mudb/schema").MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyFront: import("@box/mudb/schema").MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyBack: import("@box/mudb/schema").MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                gamma: import("@box/mudb/schema").MuFloat32;
            }>;
            snow: import("@box/mudb/schema").MuStruct<{
                texture: import("@box/mudb/schema").MuUTF8;
                density: import("@box/mudb/schema").MuFloat64;
                size: import("@box/mudb/schema").MuStruct<{
                    w: import("@box/mudb/schema").MuFloat64;
                    h: import("@box/mudb/schema").MuFloat64;
                }>;
                fallSpeed: import("@box/mudb/schema").MuFloat64;
                spinSpeed: import("@box/mudb/schema").MuFloat64;
                color: import("@box/mudb/schema").MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                    a: import("@box/mudb/schema").MuFloat64;
                }>;
            }>;
            rain: import("@box/mudb/schema").MuStruct<{
                density: import("@box/mudb/schema").MuFloat64;
                direction: import("@box/mudb/schema").MuStruct<{
                    x: import("@box/mudb/schema").MuFloat64;
                    y: import("@box/mudb/schema").MuFloat64;
                    z: import("@box/mudb/schema").MuFloat64;
                }>;
                speed: import("@box/mudb/schema").MuFloat64;
                size: import("@box/mudb/schema").MuStruct<{
                    w: import("@box/mudb/schema").MuFloat64;
                    h: import("@box/mudb/schema").MuFloat64;
                }>;
                interference: import("@box/mudb/schema").MuFloat64;
                color: import("@box/mudb/schema").MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                    a: import("@box/mudb/schema").MuFloat64;
                }>;
            }>;
            drawDistance: import("@box/mudb/schema").MuFloat32;
            bakedShadow: import("@box/mudb/schema").MuStruct<{
                texture: import("@box/mudb/schema").MuASCII;
                data: import("@box/mudb/schema").MuASCII;
                chunkShift: import("@box/mudb/schema").MuVarint;
            }>;
        }>;
        physics: import("@box/mudb/schema").MuStruct<{
            gravity: import("@box/mudb/schema").MuFloat64;
            velocityDamping: import("@box/mudb/schema").MuFloat64;
            useOBB: import("@box/mudb/schema").MuBoolean;
        }>;
        player: import("@box/mudb/schema").MuStruct<{
            cameraType: import("@box/mudb/schema").MuASCII;
            scale: import("@box/mudb/schema").MuFloat64;
            colorLUT: import("@box/mudb/schema").MuUTF8;
            initialPosition: import("@box/mudb/schema").MuStruct<{
                x: import("@box/mudb/schema").MuFloat64;
                y: import("@box/mudb/schema").MuFloat64;
                z: import("@box/mudb/schema").MuFloat64;
            }>;
            initialYaw: import("@box/mudb/schema").MuFloat32;
            movementBounds: import("@box/mudb/schema").MuStruct<{
                lo: import("@box/mudb/schema").MuStruct<{
                    x: import("@box/mudb/schema").MuFloat64;
                    y: import("@box/mudb/schema").MuFloat64;
                    z: import("@box/mudb/schema").MuFloat64;
                }>;
                hi: import("@box/mudb/schema").MuStruct<{
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
            damage: import("@box/mudb/schema").MuStruct<{
                enabled: import("@box/mudb/schema").MuBoolean;
                showHealth: import("@box/mudb/schema").MuBoolean;
                showDamage: import("@box/mudb/schema").MuBoolean;
                hp: import("@box/mudb/schema").MuVarint;
                maxHp: import("@box/mudb/schema").MuVarint;
            }>;
            sounds: import("@box/mudb/schema").MuStruct<{
                chat: import("@box/mudb/schema").MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                hurt: import("@box/mudb/schema").MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                die: import("@box/mudb/schema").MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                interact: import("@box/mudb/schema").MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
            }>;
            playerSounds: import("@box/mudb/schema").MuStruct<{
                spawn: import("@box/mudb/schema").MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                jump: import("@box/mudb/schema").MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                doubleJump: import("@box/mudb/schema").MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                land: import("@box/mudb/schema").MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                crouch: import("@box/mudb/schema").MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                step: import("@box/mudb/schema").MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                action0: import("@box/mudb/schema").MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                action1: import("@box/mudb/schema").MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                swim: import("@box/mudb/schema").MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                enterWater: import("@box/mudb/schema").MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                leaveWater: import("@box/mudb/schema").MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                startFly: import("@box/mudb/schema").MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                endFly: import("@box/mudb/schema").MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                music: import("@box/mudb/schema").MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
            }>;
        }>;
        voxels: import("@box/mudb/schema").MuStruct<{
            shape: import("@box/mudb/schema").MuStruct<{
                x: import("@box/mudb/schema").MuUint16;
                y: import("@box/mudb/schema").MuUint16;
                z: import("@box/mudb/schema").MuUint16;
            }>;
            chunks: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
        }>;
        seeds: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            name: import("@box/mudb/schema").MuUTF8;
            tags: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUTF8>;
            editLock: import("@box/mudb/schema").MuBoolean;
            staticShadow: import("@box/mudb/schema").MuBoolean;
            position: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
            collision: import("@box/mudb/schema").MuBoolean;
            gravity: import("@box/mudb/schema").MuBoolean;
            fixed: import("@box/mudb/schema").MuBoolean;
            mass: import("@box/mudb/schema").MuFloat64;
            friction: import("@box/mudb/schema").MuFloat64;
            restitution: import("@box/mudb/schema").MuFloat64;
            bounds: MuSchema<import("gl-matrix").vec3>;
            meshId: import("@box/mudb/schema").MuFloat64;
            mesh: import("@box/mudb/schema").MuUTF8;
            scale: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
            orientation: MuSchema<import("gl-matrix").quat>;
            tint: MuSchema<import("gl-matrix").vec4>;
            metalness: import("@box/mudb/schema").MuFloat64;
            shininess: import("@box/mudb/schema").MuFloat64;
            emissive: import("@box/mudb/schema").MuFloat64;
            defaultMotionId: import("@box/mudb/schema").MuASCII;
            particle: import("@box/mudb/schema").MuStruct<{
                rate: import("@box/mudb/schema").MuFloat64;
                rateSpread: import("@box/mudb/schema").MuFloat64;
                limit: import("@box/mudb/schema").MuVarint;
                lifetime: import("@box/mudb/schema").MuFloat64;
                lifetimeSpread: import("@box/mudb/schema").MuFloat64;
                color0: import("@box/mudb/schema").MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                color1: import("@box/mudb/schema").MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                color2: import("@box/mudb/schema").MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                color3: import("@box/mudb/schema").MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                color4: import("@box/mudb/schema").MuStruct<{
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
                velocity: import("@box/mudb/schema").MuStruct<{
                    x: import("@box/mudb/schema").MuFloat64;
                    y: import("@box/mudb/schema").MuFloat64;
                    z: import("@box/mudb/schema").MuFloat64;
                }>;
                velocitySpread: import("@box/mudb/schema").MuStruct<{
                    x: import("@box/mudb/schema").MuFloat64;
                    y: import("@box/mudb/schema").MuFloat64;
                    z: import("@box/mudb/schema").MuFloat64;
                }>;
                acceleration: import("@box/mudb/schema").MuStruct<{
                    x: import("@box/mudb/schema").MuFloat64;
                    y: import("@box/mudb/schema").MuFloat64;
                    z: import("@box/mudb/schema").MuFloat64;
                }>;
                damping: import("@box/mudb/schema").MuFloat64;
                noiseAmpl: import("@box/mudb/schema").MuFloat64;
                noiseFreq: import("@box/mudb/schema").MuFloat64;
            }>;
            damage: import("@box/mudb/schema").MuStruct<{
                enabled: import("@box/mudb/schema").MuBoolean;
                showHealth: import("@box/mudb/schema").MuBoolean;
                showDamage: import("@box/mudb/schema").MuBoolean;
                hp: import("@box/mudb/schema").MuVarint;
                maxHp: import("@box/mudb/schema").MuVarint;
            }>;
            sound: import("@box/mudb/schema").MuStruct<{
                chat: import("@box/mudb/schema").MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                hurt: import("@box/mudb/schema").MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                die: import("@box/mudb/schema").MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
                interact: import("@box/mudb/schema").MuStruct<{
                    sample: import("@box/mudb/schema").MuUTF8;
                    radius: import("@box/mudb/schema").MuFloat32;
                    pitch: import("@box/mudb/schema").MuFloat32;
                    pitchRange: import("@box/mudb/schema").MuFloat32;
                    gain: import("@box/mudb/schema").MuFloat32;
                    gainRange: import("@box/mudb/schema").MuFloat32;
                }>;
            }>;
        }>>;
        assets: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            type: MuSchema<Cold.AssetType>;
            hash: import("@box/mudb/schema").MuASCII;
            size: import("@box/mudb/schema").MuVarint;
            previewImage: import("@box/mudb/schema").MuASCII;
            ownerId: import("@box/mudb/schema").MuVarint;
            contentId: import("@box/mudb/schema").MuFloat64;
            bounds: MuSchema<import("gl-matrix").vec3>;
            animated: import("@box/mudb/schema").MuBoolean;
        }>>;
        audioAssets: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            type: MuSchema<Cold.AssetType>;
            hash: import("@box/mudb/schema").MuASCII;
            size: import("@box/mudb/schema").MuVarint;
            previewImage: import("@box/mudb/schema").MuASCII;
            id: import("@box/mudb/schema").MuASCII;
            updateAt: import("@box/mudb/schema").MuFloat64;
        }>>;
        sound: import("@box/mudb/schema").MuStruct<{
            ambient: import("@box/mudb/schema").MuStruct<{
                sample: import("@box/mudb/schema").MuUTF8;
                radius: import("@box/mudb/schema").MuFloat32;
                pitch: import("@box/mudb/schema").MuFloat32;
                pitchRange: import("@box/mudb/schema").MuFloat32;
                gain: import("@box/mudb/schema").MuFloat32;
                gainRange: import("@box/mudb/schema").MuFloat32;
            }>;
            breakVoxel: import("@box/mudb/schema").MuStruct<{
                sample: import("@box/mudb/schema").MuUTF8;
                radius: import("@box/mudb/schema").MuFloat32;
                pitch: import("@box/mudb/schema").MuFloat32;
                pitchRange: import("@box/mudb/schema").MuFloat32;
                gain: import("@box/mudb/schema").MuFloat32;
                gainRange: import("@box/mudb/schema").MuFloat32;
            }>;
            placeVoxel: import("@box/mudb/schema").MuStruct<{
                sample: import("@box/mudb/schema").MuUTF8;
                radius: import("@box/mudb/schema").MuFloat32;
                pitch: import("@box/mudb/schema").MuFloat32;
                pitchRange: import("@box/mudb/schema").MuFloat32;
                gain: import("@box/mudb/schema").MuFloat32;
                gainRange: import("@box/mudb/schema").MuFloat32;
            }>;
            playerJoin: import("@box/mudb/schema").MuStruct<{
                sample: import("@box/mudb/schema").MuUTF8;
                radius: import("@box/mudb/schema").MuFloat32;
                pitch: import("@box/mudb/schema").MuFloat32;
                pitchRange: import("@box/mudb/schema").MuFloat32;
                gain: import("@box/mudb/schema").MuFloat32;
                gainRange: import("@box/mudb/schema").MuFloat32;
            }>;
            playerLeave: import("@box/mudb/schema").MuStruct<{
                sample: import("@box/mudb/schema").MuUTF8;
                radius: import("@box/mudb/schema").MuFloat32;
                pitch: import("@box/mudb/schema").MuFloat32;
                pitchRange: import("@box/mudb/schema").MuFloat32;
                gain: import("@box/mudb/schema").MuFloat32;
                gainRange: import("@box/mudb/schema").MuFloat32;
            }>;
        }>;
        features: import("@box/mudb/schema").MuStruct<{
            enableTriggerAPI: import("@box/mudb/schema").MuBoolean;
        }>;
        zones: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            bounds: import("@box/mudb/schema").MuStruct<{
                lox: import("@box/mudb/schema").MuFloat64;
                loy: import("@box/mudb/schema").MuFloat64;
                loz: import("@box/mudb/schema").MuFloat64;
                hix: import("@box/mudb/schema").MuFloat64;
                hiy: import("@box/mudb/schema").MuFloat64;
                hiz: import("@box/mudb/schema").MuFloat64;
            }>;
            selector: import("@box/mudb/schema").MuUTF8;
            massScale: import("@box/mudb/schema").MuFloat64;
            force: import("@box/mudb/schema").MuStruct<{
                x: import("@box/mudb/schema").MuFloat64;
                y: import("@box/mudb/schema").MuFloat64;
                z: import("@box/mudb/schema").MuFloat64;
            }>;
            overrideFog: import("@box/mudb/schema").MuBoolean;
            fog: import("@box/mudb/schema").MuStruct<{
                fogColor: import("@box/mudb/schema").MuStruct<{
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
            sky: import("@box/mudb/schema").MuStruct<{
                skyType: MuSchema<Cold.EnvironmentSkyType>;
                globalLight: import("@box/mudb/schema").MuFloat64;
                sunPhase: import("@box/mudb/schema").MuFloat64;
                sunFrequency: import("@box/mudb/schema").MuFloat64;
                lunarPhase: import("@box/mudb/schema").MuFloat64;
                sunDirection: import("@box/mudb/schema").MuStruct<{
                    x: import("@box/mudb/schema").MuFloat64;
                    y: import("@box/mudb/schema").MuFloat64;
                    z: import("@box/mudb/schema").MuFloat64;
                }>;
                sunColor: import("@box/mudb/schema").MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyLeft: import("@box/mudb/schema").MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyRight: import("@box/mudb/schema").MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyTop: import("@box/mudb/schema").MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyBottom: import("@box/mudb/schema").MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyFront: import("@box/mudb/schema").MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                skyBack: import("@box/mudb/schema").MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                }>;
                gamma: import("@box/mudb/schema").MuFloat32;
            }>;
            overrideSnow: import("@box/mudb/schema").MuBoolean;
            snow: import("@box/mudb/schema").MuStruct<{
                texture: import("@box/mudb/schema").MuUTF8;
                density: import("@box/mudb/schema").MuFloat64;
                size: import("@box/mudb/schema").MuStruct<{
                    w: import("@box/mudb/schema").MuFloat64;
                    h: import("@box/mudb/schema").MuFloat64;
                }>;
                fallSpeed: import("@box/mudb/schema").MuFloat64;
                spinSpeed: import("@box/mudb/schema").MuFloat64;
                color: import("@box/mudb/schema").MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                    a: import("@box/mudb/schema").MuFloat64;
                }>;
            }>;
            overrideRain: import("@box/mudb/schema").MuBoolean;
            rain: import("@box/mudb/schema").MuStruct<{
                density: import("@box/mudb/schema").MuFloat64;
                direction: import("@box/mudb/schema").MuStruct<{
                    x: import("@box/mudb/schema").MuFloat64;
                    y: import("@box/mudb/schema").MuFloat64;
                    z: import("@box/mudb/schema").MuFloat64;
                }>;
                speed: import("@box/mudb/schema").MuFloat64;
                size: import("@box/mudb/schema").MuStruct<{
                    w: import("@box/mudb/schema").MuFloat64;
                    h: import("@box/mudb/schema").MuFloat64;
                }>;
                interference: import("@box/mudb/schema").MuFloat64;
                color: import("@box/mudb/schema").MuStruct<{
                    r: import("@box/mudb/schema").MuFloat64;
                    g: import("@box/mudb/schema").MuFloat64;
                    b: import("@box/mudb/schema").MuFloat64;
                    a: import("@box/mudb/schema").MuFloat64;
                }>;
            }>;
        }>>;
        gamepad: import("@box/mudb/schema").MuStruct<{
            joystick: import("@box/mudb/schema").MuStruct<{
                background: import("@box/mudb/schema").MuUTF8;
                controller: import("@box/mudb/schema").MuUTF8;
            }>;
            fly: import("@box/mudb/schema").MuStruct<{
                button: import("@box/mudb/schema").MuUTF8;
                flyingController: import("@box/mudb/schema").MuUTF8;
                flyingBackground: import("@box/mudb/schema").MuUTF8;
            }>;
            buttons: import("@box/mudb/schema").MuStruct<{
                jump: import("@box/mudb/schema").MuUTF8;
                crouch: import("@box/mudb/schema").MuUTF8;
                actionA: import("@box/mudb/schema").MuUTF8;
                actionB: import("@box/mudb/schema").MuUTF8;
            }>;
        }>;
        collisionRules: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            a: import("@box/mudb/schema").MuUTF8;
            b: import("@box/mudb/schema").MuUTF8;
        }>>;
        soundAssets: import("@box/mudb/schema").MuStruct<{
            hashes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
            hashId: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuVarint>;
        }>;
        meshAssets: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            hash: import("@box/mudb/schema").MuASCII;
            meshHash: import("@box/mudb/schema").MuASCII;
            bounds: MuSchema<import("gl-matrix").vec3>;
            hashType: MuSchema<Hot.HashType>;
            motionList: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuASCII;
                name: import("@box/mudb/schema").MuUTF8;
                duration: import("@box/mudb/schema").MuFloat32;
            }>>;
            useCustomBounds: import("@box/mudb/schema").MuBoolean;
            customBounds: import("@box/mudb/schema").MuStruct<{
                size: MuSchema<import("gl-matrix").vec3>;
                offset: MuSchema<import("gl-matrix").vec3>;
            }>;
            renderBoxOffset: MuSchema<import("gl-matrix").vec3>;
        }>>;
        modules: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            hash: import("@box/mudb/schema").MuASCII;
            isClient: import("@box/mudb/schema").MuBoolean;
        }>>;
        scriptIndex: import("@box/mudb/schema").MuUTF8;
        uiTree: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            type: MuSchema<TreeNodeType>;
            name: import("@box/mudb/schema").MuUTF8;
            parentId: import("@box/mudb/schema").MuASCII;
            childrenIds: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
            value: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuUnion<{
                screen: import("@box/mudb/schema").MuStruct<{
                    enable: import("@box/mudb/schema").MuBoolean;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: import("@box/mudb/schema").MuVoid;
                        autoLayout: import("@box/mudb/schema").MuStruct<{
                            cellSize: import("@box/mudb/schema").MuStruct<{
                                offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: import("@box/mudb/schema").MuBoolean;
                            columnWidthEnabled: import("@box/mudb/schema").MuBoolean;
                            startCorner: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutStartCorner>;
                            fillDirection: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutFillDirection>;
                            maxCells: import("@box/mudb/schema").MuVarint;
                            maxCellsEnabled: import("@box/mudb/schema").MuBoolean;
                            cellPadding: import("@box/mudb/schema").MuStruct<{
                                offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                            verticalAlignment: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    zIndex: import("@box/mudb/schema").MuVarint;
                }>;
                element: import("@box/mudb/schema").MuUnion<{
                    box: import("@box/mudb/schema").MuStruct<{
                        anchor: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        position: import("@box/mudb/schema").MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        size: import("@box/mudb/schema").MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        autoResize: MuSchema<import("@box/schema/project/ui-rda/defs").AutoResizeType>;
                        visible: import("@box/mudb/schema").MuBoolean;
                        backgroundColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        zIndex: import("@box/mudb/schema").MuVarint;
                        layoutOrder: import("@box/mudb/schema").MuVarint;
                        layout: import("@box/mudb/schema").MuUnion<{
                            none: import("@box/mudb/schema").MuVoid;
                            autoLayout: import("@box/mudb/schema").MuStruct<{
                                cellSize: import("@box/mudb/schema").MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                lineHeightEnabled: import("@box/mudb/schema").MuBoolean;
                                columnWidthEnabled: import("@box/mudb/schema").MuBoolean;
                                startCorner: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutStartCorner>;
                                fillDirection: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutFillDirection>;
                                maxCells: import("@box/mudb/schema").MuVarint;
                                maxCellsEnabled: import("@box/mudb/schema").MuBoolean;
                                cellPadding: import("@box/mudb/schema").MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                horizontalAlignment: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                                verticalAlignment: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                            }>;
                        }>;
                        clipsDescendants: import("@box/mudb/schema").MuBoolean;
                        rotation: import("@box/mudb/schema").MuQuantizedFloat;
                    }>;
                    image: import("@box/mudb/schema").MuStruct<{
                        anchor: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        position: import("@box/mudb/schema").MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        size: import("@box/mudb/schema").MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        autoResize: MuSchema<import("@box/schema/project/ui-rda/defs").AutoResizeType>;
                        visible: import("@box/mudb/schema").MuBoolean;
                        backgroundColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        zIndex: import("@box/mudb/schema").MuVarint;
                        layoutOrder: import("@box/mudb/schema").MuVarint;
                        clipsDescendants: import("@box/mudb/schema").MuBoolean;
                        layout: import("@box/mudb/schema").MuUnion<{
                            none: import("@box/mudb/schema").MuVoid;
                            autoLayout: import("@box/mudb/schema").MuStruct<{
                                cellSize: import("@box/mudb/schema").MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                lineHeightEnabled: import("@box/mudb/schema").MuBoolean;
                                columnWidthEnabled: import("@box/mudb/schema").MuBoolean;
                                startCorner: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutStartCorner>;
                                fillDirection: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutFillDirection>;
                                maxCells: import("@box/mudb/schema").MuVarint;
                                maxCellsEnabled: import("@box/mudb/schema").MuBoolean;
                                cellPadding: import("@box/mudb/schema").MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                horizontalAlignment: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                                verticalAlignment: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                            }>;
                        }>;
                        image: import("@box/mudb/schema").MuUTF8;
                        imageOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        imageDisplayMode: MuSchema<import("@box/schema/project/ui-rda/defs").ImageDisplayMode>;
                        rotation: import("@box/mudb/schema").MuQuantizedFloat;
                    }>;
                    text: import("@box/mudb/schema").MuStruct<{
                        richText: import("@box/mudb/schema").MuBoolean;
                        rotation: import("@box/mudb/schema").MuQuantizedFloat;
                        textStrokeColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        textStrokeOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        textStrokeThickness: import("@box/mudb/schema").MuQuantizedFloat;
                        textFontFamily: MuSchema<import("@box/schema/project/ui-rda/defs").UITextFontFamily>;
                        anchor: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        position: import("@box/mudb/schema").MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        size: import("@box/mudb/schema").MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        autoResize: MuSchema<import("@box/schema/project/ui-rda/defs").AutoResizeType>;
                        visible: import("@box/mudb/schema").MuBoolean;
                        backgroundColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        zIndex: import("@box/mudb/schema").MuVarint;
                        layoutOrder: import("@box/mudb/schema").MuVarint;
                        layout: import("@box/mudb/schema").MuUnion<{
                            none: import("@box/mudb/schema").MuVoid;
                            autoLayout: import("@box/mudb/schema").MuStruct<{
                                cellSize: import("@box/mudb/schema").MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                lineHeightEnabled: import("@box/mudb/schema").MuBoolean;
                                columnWidthEnabled: import("@box/mudb/schema").MuBoolean;
                                startCorner: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutStartCorner>;
                                fillDirection: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutFillDirection>;
                                maxCells: import("@box/mudb/schema").MuVarint;
                                maxCellsEnabled: import("@box/mudb/schema").MuBoolean;
                                cellPadding: import("@box/mudb/schema").MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                horizontalAlignment: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                                verticalAlignment: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                            }>;
                        }>;
                        clipsDescendants: import("@box/mudb/schema").MuBoolean;
                        textContent: import("@box/mudb/schema").MuUTF8;
                        textFontSize: import("@box/mudb/schema").MuUint8;
                        textColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        textOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        textXAlignment: MuSchema<import("@box/schema/project/ui-rda/defs").TextXAlignType>;
                        textYAlignment: MuSchema<import("@box/schema/project/ui-rda/defs").TextYAlignType>;
                        textLineHeight: import("@box/mudb/schema").MuQuantizedFloat;
                        autoWordWrap: import("@box/mudb/schema").MuBoolean;
                    }>;
                    scrollBox: import("@box/mudb/schema").MuStruct<{
                        anchor: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        position: import("@box/mudb/schema").MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        size: import("@box/mudb/schema").MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        autoResize: MuSchema<import("@box/schema/project/ui-rda/defs").AutoResizeType>;
                        visible: import("@box/mudb/schema").MuBoolean;
                        backgroundColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        zIndex: import("@box/mudb/schema").MuVarint;
                        layoutOrder: import("@box/mudb/schema").MuVarint;
                        clipsDescendants: import("@box/mudb/schema").MuBoolean;
                        layout: import("@box/mudb/schema").MuUnion<{
                            none: import("@box/mudb/schema").MuVoid;
                            autoLayout: import("@box/mudb/schema").MuStruct<{
                                cellSize: import("@box/mudb/schema").MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                lineHeightEnabled: import("@box/mudb/schema").MuBoolean;
                                columnWidthEnabled: import("@box/mudb/schema").MuBoolean;
                                startCorner: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutStartCorner>;
                                fillDirection: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutFillDirection>;
                                maxCells: import("@box/mudb/schema").MuVarint;
                                maxCellsEnabled: import("@box/mudb/schema").MuBoolean;
                                cellPadding: import("@box/mudb/schema").MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                horizontalAlignment: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                                verticalAlignment: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                            }>;
                        }>;
                        scrollDirection: MuSchema<import("@box/schema/project/ui-rda/defs").UIScrollDirection>;
                        scrollbarHorizontal: MuSchema<import("@box/schema/project/ui-rda/defs").UIScrollbarHorizontal>;
                        scrollbarVertical: MuSchema<import("@box/schema/project/ui-rda/defs").UIScrollbarVertical>;
                        scrollbarVisibility: MuSchema<import("@box/schema/project/ui-rda/defs").UIScrollbarVisibility>;
                        scrollbarThickness: import("@box/mudb/schema").MuVarint;
                        scrollbarColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        scrollbarOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        scrollCanvasAutoResize: MuSchema<import("@box/schema/project/ui-rda/defs").AutoResizeType>;
                        scrollCanvasSize: import("@box/mudb/schema").MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        scrollPosition: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        rotation: import("@box/mudb/schema").MuQuantizedFloat;
                    }>;
                    input: import("@box/mudb/schema").MuStruct<{
                        textStrokeColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        textStrokeOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        textStrokeThickness: import("@box/mudb/schema").MuQuantizedFloat;
                        textFontFamily: MuSchema<import("@box/schema/project/ui-rda/defs").UITextFontFamily>;
                        anchor: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        position: import("@box/mudb/schema").MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        size: import("@box/mudb/schema").MuStruct<{
                            offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        autoResize: MuSchema<import("@box/schema/project/ui-rda/defs").AutoResizeType>;
                        visible: import("@box/mudb/schema").MuBoolean;
                        backgroundColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        zIndex: import("@box/mudb/schema").MuVarint;
                        layoutOrder: import("@box/mudb/schema").MuVarint;
                        layout: import("@box/mudb/schema").MuUnion<{
                            none: import("@box/mudb/schema").MuVoid;
                            autoLayout: import("@box/mudb/schema").MuStruct<{
                                cellSize: import("@box/mudb/schema").MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                lineHeightEnabled: import("@box/mudb/schema").MuBoolean;
                                columnWidthEnabled: import("@box/mudb/schema").MuBoolean;
                                startCorner: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutStartCorner>;
                                fillDirection: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutFillDirection>;
                                maxCells: import("@box/mudb/schema").MuVarint;
                                maxCellsEnabled: import("@box/mudb/schema").MuBoolean;
                                cellPadding: import("@box/mudb/schema").MuStruct<{
                                    offset: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                    ratio: import("@box/schema/utils/quantized-schema").QuantizedVec2Schema;
                                }>;
                                horizontalAlignment: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                                verticalAlignment: MuSchema<import("@box/schema/project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                            }>;
                        }>;
                        clipsDescendants: import("@box/mudb/schema").MuBoolean;
                        textContent: import("@box/mudb/schema").MuUTF8;
                        textFontSize: import("@box/mudb/schema").MuUint8;
                        textColor: import("@box/schema/utils/quantized-schema").QuantizedVec3Schema;
                        textOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                        textXAlignment: MuSchema<import("@box/schema/project/ui-rda/defs").TextXAlignType>;
                        textYAlignment: MuSchema<import("@box/schema/project/ui-rda/defs").TextYAlignType>;
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
        pictureAssets: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            metadataHash: import("@box/mudb/schema").MuASCII;
            hash: import("@box/mudb/schema").MuASCII;
            width: import("@box/mudb/schema").MuInt32;
            height: import("@box/mudb/schema").MuInt32;
        }>>;
        skinAssets: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            hash: import("@box/mudb/schema").MuASCII;
            parts: import("@box/mudb/schema").MuStruct<{
                hips: import("@box/mudb/schema").MuASCII;
                torso: import("@box/mudb/schema").MuASCII;
                neck: import("@box/mudb/schema").MuASCII;
                head: import("@box/mudb/schema").MuASCII;
                leftShoulder: import("@box/mudb/schema").MuASCII;
                leftUpperArm: import("@box/mudb/schema").MuASCII;
                leftLowerArm: import("@box/mudb/schema").MuASCII;
                leftHand: import("@box/mudb/schema").MuASCII;
                rightShoulder: import("@box/mudb/schema").MuASCII;
                rightUpperArm: import("@box/mudb/schema").MuASCII;
                rightLowerArm: import("@box/mudb/schema").MuASCII;
                rightHand: import("@box/mudb/schema").MuASCII;
                leftUpperLeg: import("@box/mudb/schema").MuASCII;
                leftLowerLeg: import("@box/mudb/schema").MuASCII;
                leftFoot: import("@box/mudb/schema").MuASCII;
                rightUpperLeg: import("@box/mudb/schema").MuASCII;
                rightLowerLeg: import("@box/mudb/schema").MuASCII;
                rightFoot: import("@box/mudb/schema").MuASCII;
            }>;
        }>>;
        defaultSkinName: import("@box/mudb/schema").MuUTF8;
    }>>;
}
/**
 * 通过ProjectRDA中的资源更新HotProject的资源
 */
export declare function updateHotProjectAssets(out: Hot.HotProject, projectInfo: Cold.ProjectInfo): void;
//# sourceMappingURL=bake.d.ts.map