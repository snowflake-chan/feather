import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.1.6';
export const toVersion = '0.2.0';

const DEFAULT_SOUNDS_RES: {
  airhorn: string;
  boo: string;
  boost: string;
  break_block: string;
  chat: string;
  checkpoint: string;
  die: string;
  door_close: string;
  door_open: string;
  double_jump: string;
  drama: string;
  electric: string;
  elephant: string;
  explode: string;
  goal: string;
  gunshot: string;
  hit: string;
  hurt: string;
  jump: string;
  land: string;
  laugh: string;
  place_block: string;
  punch: string;
  rain: string;
  rooster: string;
  sad_trombone: string;
  scream: string;
  spawn: string;
  step: string;
  swim: string;
  sword1: string;
  sword2: string;
  whistle: string;
  wolf: string;
} = <any>(
  JSON.parse(
    '{"airhorn":"QmXNeXPiGGHKbY6ho9fBSbW3pJbf5ZH8d4fgsW6ATYxF8k","boo":"QmRwZyCAkWmFXgdzGZs4XVvQYxSghKeHtoGfj1xdnWa71t","boost":"QmSwteVxeNU9wo6ymgwgZuaHRP4WsRmNtW8SfqcukTEUYe","break_block":"QmTaUJ7bmi2nCh8VeDxFZpx6kaSXNjuDBuRRCQZravJ1Za","chat":"QmWvY461DpP47bGR6MNVqE4UtcKXuDhKGLJPHS42HgtR4z","checkpoint":"QmbhfMPCDg15nQgKrZm9f5enXhXcD9H7YMErVskFZVEabd","die":"QmS7GbdxuGWoUpT1cramd1dCnmrMCCF9FbAwmCupqJJJov","door_close":"QmbQWUYC6UQ9MemR5SMpkv5jPyQ4sBqdZXYHdGkQ9ibkm6","door_open":"QmeBquf5Pm85K17vkiYdNNq2gdn9qWzR21iiqcZqC2FmcR","double_jump":"QmeD93k5DuPDer1TGyxdm3AaDZbr2fFDm8eZHb44W1Caxj","drama":"QmbicxPot1SWDYNmbLyqu3QUeuWEeh6QUf4mpcKn6h5cw2","electric":"QmQK4arKsnmq3AbksocurGdFaxAQNSTRyqV1mU5y68XAUs","elephant":"QmZyhpzSMB9fxsSiP278q7qKCEQEgRRRbKZMkbMtL5KNiN","explode":"QmZ1FQxWDWvaLL7vnsLyvxCdwKoHLJJZvtpdeVN9v5Yc4z","goal":"QmXpuMoAAf1QRJkh45WdKe7zAUDRqYoVBnxw8Wjy3wfzNZ","gunshot":"Qmdt8zng4wHSGNxshdFQGpDExffRtgftLqqSRgBgQH8WG8","hit":"QmXpmb2gUXfGJ9iSqwtWXZMJzp6L8kJqS4HpsJCh4gdhDG","hurt":"QmYWbKcqgVSgo5gXVwb7QcsYsFVtUP1KzLWvQsFce6RGVh","jump":"QmYjQtVHnDJHdfGkVb31YAQxR5Yh6jeZmb4M33VYexKGX1","land":"QmTSfa9fptd4pzVv2QswVCbtYC7oSAu12NkoMmDYfugo7w","laugh":"QmUAbAcxUVxTH9TLFFBQkUZdzH9QceeJqpSCNZA6TWcmrV","place_block":"QmfUZkKKdgXR3gPDq5SmTNnJfeWg6xa2dXse4WBqDZFdLK","punch":"QmR1WTyca2aQ1hAMr8n82ULiYPDpjnKSR3Z5qECsFeCr4F","rain":"QmPK3sGJiddn6nBeBu28oDnb5ua8N8uhNrKrMNbVEnLXvA","rooster":"QmPq3p35GgwD94m5n5YtmA9rfeGz7m3CamAQ3VrZkEZuT9","sad_trombone":"QmRRaq2MC5yTJYpktAa1dCVQmgNeXRrShnEpfg3pxG4Rcw","scream":"QmSmjjJCRDWN2AUygVfW2nNy9X8QRkkFwyky3t4oXdpTz3","spawn":"QmXMgCjudjq7QwXDieQTMriL9sqmL2s6tspCoUaSZzHDSp","step":"QmZpcdh2Mw2fW13mgcj3L8NjbSYmZGa26kVqSVb8xvkEoG","swim":"Qmd5krXxH5UREqB4Qy4bhjLDmhVerCugSmK9VeRwsW3Xzt","sword1":"QmdbtQxdisg7DP9d5pgCEfkNFUzuNoq3XYLKB5rCHRba43","sword2":"QmdbtQxdisg7DP9d5pgCEfkNFUzuNoq3XYLKB5rCHRba43","whistle":"QmZtC4RzLcaKdqp7Rab6yrbiMuWuo8uZqNRhH6svaWGcpY","wolf":"QmeRsXcMUZLbLDySY5B7qqwkUWamkRvrTaQpK4ZqA5omro"}',
  )
);

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.2.0';
  project.prevHash = hash;
  project.timestamp = new Date();

  // add sound effects to project
  Object.keys(DEFAULT_SOUNDS_RES).forEach((sound) => {
    project.assets[`audio/${sound}.mp3`] = {
      hash: DEFAULT_SOUNDS_RES[sound],
      type: 6,
    };
  });

  // helper function
  function createSoundEffect(sample: string) {
    return {
      sample: `audio/${sample}.mp3`,
      radius: 32,
      pitch: 1,
      pitchRange: 0,
      gain: 1,
      gainRange: 0,
    };
  }

  // set default player sounds
  project.player.sounds = {
    die: createSoundEffect('die'),
    hurt: createSoundEffect('hurt'),
    chat: createSoundEffect('chat'),
    interact: createSoundEffect(''),
  };
  project.player.playerSounds = {
    spawn: createSoundEffect('spawn'),
    jump: createSoundEffect('jump'),
    doubleJump: createSoundEffect('double_jump'),
    land: createSoundEffect('land'),
    crouch: createSoundEffect(''),
    step: createSoundEffect(''),
    action0: createSoundEffect(''),
    action1: createSoundEffect(''),
    swim: createSoundEffect('swim'),
    enterWater: createSoundEffect('dive'),
    leaveWater: createSoundEffect('splash'),
    startFly: createSoundEffect(''),
    endFly: createSoundEffect(''),
  };

  // set ambient sounds
  project.ambientSound = {
    ambient: createSoundEffect(''),
    placeVoxel: createSoundEffect('place_block'),
    breakVoxel: createSoundEffect('break_block'),
    playerJoin: createSoundEffect(''),
    playerLeave: createSoundEffect(''),
  };

  // update entity sounds
  Object.keys(project.entities).forEach((id) => {
    const seed = project.entities[id];
    seed.sound = {
      die: createSoundEffect(''),
      hurt: createSoundEffect(''),
      chat: createSoundEffect(''),
      interact: createSoundEffect(''),
    };
  });

  return bs.storeJSON(project);
}
