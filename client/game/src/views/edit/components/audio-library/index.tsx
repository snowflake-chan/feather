import {
  memo,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useContext,
} from 'react';
import { useIntl } from 'react-intl';
import { SortOrder } from '@box/apis';
import {
  AmbientSoundEnum,
  GroupAssetEntry,
  EntitySoundEnum,
  PlayerSoundEnum,
} from '@box/schema/project/project-rda';
import { useEdit } from 'src/client/edit/edit-context';
import { AssetLibrary } from '../asset-library';
import { ArenaEditorUIContext } from '../../editor-ui-context';
import { SoundType } from 'src/client/edit/state-controller/environment-controller';
import { SoundSchema } from 'src/client/edit/edit-schema';
import { AudioItem } from '../uploadPreviewTool';
import { transformName } from '../script-manager/utils';

import style from './style.module.scss';

type AudioFileType = { key: string; value: GroupAssetEntry; name: string };

type SampleCache = typeof SoundSchema.identity['sampleCache'];

type Props = {
  onClose: () => void;
  UIEventPayload: string[];
};
export const AudioLibrary = memo(({ onClose, UIEventPayload }: Props) => {
  const intl = useIntl();
  const editor = useEdit();

  const [selectedSample, setSelectedSample] = useState('');
  const [sampleCache, setSampleCache] = useState<SampleCache>(
    editor.state.sound.sampleCache,
  );
  const [currPlayingAudio, setCurrPlayingAudio] = useState('');

  const [isEmptyWithoutSearch, setIsEmptyWithoutSearch] = useState(false);
  const [search, setSearch] = useState<string>();
  const [sortBy, setSortBy] = useState(SortOrder.CreateTimeDesc);
  const { replica } = useContext(ArenaEditorUIContext);

  const getCurrentAssets = useCallback(() => {
    const soundGenre = UIEventPayload[0];
    const seedId = UIEventPayload[1];
    const { ambientSound, player, entitiesTree } = replica.project;
    const treeNode = entitiesTree[seedId];
    switch (soundGenre) {
      case AmbientSoundEnum.ambient:
        return ambientSound.ambient.sample;
      case AmbientSoundEnum.breakVoxel:
        return ambientSound.breakVoxel.sample;
      case AmbientSoundEnum.placeVoxel:
        return ambientSound.placeVoxel.sample;
      case AmbientSoundEnum.playerJoin:
        return ambientSound.playerJoin.sample;
      case AmbientSoundEnum.playerLeave:
        return ambientSound.playerLeave.sample;
      case PlayerSoundEnum.action0:
        return player.playerSounds.action0.sample;
      case PlayerSoundEnum.action1:
        return player.playerSounds.action1.sample;
      case PlayerSoundEnum.crouch:
        return player.playerSounds.crouch.sample;
      case PlayerSoundEnum.doubleJump:
        return player.playerSounds.doubleJump.sample;
      case PlayerSoundEnum.endFly:
        return player.playerSounds.endFly.sample;
      case PlayerSoundEnum.enterWater:
        return player.playerSounds.enterWater.sample;
      case PlayerSoundEnum.jump:
        return player.playerSounds.jump.sample;
      case PlayerSoundEnum.land:
        return player.playerSounds.land.sample;
      case PlayerSoundEnum.leaveWater:
        return player.playerSounds.leaveWater.sample;
      case PlayerSoundEnum.music:
        return player.playerSounds.music.sample;
      case PlayerSoundEnum.spawn:
        return player.playerSounds.spawn.sample;
      case PlayerSoundEnum.startFly:
        return player.playerSounds.startFly.sample;
      case PlayerSoundEnum.step:
        return player.playerSounds.step.sample;
      case PlayerSoundEnum.swim:
        return player.playerSounds.swim.sample;
      case EntitySoundEnum.chat:
        if (treeNode && treeNode.value) {
          return treeNode.value.sound.chat.sample;
        } else {
          return player.sounds.chat.sample;
        }
      case EntitySoundEnum.die:
        if (treeNode && treeNode.value) {
          return treeNode.value.sound.die.sample;
        } else {
          return player.sounds.die.sample;
        }
      case EntitySoundEnum.hurt:
        if (treeNode && treeNode.value) {
          return treeNode.value.sound.hurt.sample;
        } else {
          return player.sounds.hurt.sample;
        }
      case EntitySoundEnum.interact:
        if (treeNode && treeNode.value) {
          return treeNode.value.sound.interact.sample;
        } else {
          return player.sounds.interact.sample;
        }
      default:
        return '';
    }
  }, [UIEventPayload, replica]);

  useEffect(() => {
    if (selectedSample && replica.project.audioAssets[selectedSample]) {
      return;
    }
    const assetKey = getCurrentAssets();
    // 检查是否存在资源
    if (replica.project.audioAssets[assetKey]) {
      setSelectedSample(assetKey);
      return;
    }
    setSelectedSample('');
  }, [selectedSample, getCurrentAssets, replica]);

  const processAudioAsset = useMemo(() => {
    const { audioAssets } = replica.project;

    let processList = Object.keys(audioAssets).map((key) => {
      const name = transformName(key, false);
      return {
        key,
        value: audioAssets[key],
        name,
      };
    });
    if (search) {
      processList = processList.filter((asset: AudioFileType) => {
        return asset.name.toLowerCase().indexOf(search.toLowerCase()) !== -1;
      });
    } else {
      setIsEmptyWithoutSearch(processList.length === 0);
    }
    // sort
    switch (sortBy) {
      case SortOrder.NameAsc:
        processList.sort((a, b) => {
          return transformName(a.key, true).localeCompare(
            transformName(b.key, true),
          );
        });
        break;
      default:
        processList.sort((a, b) => {
          return b.value.updateAt - a.value.updateAt;
        });
        break;
    }

    return processList;
  }, [replica, search, sortBy]);

  const setSoundSample = useCallback(
    (soundGenre: string, assetName: string) => {
      if (
        soundGenre === AmbientSoundEnum.ambient ||
        soundGenre === AmbientSoundEnum.breakVoxel ||
        soundGenre === AmbientSoundEnum.placeVoxel ||
        soundGenre === AmbientSoundEnum.playerJoin ||
        soundGenre === AmbientSoundEnum.playerLeave
      ) {
        editor.envController.setSoundSample(
          soundGenre,
          assetName,
          SoundType.World,
        );
      } else if (
        soundGenre === PlayerSoundEnum.action0 ||
        soundGenre === PlayerSoundEnum.action1 ||
        soundGenre === PlayerSoundEnum.crouch ||
        soundGenre === PlayerSoundEnum.doubleJump ||
        soundGenre === PlayerSoundEnum.endFly ||
        soundGenre === PlayerSoundEnum.enterWater ||
        soundGenre === PlayerSoundEnum.jump ||
        soundGenre === PlayerSoundEnum.land ||
        soundGenre === PlayerSoundEnum.leaveWater ||
        soundGenre === PlayerSoundEnum.music ||
        soundGenre === PlayerSoundEnum.spawn ||
        soundGenre === PlayerSoundEnum.startFly ||
        soundGenre === PlayerSoundEnum.step ||
        soundGenre === PlayerSoundEnum.swim
      ) {
        editor.envController.setSoundSample(
          soundGenre,
          assetName,
          SoundType.Player,
        );
      } else if (
        soundGenre === EntitySoundEnum.chat ||
        soundGenre === EntitySoundEnum.die ||
        soundGenre === EntitySoundEnum.hurt ||
        soundGenre === EntitySoundEnum.interact
      ) {
        if (
          UIEventPayload[1] !== undefined &&
          typeof UIEventPayload[1] === 'string'
        ) {
          if (soundGenre === EntitySoundEnum.chat) {
            editor.seedController.setSoundChat(UIEventPayload[1], assetName);
          } else if (soundGenre === EntitySoundEnum.die) {
            editor.seedController.setSoundDie(UIEventPayload[1], assetName);
          } else if (soundGenre === EntitySoundEnum.hurt) {
            editor.seedController.setSoundHurt(UIEventPayload[1], assetName);
          } else if (soundGenre === EntitySoundEnum.interact) {
            editor.seedController.setSoundInteract(
              UIEventPayload[1],
              assetName,
            );
          }
        } else {
          editor.envController.setSoundSample(
            soundGenre,
            assetName,
            SoundType.Entity,
          );
        }
      }
    },
    [UIEventPayload, editor.envController, editor.seedController],
  );

  const onApply = useCallback(() => {
    const soundGenre = UIEventPayload[0];
    setSoundSample(soundGenre, selectedSample);
    onClose();
  }, [UIEventPayload, onClose, selectedSample, setSoundSample]);

  // 更新缓存池
  useEffect(() => {
    const setCache = (sound: typeof SoundSchema.identity) => {
      setSampleCache(sound.sampleCache);
    };
    editor.listeners.sound.sub(setCache);
    return () => {
      editor.listeners.sound.unsub(setCache);
    };
  }, [editor.listeners.sound]);

  const items = useMemo(() => {
    const audioContext = editor.game.state.sound.context;
    if (!audioContext) {
      return [];
    }
    return processAudioAsset.map((audio) => {
      const { hash } = audio.value;
      let param: string | AudioBuffer = hash;
      if (sampleCache[hash] && sampleCache[hash].buffer) {
        param = sampleCache[hash].buffer;
      }
      return (
        <div key={`${audio.name}-${audio.value.hash}`} className={style.item}>
          <AudioItem
            audioContext={audioContext}
            data={param}
            path={audio.key}
            selectedSample={selectedSample}
            setSelectedSample={setSelectedSample}
            currPlayingAudio={currPlayingAudio}
            setCurrPlayingAudio={setCurrPlayingAudio}
          />
        </div>
      );
    });
  }, [
    processAudioAsset,
    sampleCache,
    editor.game.state.sound.context,
    selectedSample,
    currPlayingAudio,
  ]);

  return (
    <AssetLibrary
      title={intl.formatMessage({ id: 'audioLibrary' })}
      onClose={onClose}
      onConfirm={onApply}
      listEmptyTips={intl.formatMessage({ id: 'audioLibraryEmpty' })}
      items={items}
      selectedKey={selectedSample}
      setSearch={setSearch}
      setSortBy={setSortBy}
      sortBy={sortBy}
      isEmptyWithoutSearch={isEmptyWithoutSearch}
      gap={16}
    />
  );
});
