import React, { type JSX } from 'react';
import { IntlShape, injectIntl } from 'react-intl';
import {
  AmbientSound,
  PlayerSound,
  AmbientSoundEnum,
  AudioSampleEnum,
  PlayerSoundEnum,
  EntitySoundEnum,
  EntitySound,
} from '@box/schema/project/project-rda';
import { EditorUIEvent } from 'src/client/edit/schema';
import { SoundType } from 'src/client/edit/state-controller/environment-controller';
import { NumberProperty } from '../../../components/edit/property';
import { Button } from '../../../components/edit/button';
import { Modal } from '../../../components/edit/modal';
import { Divider } from '../../../components/common/divider';
import { isMobile } from 'src/utils/mobile';
import { EventBus } from '@box/utils/event';
import { editor } from 'src/client/edit/edit-client';

import style from './index.module.css';

enum PanelType {
  Normal,
  Effect,
  AudioTrack,
}

type SoundListItem = {
  label: string;
  set: (sampleSound: any) => void;
  effectList: () => (() => JSX.Element)[];
};

type Props = {
  intl: IntlShape;
  ambientSound: AmbientSound;
  playerSounds: PlayerSound;
  entitySounds: EntitySound;
  changeTitle: (title: string | JSX.Element) => void;
  scrollTo?: (x, y) => void;
  updateDetailPanelHeight: (() => void) | undefined;
  showMusicLibrary: (param: [EditorUIEvent, string[]]) => void;
};

type State = {
  openPanel: PanelType;
  worldTabCollapsed: boolean;
  playerTabCollaspsed: boolean;
  selectedSound: SoundListItem;
  sample: string;
  gain: number;
  gainRange: number;
  pitch: number;
  pitchRange: number;
  radius: number;
  showClearTrackModal: boolean;
};

function rawName(modelName: string) {
  const path = modelName.split('/');
  const tempArr = path[path.length - 1].split('.');
  tempArr.pop();
  return tempArr.join('.');
}

class SoundEffectContainer extends React.Component<Props, State> {
  private waitForDelete = {
    name: '',
    enumType: '',
    type: -1,
    func: () => {},
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      openPanel: PanelType.Normal,
      worldTabCollapsed: false,
      playerTabCollaspsed: false,
      selectedSound: {
        label: '',
        set: (soundSample) => {},
        effectList: () => [],
      },
      sample: '',
      gain: 0,
      gainRange: 0,
      pitch: 0,
      pitchRange: 0,
      radius: 0,
      showClearTrackModal: false,
    };
  }

  public shouldComponentUpdate(nextProps: Props, nextState: State) {
    if (
      nextState.openPanel !== this.state.openPanel ||
      nextState.worldTabCollapsed !== this.state.worldTabCollapsed ||
      nextState.playerTabCollaspsed !== this.state.playerTabCollaspsed ||
      nextState.selectedSound !== this.state.selectedSound ||
      nextState.sample !== this.state.sample ||
      nextState.gain !== this.state.gain ||
      nextState.gainRange !== this.state.gainRange ||
      nextState.pitch !== this.state.pitch ||
      nextState.pitchRange !== this.state.pitchRange ||
      nextState.radius !== this.state.radius ||
      nextState.showClearTrackModal !== this.state.showClearTrackModal
    ) {
      return true;
    }
    return false;
  }

  public static getDerivedStateFromProps(nextProps, prevState) {
    const { selectedSound } = prevState;
    const { label } = selectedSound;
    let nextSoundEffect;
    if (label in AmbientSoundEnum) {
      nextSoundEffect = nextProps.ambientSound[label];
    } else if (label in PlayerSoundEnum) {
      nextSoundEffect = nextProps.playerSounds[label];
    } else {
      nextSoundEffect = nextProps.entitySounds[label];
    }

    if (!nextSoundEffect) {
      return null;
    }

    if (
      nextSoundEffect.sample !== prevState.sample ||
      nextSoundEffect.pitch !== prevState.pitch ||
      nextSoundEffect.pitchRange !== prevState.pitchRange ||
      nextSoundEffect.gain !== prevState.gain ||
      nextSoundEffect.gainRange !== prevState.gainRange ||
      nextSoundEffect.radius !== prevState.radius
    ) {
      return {
        sample: nextSoundEffect.sample,
        gain: nextSoundEffect.gain,
        gainRange: nextSoundEffect.gainRange,
        pitch: nextSoundEffect.pitch,
        pitchRange: nextSoundEffect.pitchRange,
        radius: nextSoundEffect.radius,
      };
    }
    return null;
  }

  private setSoundState = () => {
    const { label } = this.state.selectedSound;
    let selectedSoundEffect;
    if (label in AmbientSoundEnum) {
      selectedSoundEffect = this.props.ambientSound[label];
    } else if (label in PlayerSoundEnum) {
      selectedSoundEffect = this.props.playerSounds[label];
    } else {
      selectedSoundEffect = this.props.entitySounds[label];
    }

    if (!selectedSoundEffect) {
      return;
    }

    const { sample, gain, gainRange, pitch, pitchRange, radius } =
      selectedSoundEffect;
    this.setState({
      sample,
      gain,
      gainRange,
      pitch,
      pitchRange,
      radius,
    });
  };

  private openSetSoundPanel = (
    panel: PanelType,
    selectedSound: SoundListItem,
    label?,
  ) => {
    this.setState(
      {
        selectedSound,
        openPanel: panel,
      },
      () => {
        this.setSoundState();
        this.props.updateDetailPanelHeight &&
          this.props.updateDetailPanelHeight();
        this.props.scrollTo && this.props.scrollTo(0, 0);
      },
    );
    if (!isMobile()) {
      const title = this._renderAudioTrackTitle(
        panel,
        label || this.props.intl.formatMessage({ id: selectedSound.label }),
      );
      this.props.changeTitle(title);
    }
  };

  private removePrefixAndSuffix = (str: string) => {
    const path = str.split('/');
    let name = path[path.length - 1];
    name = name.split('.')[0];
    return name;
  };

  private _renderSoundEffectItem = (
    name: string,
    value: number,
    sliderRange: [number, number],
    sliderOnChange: (v: number) => void,
    disabled: boolean,
  ) => (
    <NumberProperty
      name={name}
      value={value}
      numberFixed={1}
      onChange={(v) => sliderOnChange(Number(v))}
      slider={sliderRange}
      disabled={disabled}
    />
  );

  private _renderSoundSample = (setFun) => {
    const name = this.removePrefixAndSuffix(this.state.sample);
    return (
      <div className={style.soundPropertyWrapper}>
        <div>{this.props.intl.formatMessage({ id: 'track' })}</div>
        <div className={style.soundSampleWrapper} onClick={setFun}>
          <div
            className={
              name ? style.soundSampleName : style.soundSamepleNameUnset
            }
          >
            {name || this.props.intl.formatMessage({ id: 'notAssigned' })}
          </div>
          <div className={style.rightArrowIcon}></div>
        </div>
      </div>
    );
  };

  private _renderSoundGain = (setFunc, disable) =>
    this._renderSoundEffectItem(
      this.props.intl.formatMessage({ id: AudioSampleEnum.Gain }),
      this.state.gain,
      [0, 1],
      (v: number) => {
        setFunc(v);
      },
      disable,
    );

  private _renderSoundGainRange = (setFunc, disable) =>
    this._renderSoundEffectItem(
      this.props.intl.formatMessage({ id: AudioSampleEnum.GainRange }),
      this.state.gainRange,
      [0, 1],
      (v: number) => {
        setFunc(v);
      },
      disable,
    );

  private _renderSoundPitch = (setFunc, disable) =>
    this._renderSoundEffectItem(
      this.props.intl.formatMessage({ id: AudioSampleEnum.Pitch }),
      this.state.pitch,
      // [0.125, 8],
      [0.1, 8],
      (v: number) => {
        setFunc(v);
      },
      disable,
    );

  private _renderSoundPitchRange = (setFunc, disable) =>
    this._renderSoundEffectItem(
      this.props.intl.formatMessage({ id: AudioSampleEnum.PitchRange }),
      this.state.pitchRange,
      [0, 1],
      (v: number) => {
        setFunc(v);
      },
      disable,
    );

  private _renderSoundRadius = (setFunc, disable) =>
    this._renderSoundEffectItem(
      this.props.intl.formatMessage({ id: AudioSampleEnum.Radius }),
      this.state.radius,
      [0, 100],
      (v: number) => {
        setFunc(v);
      },
      disable,
    );

  private _renderAudioTrackTitle = (panel: PanelType, label?: string) => {
    return (
      <div className={style.backIconWrapper}>
        <div
          className={style.backIcon}
          onClick={() => {
            switch (panel) {
              case PanelType.Effect: {
                this.setState(
                  {
                    openPanel: PanelType.Normal,
                  },
                  () => {
                    this.props.updateDetailPanelHeight &&
                      this.props.updateDetailPanelHeight();
                  },
                );
                if (!isMobile()) {
                  this.props.changeTitle(
                    this.props.intl.formatMessage({ id: 'track' }),
                  );
                }
                break;
              }
              case PanelType.AudioTrack: {
                this.setState(
                  {
                    openPanel: PanelType.Effect,
                  },
                  () => {
                    this.props.updateDetailPanelHeight &&
                      this.props.updateDetailPanelHeight();
                  },
                );
                if (!isMobile()) {
                  const title = this._renderAudioTrackTitle(
                    PanelType.Effect,
                    this.props.intl.formatMessage({
                      id: this.state.selectedSound.label,
                    }),
                  );
                  this.props.changeTitle(title);
                }
                break;
              }
            }
          }}
        />
        <Divider vertical />
        <div>
          {label ||
            this.props.intl.formatMessage({
              id: this.state.selectedSound.label,
            })}
        </div>
      </div>
    );
  };

  private _renderClearTrackBtn = (
    preparation: () => void,
    disable: boolean,
  ) => {
    return (
      <Button
        value={this.props.intl.formatMessage({ id: 'clearTrack' })}
        style={{ margin: 0 }}
        disabled={disable}
        onClick={() => {
          preparation();
          this.setState({ showClearTrackModal: true });
        }}
        fullWidth
      />
    );
  };

  private _handleTabClick = (type: SoundType) => {
    if (type === SoundType.World) {
      this.setState(
        {
          worldTabCollapsed: !this.state.worldTabCollapsed,
        },
        () => {
          this.props.updateDetailPanelHeight &&
            this.props.updateDetailPanelHeight();
        },
      );
    } else {
      this.setState(
        {
          playerTabCollaspsed: !this.state.playerTabCollaspsed,
        },
        () => {
          this.props.updateDetailPanelHeight &&
            this.props.updateDetailPanelHeight();
        },
      );
    }
  };

  private soundEffectList = (
    soundEnum: AmbientSoundEnum | PlayerSoundEnum | EntitySoundEnum,
    type: SoundType,
    currentSound: string,
  ): (() => JSX.Element)[] => {
    let disable = false;
    const { sample } = this.state;
    const name = this.removePrefixAndSuffix(sample);
    disable = name === '' ? true : false;
    if (soundEnum === AmbientSoundEnum.ambient) {
      return [
        () =>
          this._renderSoundSample(() => {
            // this.openSetSoundPanel(PanelType.AudioTrack, this.state.selectedSound, this.props.intl.formatMessage({ id: 'track' }));
            this.props.showMusicLibrary([
              EditorUIEvent.openMusicLibrary,
              [soundEnum],
            ]);
          }),
        () =>
          this._renderSoundGain(
            (value) =>
              editor.envController.setSoundGain(soundEnum, value, type),
            disable,
          ),
        () =>
          this._renderSoundPitch(
            (value) =>
              editor.envController.setSoundPitch(soundEnum, value, type),
            disable,
          ),
        () =>
          this._renderClearTrackBtn(() => {
            this.waitForDelete = {
              name: rawName(currentSound),
              enumType: soundEnum,
              type: type,
              func: () =>
                editor.envController.setSoundSample(soundEnum, '', type),
            };
          }, disable),
      ];
    } else if (
      soundEnum === AmbientSoundEnum.playerJoin ||
      soundEnum === AmbientSoundEnum.playerLeave
    ) {
      return [
        () =>
          this._renderSoundSample(() => {
            // this.openSetSoundPanel(PanelType.AudioTrack, this.state.selectedSound, this.props.intl.formatMessage({ id: 'track' }));
            this.props.showMusicLibrary([
              EditorUIEvent.openMusicLibrary,
              [soundEnum],
            ]);
          }),
        () =>
          this._renderSoundGain(
            (value) =>
              editor.envController.setSoundGain(soundEnum, value, type),
            disable,
          ),
        () =>
          this._renderSoundGainRange(
            (value) =>
              editor.envController.setSoundGainRange(soundEnum, value, type),
            disable,
          ),
        () =>
          this._renderSoundPitch(
            (value) =>
              editor.envController.setSoundPitch(soundEnum, value, type),
            disable,
          ),
        () =>
          this._renderSoundPitchRange(
            (value) =>
              editor.envController.setSoundPitchRange(soundEnum, value, type),
            disable,
          ),
        () =>
          this._renderClearTrackBtn(() => {
            this.waitForDelete = {
              name: rawName(currentSound),
              enumType: soundEnum,
              type: type,
              func: () =>
                editor.envController.setSoundSample(soundEnum, '', type),
            };
          }, disable),
      ];
    }
    return [
      () =>
        this._renderSoundSample(() => {
          // this.openSetSoundPanel(PanelType.AudioTrack, this.state.selectedSound, this.props.intl.formatMessage({ id: 'track' }));
          this.props.showMusicLibrary([
            EditorUIEvent.openMusicLibrary,
            [soundEnum],
          ]);
        }),
      () =>
        this._renderSoundGain(
          (value) => editor.envController.setSoundGain(soundEnum, value, type),
          disable,
        ),
      () =>
        this._renderSoundGainRange(
          (value) =>
            editor.envController.setSoundGainRange(soundEnum, value, type),
          disable,
        ),
      () =>
        this._renderSoundPitch(
          (value) => editor.envController.setSoundPitch(soundEnum, value, type),
          disable,
        ),
      () =>
        this._renderSoundPitchRange(
          (value) =>
            editor.envController.setSoundPitchRange(soundEnum, value, type),
          disable,
        ),
      () =>
        this._renderSoundRadius(
          (value) =>
            editor.envController.setSoundRadius(soundEnum, value, type),
          disable,
        ),
      () =>
        this._renderClearTrackBtn(() => {
          this.waitForDelete = {
            name: rawName(currentSound),
            enumType: soundEnum,
            type: type,
            func: () =>
              editor.envController.setSoundSample(soundEnum, '', type),
          };
        }, disable),
    ];
  };

  private WORLD_SOUND_LIST = {
    title: this.props.intl.formatMessage({ id: 'world' }),
    list: [
      {
        label: AmbientSoundEnum.ambient,
        set: (sampleSound) =>
          editor.envController.setSoundSample(
            AmbientSoundEnum.ambient,
            sampleSound,
            SoundType.World,
          ),
        effectList: () =>
          this.soundEffectList(
            AmbientSoundEnum.ambient,
            SoundType.World,
            this.props.ambientSound.ambient.sample,
          ),
      },
      {
        label: AmbientSoundEnum.placeVoxel,
        set: (sampleSound) =>
          editor.envController.setSoundSample(
            AmbientSoundEnum.placeVoxel,
            sampleSound,
            SoundType.World,
          ),
        effectList: () =>
          this.soundEffectList(
            AmbientSoundEnum.placeVoxel,
            SoundType.World,
            this.props.ambientSound.placeVoxel.sample,
          ),
      },
      {
        label: AmbientSoundEnum.breakVoxel,
        set: (sampleSound) =>
          editor.envController.setSoundSample(
            AmbientSoundEnum.breakVoxel,
            sampleSound,
            SoundType.World,
          ),
        effectList: () =>
          this.soundEffectList(
            AmbientSoundEnum.breakVoxel,
            SoundType.World,
            this.props.ambientSound.breakVoxel.sample,
          ),
      },
      {
        label: AmbientSoundEnum.playerJoin,
        set: (sampleSound) =>
          editor.envController.setSoundSample(
            AmbientSoundEnum.playerJoin,
            sampleSound,
            SoundType.World,
          ),
        effectList: () =>
          this.soundEffectList(
            AmbientSoundEnum.playerJoin,
            SoundType.World,
            this.props.ambientSound.playerJoin.sample,
          ),
      },
      {
        label: AmbientSoundEnum.playerLeave,
        set: (sampleSound) =>
          editor.envController.setSoundSample(
            AmbientSoundEnum.playerLeave,
            sampleSound,
            SoundType.World,
          ),
        effectList: () =>
          this.soundEffectList(
            AmbientSoundEnum.playerLeave,
            SoundType.World,
            this.props.ambientSound.playerLeave.sample,
          ),
      },
    ],
  };

  private PLAYER_SOUND_LIST = {
    title: this.props.intl.formatMessage({ id: 'player' }),
    list: [
      {
        label: EntitySoundEnum.hurt,
        set: (sampleSound) =>
          editor.envController.setSoundSample(
            EntitySoundEnum.hurt,
            sampleSound,
            SoundType.Entity,
          ),
        effectList: () => {
          return this.soundEffectList(
            EntitySoundEnum.hurt,
            SoundType.Entity,
            this.props.entitySounds.hurt.sample,
          );
        },
      },
      {
        label: EntitySoundEnum.die,
        set: (sampleSound) =>
          editor.envController.setSoundSample(
            EntitySoundEnum.die,
            sampleSound,
            SoundType.Entity,
          ),
        effectList: () =>
          this.soundEffectList(
            EntitySoundEnum.die,
            SoundType.Entity,
            this.props.entitySounds.die.sample,
          ),
      },
      {
        label: EntitySoundEnum.interact,
        set: (sampleSound) =>
          editor.envController.setSoundSample(
            EntitySoundEnum.interact,
            sampleSound,
            SoundType.Entity,
          ),
        effectList: () =>
          this.soundEffectList(
            EntitySoundEnum.interact,
            SoundType.Entity,
            this.props.entitySounds.interact.sample,
          ),
      },
      {
        label: EntitySoundEnum.chat,
        set: (sampleSound) =>
          editor.envController.setSoundSample(
            EntitySoundEnum.chat,
            sampleSound,
            SoundType.Entity,
          ),
        effectList: () =>
          this.soundEffectList(
            EntitySoundEnum.chat,
            SoundType.Entity,
            this.props.entitySounds.chat.sample,
          ),
      },
      {
        label: PlayerSoundEnum.spawn,
        set: (sampleSound) =>
          editor.envController.setSoundSample(
            PlayerSoundEnum.spawn,
            sampleSound,
            SoundType.Player,
          ),
        effectList: () =>
          this.soundEffectList(
            PlayerSoundEnum.spawn,
            SoundType.Player,
            this.props.playerSounds.spawn.sample,
          ),
      },
      {
        label: PlayerSoundEnum.jump,
        set: (sampleSound) =>
          editor.envController.setSoundSample(
            PlayerSoundEnum.jump,
            sampleSound,
            SoundType.Player,
          ),
        effectList: () =>
          this.soundEffectList(
            PlayerSoundEnum.jump,
            SoundType.Player,
            this.props.playerSounds.jump.sample,
          ),
      },
      {
        label: PlayerSoundEnum.doubleJump,
        set: (sampleSound) =>
          editor.envController.setSoundSample(
            PlayerSoundEnum.doubleJump,
            sampleSound,
            SoundType.Player,
          ),
        effectList: () =>
          this.soundEffectList(
            PlayerSoundEnum.doubleJump,
            SoundType.Player,
            this.props.playerSounds.doubleJump.sample,
          ),
      },
      {
        label: PlayerSoundEnum.land,
        set: (sampleSound) =>
          editor.envController.setSoundSample(
            PlayerSoundEnum.land,
            sampleSound,
            SoundType.Player,
          ),
        effectList: () =>
          this.soundEffectList(
            PlayerSoundEnum.land,
            SoundType.Player,
            this.props.playerSounds.land.sample,
          ),
      },
      {
        label: PlayerSoundEnum.crouch,
        set: (sampleSound) =>
          editor.envController.setSoundSample(
            PlayerSoundEnum.crouch,
            sampleSound,
            SoundType.Player,
          ),
        effectList: () =>
          this.soundEffectList(
            PlayerSoundEnum.crouch,
            SoundType.Player,
            this.props.playerSounds.crouch.sample,
          ),
      },
      {
        label: PlayerSoundEnum.step,
        set: (sampleSound) =>
          editor.envController.setSoundSample(
            PlayerSoundEnum.step,
            sampleSound,
            SoundType.Player,
          ),
        effectList: () =>
          this.soundEffectList(
            PlayerSoundEnum.step,
            SoundType.Player,
            this.props.playerSounds.step.sample,
          ),
      },
      {
        label: PlayerSoundEnum.action0,
        set: (sampleSound) =>
          editor.envController.setSoundSample(
            PlayerSoundEnum.action0,
            sampleSound,
            SoundType.Player,
          ),
        effectList: () =>
          this.soundEffectList(
            PlayerSoundEnum.action0,
            SoundType.Player,
            this.props.playerSounds.action0.sample,
          ),
      },
      {
        label: PlayerSoundEnum.action1,
        set: (sampleSound) =>
          editor.envController.setSoundSample(
            PlayerSoundEnum.action1,
            sampleSound,
            SoundType.Player,
          ),
        effectList: () =>
          this.soundEffectList(
            PlayerSoundEnum.action1,
            SoundType.Player,
            this.props.playerSounds.action1.sample,
          ),
      },
      {
        label: PlayerSoundEnum.swim,
        set: (sampleSound) =>
          editor.envController.setSoundSample(
            PlayerSoundEnum.swim,
            sampleSound,
            SoundType.Player,
          ),
        effectList: () =>
          this.soundEffectList(
            PlayerSoundEnum.swim,
            SoundType.Player,
            this.props.playerSounds.swim.sample,
          ),
      },
      {
        label: PlayerSoundEnum.enterWater,
        set: (sampleSound) =>
          editor.envController.setSoundSample(
            PlayerSoundEnum.enterWater,
            sampleSound,
            SoundType.Player,
          ),
        effectList: () =>
          this.soundEffectList(
            PlayerSoundEnum.enterWater,
            SoundType.Player,
            this.props.playerSounds.enterWater.sample,
          ),
      },
      {
        label: PlayerSoundEnum.leaveWater,
        set: (sampleSound) =>
          editor.envController.setSoundSample(
            PlayerSoundEnum.leaveWater,
            sampleSound,
            SoundType.Player,
          ),
        effectList: () =>
          this.soundEffectList(
            PlayerSoundEnum.leaveWater,
            SoundType.Player,
            this.props.playerSounds.leaveWater.sample,
          ),
      },
      {
        label: PlayerSoundEnum.startFly,
        set: (sampleSound) =>
          editor.envController.setSoundSample(
            PlayerSoundEnum.startFly,
            sampleSound,
            SoundType.Player,
          ),
        effectList: () =>
          this.soundEffectList(
            PlayerSoundEnum.startFly,
            SoundType.Player,
            this.props.playerSounds.startFly.sample,
          ),
      },
      {
        label: PlayerSoundEnum.endFly,
        set: (sampleSound) =>
          editor.envController.setSoundSample(
            PlayerSoundEnum.endFly,
            sampleSound,
            SoundType.Player,
          ),
        effectList: () =>
          this.soundEffectList(
            PlayerSoundEnum.endFly,
            SoundType.Player,
            this.props.playerSounds.endFly.sample,
          ),
      },
    ],
  };

  public render() {
    const {
      openPanel,
      playerTabCollaspsed,
      worldTabCollapsed,
      selectedSound,
      sample,
    } = this.state;
    return (
      <>
        {openPanel === PanelType.Normal && (
          <>
            <div
              className={
                worldTabCollapsed
                  ? style.collapsibleWrap + ' ' + style.collapsed
                  : style.collapsibleWrap
              }
            >
              <div
                className={style.collapsibleTitle}
                onClick={() => this._handleTabClick(SoundType.World)}
              >
                <span className={style.collapseIcon} />
                {this.props.intl.formatMessage({ id: 'world' })}
              </div>
              <>
                {this.WORLD_SOUND_LIST.list.map(
                  (item: SoundListItem, index) => {
                    let sound;
                    let sampleSound;
                    const { label } = item;
                    sound = this.props.ambientSound[label];
                    sampleSound = this.props.ambientSound[label].sample;
                    const name = this.removePrefixAndSuffix(sampleSound);
                    return (
                      <div key={index} className={style.soundPropertyWrapper}>
                        <div>
                          {this.props.intl.formatMessage({ id: label })}
                        </div>
                        <div
                          className={style.soundSampleWrapper}
                          onClick={() =>
                            this.openSetSoundPanel(PanelType.Effect, item)
                          }
                        >
                          <div
                            className={
                              sampleSound
                                ? style.soundSampleName
                                : style.soundSamepleNameUnset
                            }
                          >
                            {name ||
                              this.props.intl.formatMessage({
                                id: 'notAssigned',
                              })}
                          </div>
                          <div className={style.rightArrowIcon}></div>
                        </div>
                      </div>
                    );
                  },
                )}
              </>
            </div>
            <div
              className={
                playerTabCollaspsed
                  ? style.collapsibleWrap + ' ' + style.collapsed
                  : style.collapsibleWrap
              }
            >
              <div
                className={style.collapsibleTitle}
                onClick={() => this._handleTabClick(SoundType.Player)}
              >
                <span className={style.collapseIcon} />
                {this.props.intl.formatMessage({ id: 'player' })}
              </div>
              <>
                {this.PLAYER_SOUND_LIST.list.map(
                  (item: SoundListItem, index) => {
                    let sound;
                    let sampleSound;
                    const { label } = item;
                    if (label in EntitySoundEnum) {
                      sound = this.props.entitySounds[label];
                      sampleSound = this.props.entitySounds[label].sample;
                    } else {
                      sound = this.props.playerSounds[label];
                      sampleSound = this.props.playerSounds[label].sample;
                    }
                    const name = this.removePrefixAndSuffix(sampleSound);
                    return (
                      <div key={index} className={style.soundPropertyWrapper}>
                        <div>
                          {this.props.intl.formatMessage({ id: label })}
                        </div>
                        <div
                          className={style.soundSampleWrapper}
                          onClick={() =>
                            this.openSetSoundPanel(PanelType.Effect, item)
                          }
                        >
                          <div
                            className={
                              name
                                ? style.soundSampleName
                                : style.soundSamepleNameUnset
                            }
                          >
                            {name ||
                              this.props.intl.formatMessage({
                                id: 'notAssigned',
                              })}
                          </div>
                          <div className={style.rightArrowIcon}></div>
                        </div>
                      </div>
                    );
                  },
                )}
              </>
            </div>
          </>
        )}
        {openPanel === PanelType.Effect && (
          <>
            {isMobile() && this._renderAudioTrackTitle(openPanel)}
            {selectedSound
              .effectList()
              .map((effect: () => JSX.Element, index) => {
                return <React.Fragment key={index}>{effect()}</React.Fragment>;
              })}
          </>
        )}
        {/* {
                openPanel === PanelType.AudioTrack && (
                    <>
                        {
                            isMobile() && this._renderAudioTrackTitle(openPanel, this.props.intl.formatMessage({ id: 'track' }))
                        }
                        <AudioTrack
                            updateDetailPanelHeight={this.props.updateDetailPanelHeight}
                            editState={this.props.editState}
                            sample={sample}
                            setAudio={(audioSample:string) => {
                                this.setState({
                                    sample: audioSample,
                                });
                                selectedSound.set(audioSample);
                            }}
                        />
                    </>
                )
            } */}
        {this.state.showClearTrackModal ? (
          <Modal
            width={400}
            title={this.props.intl.formatMessage({ id: 'clearTrack' })}
            visible={true}
            dangerToConfirm
            cancel={this.props.intl.formatMessage({ id: 'cancel' })}
            confirm={this.props.intl.formatMessage({ id: 'btn_clear' })}
            disableBackgroundClick
            handleCancel={() => {
              this.setState({ showClearTrackModal: false });
            }}
            handleConfirm={() => {
              this.waitForDelete.func();
              this.setState({ showClearTrackModal: false });
            }}
          >
            <div className={style.normText}>
              {this.props.intl.formatMessage({ id: 'clearTrackText' })}
            </div>
            <div className={style.boldText}>{this.waitForDelete.name}</div>
          </Modal>
        ) : null}
      </>
    );
  }
}

export const SoundEffect = injectIntl(SoundEffectContainer);
