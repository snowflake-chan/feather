import { MuArray } from '@box/mudb/schema/array';
import { MuASCII } from '@box/mudb/schema/ascii';
import { MuFloat32 } from '@box/mudb/schema/float32';
import { MuQuantizedFloat } from '@box/mudb/schema/quantized-float';
import { MuSortedArray } from '@box/mudb/schema/sorted-array';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUnion } from '@box/mudb/schema/union';
import { MuVarint } from '@box/mudb/schema/varint';
import { MuVoid } from '@box/mudb/schema/void';
import { QuantizedVec3Schema } from '../utils/quantized-schema';
export declare const HashSchema: MuASCII;
export declare const SoundSetSchema: MuArray<MuASCII>;
export declare const PlaySoundPositionSchema: MuUnion<{
    global: MuVoid;
    player: MuVarint;
    entity: MuVarint;
    position: QuantizedVec3Schema;
}>;
export type PlaySoundPosition = typeof PlaySoundPositionSchema.identity;
export declare const PlaySoundMessage: MuStruct<{
    soundId: MuVarint;
    sampleId: MuVarint;
    position: MuUnion<{
        global: MuVoid;
        player: MuVarint;
        entity: MuVarint;
        position: QuantizedVec3Schema;
    }>;
    radius: MuQuantizedFloat;
    pitch: MuQuantizedFloat;
    gain: MuQuantizedFloat;
}>;
export declare const SoundEffectSchema: MuStruct<{
    sampleId: MuVarint;
    radius: MuQuantizedFloat;
    gain: MuQuantizedFloat;
    gainRange: MuQuantizedFloat;
    pitch: MuQuantizedFloat;
    pitchRange: MuQuantizedFloat;
}>;
export type SoundEffect = typeof SoundEffectSchema.identity;
export declare const AmbientSoundEffectSchema: MuStruct<{
    ambient: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    breakVoxel: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    placeVoxel: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    playerJoin: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    playerLeave: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
}>;
export declare const EntitySoundEffectSchema: MuStruct<{
    id: MuVarint;
    chat: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    hurt: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    die: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    interact: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
}>;
export declare const EntitySoundEffectSetSchema: MuSortedArray<MuStruct<{
    id: MuVarint;
    chat: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    hurt: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    die: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    interact: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
}>>;
export declare const PlayerSoundEffectSchema: MuStruct<{
    id: MuVarint;
    spawn: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    jump: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    doubleJump: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    land: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    crouch: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    step: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    swim: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    action0: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    action1: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    enterWater: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    leaveWater: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    startFly: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    endFly: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
}>;
export declare const PlayerSoundEffectSetSchema: MuSortedArray<MuStruct<{
    id: MuVarint;
    spawn: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    jump: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    doubleJump: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    land: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    crouch: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    step: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    swim: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    action0: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    action1: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    enterWater: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    leaveWater: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    startFly: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
    endFly: MuStruct<{
        sampleId: MuVarint;
        radius: MuQuantizedFloat;
        gain: MuQuantizedFloat;
        gainRange: MuQuantizedFloat;
        pitch: MuQuantizedFloat;
        pitchRange: MuQuantizedFloat;
    }>;
}>>;
export declare const SoundReplicaSchema: MuStruct<{
    ambientSound: MuStruct<{
        ambient: MuStruct<{
            sampleId: MuVarint;
            radius: MuQuantizedFloat;
            gain: MuQuantizedFloat;
            gainRange: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            pitchRange: MuQuantizedFloat;
        }>;
        breakVoxel: MuStruct<{
            sampleId: MuVarint;
            radius: MuQuantizedFloat;
            gain: MuQuantizedFloat;
            gainRange: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            pitchRange: MuQuantizedFloat;
        }>;
        placeVoxel: MuStruct<{
            sampleId: MuVarint;
            radius: MuQuantizedFloat;
            gain: MuQuantizedFloat;
            gainRange: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            pitchRange: MuQuantizedFloat;
        }>;
        playerJoin: MuStruct<{
            sampleId: MuVarint;
            radius: MuQuantizedFloat;
            gain: MuQuantizedFloat;
            gainRange: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            pitchRange: MuQuantizedFloat;
        }>;
        playerLeave: MuStruct<{
            sampleId: MuVarint;
            radius: MuQuantizedFloat;
            gain: MuQuantizedFloat;
            gainRange: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            pitchRange: MuQuantizedFloat;
        }>;
    }>;
    entitySound: MuSortedArray<MuStruct<{
        id: MuVarint;
        chat: MuStruct<{
            sampleId: MuVarint;
            radius: MuQuantizedFloat;
            gain: MuQuantizedFloat;
            gainRange: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            pitchRange: MuQuantizedFloat;
        }>;
        hurt: MuStruct<{
            sampleId: MuVarint;
            radius: MuQuantizedFloat;
            gain: MuQuantizedFloat;
            gainRange: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            pitchRange: MuQuantizedFloat;
        }>;
        die: MuStruct<{
            sampleId: MuVarint;
            radius: MuQuantizedFloat;
            gain: MuQuantizedFloat;
            gainRange: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            pitchRange: MuQuantizedFloat;
        }>;
        interact: MuStruct<{
            sampleId: MuVarint;
            radius: MuQuantizedFloat;
            gain: MuQuantizedFloat;
            gainRange: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            pitchRange: MuQuantizedFloat;
        }>;
    }>>;
    playerSound: MuSortedArray<MuStruct<{
        id: MuVarint;
        spawn: MuStruct<{
            sampleId: MuVarint;
            radius: MuQuantizedFloat;
            gain: MuQuantizedFloat;
            gainRange: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            pitchRange: MuQuantizedFloat;
        }>;
        jump: MuStruct<{
            sampleId: MuVarint;
            radius: MuQuantizedFloat;
            gain: MuQuantizedFloat;
            gainRange: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            pitchRange: MuQuantizedFloat;
        }>;
        doubleJump: MuStruct<{
            sampleId: MuVarint;
            radius: MuQuantizedFloat;
            gain: MuQuantizedFloat;
            gainRange: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            pitchRange: MuQuantizedFloat;
        }>;
        land: MuStruct<{
            sampleId: MuVarint;
            radius: MuQuantizedFloat;
            gain: MuQuantizedFloat;
            gainRange: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            pitchRange: MuQuantizedFloat;
        }>;
        crouch: MuStruct<{
            sampleId: MuVarint;
            radius: MuQuantizedFloat;
            gain: MuQuantizedFloat;
            gainRange: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            pitchRange: MuQuantizedFloat;
        }>;
        step: MuStruct<{
            sampleId: MuVarint;
            radius: MuQuantizedFloat;
            gain: MuQuantizedFloat;
            gainRange: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            pitchRange: MuQuantizedFloat;
        }>;
        swim: MuStruct<{
            sampleId: MuVarint;
            radius: MuQuantizedFloat;
            gain: MuQuantizedFloat;
            gainRange: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            pitchRange: MuQuantizedFloat;
        }>;
        action0: MuStruct<{
            sampleId: MuVarint;
            radius: MuQuantizedFloat;
            gain: MuQuantizedFloat;
            gainRange: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            pitchRange: MuQuantizedFloat;
        }>;
        action1: MuStruct<{
            sampleId: MuVarint;
            radius: MuQuantizedFloat;
            gain: MuQuantizedFloat;
            gainRange: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            pitchRange: MuQuantizedFloat;
        }>;
        enterWater: MuStruct<{
            sampleId: MuVarint;
            radius: MuQuantizedFloat;
            gain: MuQuantizedFloat;
            gainRange: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            pitchRange: MuQuantizedFloat;
        }>;
        leaveWater: MuStruct<{
            sampleId: MuVarint;
            radius: MuQuantizedFloat;
            gain: MuQuantizedFloat;
            gainRange: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            pitchRange: MuQuantizedFloat;
        }>;
        startFly: MuStruct<{
            sampleId: MuVarint;
            radius: MuQuantizedFloat;
            gain: MuQuantizedFloat;
            gainRange: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            pitchRange: MuQuantizedFloat;
        }>;
        endFly: MuStruct<{
            sampleId: MuVarint;
            radius: MuQuantizedFloat;
            gain: MuQuantizedFloat;
            gainRange: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            pitchRange: MuQuantizedFloat;
        }>;
    }>>;
}>;
export declare const SoundProtocolSchema: {
    name: string;
    client: {
        resetDictionary: MuArray<MuASCII>;
        play: MuStruct<{
            soundId: MuVarint;
            sampleId: MuVarint;
            position: MuUnion<{
                global: MuVoid;
                player: MuVarint;
                entity: MuVarint;
                position: QuantizedVec3Schema;
            }>;
            radius: MuQuantizedFloat;
            pitch: MuQuantizedFloat;
            gain: MuQuantizedFloat;
        }>;
        resume: MuVarint;
        pause: MuVarint;
        stop: MuVarint;
        setCurrentTime: MuStruct<{
            soundId: MuVarint;
            currentTime: MuFloat32;
        }>;
        setCurrentTimeAndResume: MuStruct<{
            soundId: MuVarint;
            currentTime: MuFloat32;
        }>;
    };
    server: {};
};
