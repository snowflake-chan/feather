import React, { useState, useEffect, type JSX } from 'react';
import {
  EntitySound,
  AudioSample,
  AudioSampleRDA,
  EntitySoundEnum,
  AudioSampleEnum,
} from '@box/schema/project/project-rda';

import { Divider } from '../../../components/common/divider';
import { NumberProperty } from '../../../components/edit/property';
import { Button } from '../../../components/edit/button';
import { Modal } from '../../../components/edit/modal';
import { isMobile } from 'src/utils/mobile';
import { EventBus } from '@box/utils/event';

import { EditorUIEvent } from 'src/client/edit/schema';
import { editor } from 'src/client/edit/edit-client';

import style from './index.module.scss';
import { useIntl } from 'react-intl';

type Props = {
  seedId: string;
  soundSetting: EntitySound;
  changeTitle: (title: string | JSX.Element) => void;
  updateDetailPanelHeight: (() => void) | undefined;
  showMusicLibrary: (param: [EditorUIEvent, string[]]) => void;
};

type SoundItem = AudioSample & { label: string };

type SelectedSoundItem = { index: number; sound: SoundItem };

type SoundListType = SoundItem[];

type SoundEffectListType = { name: string; content: JSX.Element }[];

type selectedSoundType = {
  index: number;
  sample: string;
};

enum PanelType {
  Normal,
  Effect,
  AudioTrack,
}

function rawName(modelName: string) {
  const path = modelName.split('/');
  const tempArr = path[path.length - 1].split('.');
  tempArr.pop();
  return tempArr.join('.');
}

export function SoundEffectSetting(props: Props) {
  const intl = useIntl();
  const [entitySoundList, setEntitySoundList] = useState<SoundListType>([]);
  const [soundEffectList, setSoundEffectList] = useState<SoundEffectListType>(
    [],
  );
  const [openPanel, setOpenPanel] = useState<PanelType>(PanelType.Normal);
  const [showClearTrackModal, toggleClearTrackModal] = useState(false);
  const [selectedSound, setSelectedSound] = useState<SelectedSoundItem>({
    index: -1,
    sound: { ...AudioSampleRDA.stateSchema.alloc(), label: '' },
  });
  const [sample, setSample] = useState<string>('');
  const [gain, setGain] = useState<number>(0);
  const [gainRange, setGainRange] = useState<number>(0);
  const [pitch, setPitch] = useState<number>(0);
  const [pitchRange, setPitchRange] = useState<number>(0);
  const [radius, setRadius] = useState<number>(0);
  const SOUND_LIST = [
    {
      name: EntitySoundEnum.hurt,
      set: editor.seedController.setSoundHurt,
    },
    {
      name: EntitySoundEnum.die,
      set: editor.seedController.setSoundDie,
    },
    {
      name: EntitySoundEnum.interact,
      set: editor.seedController.setSoundInteract,
    },
    {
      name: EntitySoundEnum.chat,
      set: editor.seedController.setSoundChat,
    },
  ];

  const removePrefixAndSuffix = (str: string) => {
    const path = str.split('/');
    let name = path[path.length - 1];
    name = name.split('.')[0];
    return name;
  };

  useEffect(() => {
    props.updateDetailPanelHeight && props.updateDetailPanelHeight();
  }, [openPanel]);

  useEffect(() => {
    const soundList: SoundListType = SOUND_LIST.map((sound) => {
      return {
        label: intl.formatMessage({ id: sound.name }),
        ...props.soundSetting[sound.name],
      };
    });
    setEntitySoundList(soundList);
    setSelectedSound({
      index: selectedSound.index,
      sound: soundList[selectedSound.index],
    });
  }, [JSON.stringify(props.soundSetting), intl]);

  useEffect(() => {
    const { index } = selectedSound;
    const name = removePrefixAndSuffix(sample);
    const SOUND_EFFECT = [
      {
        name: AudioSampleEnum.Sample,
        content: (() => {
          return (
            <div className={style.soundPropertyWrapper}>
              <div style={{ fontSize: 'var(--text-h4)' }}>
                {intl.formatMessage({ id: 'track' })}
              </div>
              <div
                className={style.soundSampleWrapper}
                onClick={() =>
                  openSetSoundPanel(
                    PanelType.AudioTrack,
                    selectedSound.sound,
                    selectedSound.index,
                    intl.formatMessage({ id: 'track' }),
                  )
                }
              >
                <div
                  className={
                    name ? style.soundSampleName : style.soundSamepleNameUnset
                  }
                >
                  {name || intl.formatMessage({ id: 'notAssigned' })}
                </div>
                <div className={style.rightArrowIcon}></div>
              </div>
            </div>
          );
        })(),
      },
      {
        name: AudioSampleEnum.Gain,
        content: (
          <NumberProperty
            name={intl.formatMessage({ id: AudioSampleEnum.Gain })}
            value={!!name ? selectedSound.sound.gain : gain}
            numberFixed={1}
            onChange={(value) =>
              editor.seedController.setSoundGain(
                props.seedId,
                SOUND_LIST[index].name,
                value,
              )
            }
            slider={[0, 1]}
            disabled={!name}
          />
        ),
      },
      {
        name: AudioSampleEnum.GainRange,
        content: (
          <NumberProperty
            name={intl.formatMessage({ id: AudioSampleEnum.GainRange })}
            value={!!name ? selectedSound.sound.gainRange : gainRange}
            numberFixed={1}
            onChange={(value) =>
              editor.seedController.setSoundGainRange(
                props.seedId,
                SOUND_LIST[index].name,
                value,
              )
            }
            slider={[0, 1]}
            disabled={!name}
          />
        ),
      },
      {
        name: AudioSampleEnum.Pitch,
        content: (
          <NumberProperty
            name={intl.formatMessage({ id: AudioSampleEnum.Pitch })}
            value={!!name ? selectedSound.sound.pitch : pitch}
            numberFixed={1}
            onChange={(value) =>
              editor.seedController.setSoundPitch(
                props.seedId,
                SOUND_LIST[index].name,
                value,
              )
            }
            slider={[0.1, 8]}
            disabled={!name}
          />
        ),
      },
      {
        name: AudioSampleEnum.PitchRange,
        content: (
          <NumberProperty
            name={intl.formatMessage({ id: AudioSampleEnum.PitchRange })}
            value={!!name ? selectedSound.sound.pitchRange : pitchRange}
            numberFixed={1}
            onChange={(value) =>
              editor.seedController.setSoundPitchRange(
                props.seedId,
                SOUND_LIST[index].name,
                value,
              )
            }
            slider={[0, 8]}
            disabled={!name}
          />
        ),
      },
      {
        name: AudioSampleEnum.Radius,
        content: (
          <NumberProperty
            name={intl.formatMessage({ id: AudioSampleEnum.Radius })}
            value={!!name ? selectedSound.sound.radius : radius}
            numberFixed={1}
            onChange={(value) =>
              editor.seedController.setSoundRadius(
                props.seedId,
                SOUND_LIST[index].name,
                value,
              )
            }
            slider={[0, 100]}
            disabled={!name}
          />
        ),
      },
      {
        name: '',
        content: (
          <Button
            value={intl.formatMessage({ id: 'clearTrack' })}
            style={{ margin: 0 }}
            disabled={!name}
            onClick={() => {
              toggleClearTrackModal(true);
            }}
            fullWidth
          />
        ),
      },
    ];
    setSoundEffectList(SOUND_EFFECT);
  }, [
    intl,
    sample,
    gain,
    gainRange,
    pitch,
    pitchRange,
    radius,
    JSON.stringify(selectedSound),
  ]);

  useEffect(() => {
    if (!selectedSound.sound) {
      return;
    }
    const { sound } = selectedSound;
    const {
      gain: soundGain,
      gainRange: soundGainRange,
      pitch: soundPitch,
      pitchRange: soundPpitchRange,
      radius: soundRadius,
      sample: soundSample,
    } = sound;
    setSample(soundSample);
    setGain(soundGain);
    setGainRange(soundGainRange);
    setPitch(soundPitch);
    setPitchRange(soundPpitchRange);
    setRadius(soundRadius);
  }, [JSON.stringify(selectedSound.sound)]);

  const openSetSoundPanel = (
    show: PanelType,
    sound: SoundItem,
    index: number,
    label: string,
  ) => {
    setSelectedSound({
      index,
      sound,
    });
    if (show === PanelType.AudioTrack) {
      props.showMusicLibrary([
        EditorUIEvent.openMusicLibrary,
        [SOUND_LIST[index].name, props.seedId],
      ]);
    } else {
      setOpenPanel(show);
      if (!isMobile()) {
        const title = _renderAudioTrackTitle(show, label);
        props.changeTitle(title);
      }
    }
  };

  const _renderAudioTrackTitle = (panel: PanelType, label?: string) => {
    const { sound } = selectedSound;
    return (
      <div className={style.backIconWrapper}>
        <div
          className={style.backIcon}
          onClick={() => {
            switch (panel) {
              case PanelType.Effect: {
                setOpenPanel(PanelType.Normal);
                if (!isMobile()) {
                  props.changeTitle(intl.formatMessage({ id: 'track' }));
                }
                break;
              }
              case PanelType.AudioTrack: {
                setOpenPanel(PanelType.Effect);
                if (!isMobile()) {
                  const title = _renderAudioTrackTitle(
                    PanelType.Effect,
                    sound.label,
                  );
                  props.changeTitle(title);
                }
                break;
              }
            }
            props.updateDetailPanelHeight && props.updateDetailPanelHeight();
          }}
        />
        <Divider vertical />
        <div>{label}</div>
      </div>
    );
  };

  return (
    <>
      {openPanel === PanelType.Normal && (
        <>
          {entitySoundList.map((sound, index) => {
            const { label, sample: entitySoundSample } = sound;
            const name = removePrefixAndSuffix(entitySoundSample);
            return (
              <div key={index} className={style.soundPropertyWrapper}>
                <div style={{ fontSize: 'var(--text-h4)' }}>{label}</div>
                <div
                  className={style.soundSampleWrapper}
                  onClick={() =>
                    openSetSoundPanel(
                      PanelType.Effect,
                      sound,
                      index,
                      sound.label,
                    )
                  }
                >
                  <div
                    className={
                      name ? style.soundSampleName : style.soundSamepleNameUnset
                    }
                  >
                    {name || intl.formatMessage({ id: 'notAssigned' })}
                  </div>
                  <div className={style.rightArrowIcon}></div>
                </div>
              </div>
            );
          })}
        </>
      )}
      {openPanel === PanelType.Effect && (
        <>
          {isMobile() &&
            _renderAudioTrackTitle(
              openPanel,
              entitySoundList[selectedSound.index].label,
            )}
          {soundEffectList.map((soundEffect, index) => {
            return (
              <React.Fragment key={index}>{soundEffect.content}</React.Fragment>
            );
          })}
        </>
      )}
      {showClearTrackModal ? (
        <Modal
          width={400}
          title={intl.formatMessage({ id: 'clearTrack' })}
          visible={true}
          dangerToConfirm
          cancel={intl.formatMessage({ id: 'cancel' })}
          confirm={intl.formatMessage({ id: 'btn_clear' })}
          disableBackgroundClick
          handleCancel={() => {
            toggleClearTrackModal(false);
          }}
          handleConfirm={() => {
            SOUND_LIST[selectedSound.index].set(props.seedId, '');
            toggleClearTrackModal(false);
          }}
        >
          <div className={style.normText}>
            {intl.formatMessage({ id: 'clearTrackText' })}
          </div>
          <div className={style.boldText}>
            {rawName(entitySoundList[selectedSound.index].sample)}
          </div>
        </Modal>
      ) : null}
      {/* {
                openPanel === PanelType.AudioTrack && (
                    <>
                        {
                            isMobile() && _renderAudioTrackTitle(openPanel, intl.formatMessage({ id: 'track' }))
                        }
                        <AudioTrack
                            updateDetailPanelHeight={props.updateDetailPanelHeight}
                            editState={props.editState}
                            sample={selectedSound.sound.sample}
                            setAudio={(audioSample:string) => {
                                setSample(audioSample);
                                SOUND_LIST[selectedSound.index].set(props.seedId, audioSample);
                            }}
                        />
                    </>
                )
            } */}
    </>
  );
}
