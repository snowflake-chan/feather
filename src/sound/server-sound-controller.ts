import { MuServerProtocol, MuServer } from '@box/mudb/server';
import {
  SoundProtocolSchema,
  SoundEffect,
  EntitySoundEffectSetSchema,
  EntitySoundEffectSchema,
  PlayerSoundEffectSetSchema,
  PlayerSoundEffectSchema,
  PlaySoundPosition,
  SoundEffectSchema,
} from '@box/schema/sound/sound-protocol';
import { GameServerState } from '../game-server-schema';
import {
  AmbientSoundRDA,
  EntitySoundRDA,
  PlayerSoundRDA,
  AudioSampleRDA,
} from '@box/schema/project/project-rda';
import {
  ServerSoundStateSchema,
  ServerEntitySoundEffectSchema,
  ServerPlayerSoundEffectSchema,
} from './server-sound-state';
import { compareId, getById } from '@box/utils/id';

export class SoundServer {
  public protocol: MuServerProtocol<typeof SoundProtocolSchema>;
  public state: GameServerState;
  public soundPlayerMap = new Map<number, number>();

  constructor(spec: { server: MuServer; state: GameServerState }) {
    this.protocol = spec.server.protocol(SoundProtocolSchema);
    this.state = spec.state;

    this.protocol.configure({
      message: {},
      connect: (client) =>
        client.message.resetDictionary(this.state.project.soundAssets.hashes),
    });
  }

  private _syncReplica(
    replica: SoundEffect,
    server: typeof AudioSampleRDA.stateSchema.identity,
  ) {
    const s = this.state.project.soundAssets.hashId[server.sample];
    if (!s) {
      replica.sampleId = 0;
      return false;
    }
    replica.sampleId = s;
    replica.gain = server.gain;
    replica.gainRange = server.gainRange;
    replica.pitch = server.pitch;
    replica.pitchRange = server.pitchRange;
    replica.radius = server.radius;
    return true;
  }

  private _syncAmbientSound() {
    const ambient = this.state.sound.ambient;
    const ambientReplica = this.state.replica.sound.ambientSound;

    // copy over fields
    this._syncReplica(ambientReplica.ambient, ambient.ambient);
    this._syncReplica(ambientReplica.breakVoxel, ambient.breakVoxel);
    this._syncReplica(ambientReplica.placeVoxel, ambient.placeVoxel);
    this._syncReplica(ambientReplica.playerJoin, ambient.playerJoin);
    this._syncReplica(ambientReplica.playerLeave, ambient.playerLeave);
  }

  private _syncPlayerSound() {
    const playerReplica = PlayerSoundEffectSetSchema.assign(
      this.state.replica.sound.playerSound,
      PlayerSoundEffectSetSchema.identity,
    );
    const playerSound = this.state.sound.player;

    const secrets = this.state.secrets;
    let replicaPtr = 0;

    for (let i = 0; i < playerSound.length; ++i) {
      const r = playerSound[i];
      const s = PlayerSoundEffectSchema.alloc();

      let b = false;
      b = this._syncReplica(s.action0, r.action0) || b;
      b = this._syncReplica(s.action1, r.action1) || b;
      b = this._syncReplica(s.crouch, r.crouch) || b;
      b = this._syncReplica(s.doubleJump, r.doubleJump) || b;
      b = this._syncReplica(s.jump, r.jump) || b;
      b = this._syncReplica(s.land, r.land) || b;
      b = this._syncReplica(s.spawn, r.spawn) || b;
      b = this._syncReplica(s.step, r.step) || b;
      b = this._syncReplica(s.swim, r.swim) || b;
      b = this._syncReplica(s.enterWater, r.enterWater) || b;
      b = this._syncReplica(s.leaveWater, r.leaveWater) || b;
      b = this._syncReplica(s.startFly, r.startFly) || b;
      b = this._syncReplica(s.endFly, r.endFly) || b;

      if (b) {
        s.id = r.id;
        playerReplica.push(s);
      } else {
        PlayerSoundEffectSchema.free(s);
      }

      // synchronize music
      while (replicaPtr < secrets.length) {
        const replica = secrets[replicaPtr];
        if (replica.id > r.id) {
          break;
        }
        ++replicaPtr;
        if (replica.id === r.id) {
          this._syncReplica(replica.music, r.music);
          break;
        } else {
          SoundEffectSchema.assign(replica.music, SoundEffectSchema.identity);
        }
      }
    }

    // clear remaining connection music levels
    while (replicaPtr < secrets.length) {
      const secret = secrets[replicaPtr++];
      SoundEffectSchema.assign(secret.music, SoundEffectSchema.identity);
    }
  }

  private _syncEntitySound() {
    const entityReplica = EntitySoundEffectSetSchema.assign(
      this.state.replica.sound.entitySound,
      EntitySoundEffectSetSchema.identity,
    );
    const entitySound = this.state.sound.entity;

    for (let i = 0; i < entitySound.length; ++i) {
      const r = entitySound[i];
      const s = EntitySoundEffectSchema.alloc();

      let b = false;
      b = this._syncReplica(s.chat, r.chat) || b;
      b = this._syncReplica(s.die, r.die) || b;
      b = this._syncReplica(s.hurt, r.hurt) || b;
      b = this._syncReplica(s.interact, r.interact) || b;

      if (b) {
        s.id = r.id;
        entityReplica.push(s);
      } else {
        EntitySoundEffectSchema.free(s);
      }
    }
  }

  public tick() {
    // synchronize sound effect dictionary to client\
    if (this.state.sync) {
      // resync dictionary
      this.protocol.broadcast.resetDictionary(
        this.state.project.soundAssets.hashes,
      );

      // reset server sound state
      this.state.sound = ServerSoundStateSchema.assign(
        this.state.sound,
        ServerSoundStateSchema.identity,
      );

      // resync entity script state
      AmbientSoundRDA.stateSchema.assign(
        this.state.sound.ambient,
        this.state.project.sound,
      );

      // update seed sound effects
      const seeds = this.state.project.seeds;
      const ids = Object.keys(seeds);
      for (let i = 0; i < ids.length; ++i) {
        const entityId = this.state.seed.seedToEntity[ids[i]];
        if (!entityId) {
          continue;
        }
        const seedInfo = seeds[ids[i]];

        // update entity sounds
        const s = ServerEntitySoundEffectSchema.alloc();
        s.id = entityId;
        EntitySoundRDA.stateSchema.assign(s, seedInfo.sound);
        this.state.sound.entity.push(s);
      }

      // update player sound effects
      const playerInfo = this.state.project.player;
      for (let i = 0; i < this.state.players.length; ++i) {
        const id = this.state.players[i].id;

        const s = ServerPlayerSoundEffectSchema.alloc();
        s.id = id;
        PlayerSoundRDA.stateSchema.assign(s, playerInfo.playerSounds);
        this.state.sound.player.push(s);

        const e = ServerEntitySoundEffectSchema.alloc();
        e.id = id;
        EntitySoundRDA.stateSchema.assign(e, playerInfo.sounds);
        this.state.sound.entity.push(e);
      }

      // sort entity sound component
      this.state.sound.entity.sort(compareId);
    }

    // update sound replicas
    if (this.state.sound.ambientDirty) {
      this._syncAmbientSound();
      this.state.sound.ambientDirty = false;
    }
    if (this.state.sound.entityDirty) {
      this._syncEntitySound();
      this.state.sound.entityDirty = false;
    }
    if (this.state.sound.playerDirty) {
      this._syncPlayerSound();
      this.state.sound.playerDirty = false;
    }
  }

  public playSound = (
    soundId: number,
    sample: string,
    position: PlaySoundPosition,
    radius: number,
    gain: number,
    pitch: number,
  ) => {
    if (!(gain > 0) || !(pitch > 0.1)) {
      return;
    }
    const sampleId = this.state.project.soundAssets.hashId[sample];
    if (!sampleId) {
      return;
    }
    if (position.type === 'player') {
      this.soundPlayerMap.set(soundId, <number>position.data);
      const conn = getById(this.state.connectionSet, <number>position.data);
      if (conn) {
        const client = this.protocol.clients[conn.sessionId];
        if (client) {
          client.message.play({
            soundId,
            sampleId,
            position,
            pitch,
            gain,
            radius: 0,
          });
        }
      }
    } else {
      this.protocol.broadcast.play({
        soundId,
        sampleId,
        position,
        pitch,
        gain,
        radius,
      });
    }
  };

  private getSoundMessage(soundId: number) {
    const playerId = this.soundPlayerMap.get(soundId);
    if (playerId) {
      const conn = getById(this.state.connectionSet, playerId);
      if (conn) {
        const client = this.protocol.clients[conn.sessionId];
        if (client) {
          return client.message;
        }
      }
      return undefined;
    } else {
      return this.protocol.broadcast;
    }
  }
  public resumeSound = (soundId: number) => {
    const message = this.getSoundMessage(soundId);
    if (message) {
      message.resume(soundId);
    }
  };

  public pauseSound = (soundId: number) => {
    const message = this.getSoundMessage(soundId);
    if (message) {
      message.pause(soundId);
    }
  };

  public stopSound = (soundId: number) => {
    const message = this.getSoundMessage(soundId);
    if (message) {
      message.stop(soundId);
    }
  };

  public setSoundCurrentTime = (soundId: number, currentTime: number) => {
    const message = this.getSoundMessage(soundId);
    if (message) {
      message.setCurrentTime({ soundId, currentTime });
    }
  };

  public setSoundCurrentTimeAndResume = (
    soundId: number,
    currentTime: number,
  ) => {
    const message = this.getSoundMessage(soundId);
    if (message) {
      message.setCurrentTimeAndResume({ soundId, currentTime });
    }
  };
}

type AudioPrefetch = {
  /**
   * 已配置的音频哈希（世界、角色中引用）
   */
  configured: string[];
  /**
   * 未被配置的音频哈希
   */
  notConfigured: string[];
};

/**
 * 根据“音频资源”和“音频引用（世界、角色引用）”查找需要预加载的音频资源
 * - 项目中正在引用的音频资源，作为首次加载资源（configured）
 * - 其余音频资源作为次要资源（notConfigured），随着原本的prefetch流程一起加载即可
 */
export function computeAudioPrefetch(state: GameServerState): AudioPrefetch {
  const {
    audioAssets,
    // “世界”的音频配置在worldSounds中
    sound: worldSounds,
    player,
  } = state.project;

  // “角色”的音频配置在player中，有两部分，entitySounds和playerSounds
  const { sounds: entitySounds, playerSounds } = player;

  const configured = new Set<string>();

  const notConfigured = new Set(
    Object.keys(audioAssets).map((key) => audioAssets[key].hash),
  );

  [worldSounds, entitySounds, playerSounds].forEach((dict) => {
    for (const key in dict) {
      const { sample } = dict[key];

      if (sample && audioAssets[sample]) {
        configured.add(audioAssets[sample].hash);

        notConfigured.delete(audioAssets[sample].hash);
      }
    }
  });

  return {
    configured: Array.from(configured),
    notConfigured: Array.from(notConfigured),
  };
}
