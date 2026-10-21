import React, { memo, useContext, type JSX } from 'react';
import { IntlShape, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { vec3, quat, vec4 } from 'gl-matrix';
import type { EntitySeed } from '@box/schema/project/project-rda';
import { Vec4Schema } from '@box/schema/utils/math-schema';

import { BasicSetting } from './basicSetting';
import { PhysicsSetting } from './physicsSetting';
import { ParticleSetting } from './particleSetting';
import { SoundEffectSetting } from './soundEffectSetting';
import { DetailPanel } from '../detailPanel';

import {
  IconBasic,
  IconPhysics,
  IconEffect,
  IconMusic,
  IconPrint,
  IconInfo,
} from '@box/icons';
import { EditActionLabel } from 'src/client/edit/replica/replica-client-schema';
import { EditorUIEvent } from 'src/client/edit/schema';
import { editor } from 'src/client/edit/edit-client';

import style from './index.module.scss';
import type { RootState } from 'src/redux/edit';
import { ArenaEditorUIContext } from '../../editor-ui-context';
import { StageAreaContext } from '../stage-area/context';
import { seedsDataController } from '../stage-area/seedsData';
import { RadioProperty } from 'src/views/components/edit/property';
import { TooltipTrigger } from '@box/box-design';
import { clientConfig } from 'src/config/client';
import { FeatureFlag } from '@box/env/constants';

type Props = {
  intl: IntlShape;
  id: string;
  seed: EntitySeed;
  showMusicLibrary: (param: [EditorUIEvent, string[]]) => void;
};

type State = {
  basicSettingTitle: string | JSX.Element;
  soundEffectTitle: string | JSX.Element;
};

class SeedDetailContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      basicSettingTitle: this.props.intl.formatMessage({ id: 'basic' }),
      soundEffectTitle: this.props.intl.formatMessage({ id: 'soundEffect' }),
    };
  }

  private detailPanelRef = React.createRef<DetailPanel>();

  private _setName = (name: string) => {
    editor.seedController.setName(this.props.id, name);
  };

  private _setPosition = (v: vec3) => {
    const tx = editor.replica.projectTransaction();
    tx.push((action) =>
      action.entitiesTree.update(this.props.id).position(v),
    ).commit(EditActionLabel.PROJECT, true);
  };

  private _setRotation = (r: quat, commit = false) => {
    const tx = editor.replica.projectTransaction();
    tx.head((action) =>
      action.entitiesTree.update(this.props.id).orientation(r),
    );
    if (commit) {
      tx.commit(EditActionLabel.PROJECT, true);
    }
  };

  private _setScale = (s: vec3) => {
    const tx = editor.replica.projectTransaction();
    tx.push((action) =>
      action.entitiesTree.update(this.props.id).scale(s),
    ).commit(EditActionLabel.PROJECT, true);
  };

  private _setEmissive = (e: number) => {
    const tx = editor.replica.projectTransaction();
    tx.push((action) =>
      action.entitiesTree.update(this.props.id).emissive(e),
    ).commit(EditActionLabel.PROJECT, true);
  };

  private _setMetalness = (m: number) => {
    const tx = editor.replica.projectTransaction();
    tx.push((action) =>
      action.entitiesTree.update(this.props.id).metalness(m),
    ).commit(EditActionLabel.PROJECT, true);
  };

  private _setShininess = (s: number) => {
    const tx = editor.replica.projectTransaction();
    tx.push((action) =>
      action.entitiesTree.update(this.props.id).shininess(s),
    ).commit(EditActionLabel.PROJECT, true);
  };

  private _setMass = (m: number) => {
    const tx = editor.replica.projectTransaction();
    tx.push((action) =>
      action.entitiesTree.update(this.props.id).mass(m),
    ).commit(EditActionLabel.PROJECT, true);
  };

  private _setFriction = (f: number) => {
    const tx = editor.replica.projectTransaction();
    tx.push((action) =>
      action.entitiesTree.update(this.props.id).friction(f),
    ).commit(EditActionLabel.PROJECT, true);
  };

  private _setRestitution = (r: number) => {
    const tx = editor.replica.projectTransaction();
    tx.push((action) =>
      action.entitiesTree.update(this.props.id).restitution(r),
    ).commit(EditActionLabel.PROJECT, true);
  };

  private _setEnableDamage = (d: boolean) => {
    const tx = editor.replica.projectTransaction();
    tx.push((action) =>
      action.entitiesTree.update(this.props.id).damage.enabled(d),
    ).commit(EditActionLabel.PROJECT, true);
  };

  private _setHp = (hp: number) => {
    const tx = editor.replica.projectTransaction();
    tx.push((action) =>
      action.entitiesTree.update(this.props.id).damage.hp(hp),
    ).commit(EditActionLabel.PROJECT, true);
  };

  private _setMaxHp = (maxHp: number) => {
    const tx = editor.replica.projectTransaction();
    tx.push((action) =>
      action.entitiesTree.update(this.props.id).damage.maxHp(maxHp),
    ).commit(EditActionLabel.PROJECT, true);
  };

  private _setColor = (color: { r: number; g: number; b: number }) => {
    const tx = editor.replica.projectTransaction();
    const tint = this.props.seed.tint;
    const value = Vec4Schema.alloc();
    value[0] = color.r;
    value[1] = color.g;
    value[2] = color.b;
    value[3] = tint[3];
    tx.push((action) =>
      action.entitiesTree.update(this.props.id).tint(value),
    ).commit(EditActionLabel.PROJECT, true);
  };

  private _setOpacity = (t: number) => {
    const tx = editor.replica.projectTransaction();
    const tint = this.props.seed.tint;
    const value = Vec4Schema.alloc();
    value[0] = tint[0];
    value[1] = tint[1];
    value[2] = tint[2];
    value[3] = t;
    tx.push((action) =>
      action.entitiesTree.update(this.props.id).tint(value),
    ).commit(EditActionLabel.PROJECT, true);
  };

  private _setTag = (idx: number, tag: string) => {
    editor.seedController.setTag(this.props.id, idx, tag);
  };

  private _setDefaultMotionId = (defaultId?: string) => {
    editor.seedController.setDefaultMotionId(this.props.id, defaultId);
  };

  private _createTag = (tag: string) => {
    editor.seedController.createTag(this.props.id, tag);
  };

  private _removeTag = (index: number) => {
    editor.seedController.removeTag(this.props.id, index);
  };

  private _setRigidBody = (enable: boolean) => {
    editor.seedController.setRigidBody(this.props.id, enable);
  };

  private _setCollides = (enable: boolean) => {
    editor.seedController.setCollides(this.props.id, enable);
  };

  private _setGravity = (enable: boolean) => {
    editor.seedController.setGravity(this.props.id, enable);
  };

  private _setStaticShadow = (enable: boolean) => {
    editor.seedController.setStaticShadow(this.props.id, enable);
  };

  private changeBasicSettingTitle = (title: string | JSX.Element) => {
    this.setState({
      basicSettingTitle: title,
    });
  };

  private changeSoundEffectTitle = (title: string | JSX.Element) => {
    this.setState({
      soundEffectTitle: title,
    });
  };

  private _onSelectPage = () => {
    this.setState({
      basicSettingTitle: this.props.intl.formatMessage({ id: 'basic' }),
      soundEffectTitle: this.props.intl.formatMessage({ id: 'soundEffect' }),
    });
  };

  private _getAnimations = () => {
    const mesh = this.props.seed.mesh;
    if (!mesh) {
      return [];
    }
    const asset = seedsDataController.getAssetByMesh(mesh);
    if (!asset) {
      return [];
    }
    const cache = editor.game.state.modelCache.modelIndex[asset.hash];
    return cache?.animations || [];
  };

  private _renderBasicSetting = () => {
    return (
      <BasicSetting
        name={this.props.seed.name}
        tags={this.props.seed.tags}
        position={this.props.seed.position}
        scale={this.props.seed.scale}
        rotation={this.props.seed.orientation}
        emissive={this.props.seed.emissive}
        metalness={this.props.seed.metalness}
        shininess={this.props.seed.shininess}
        color={{
          r: this.props.seed.tint[0],
          g: this.props.seed.tint[1],
          b: this.props.seed.tint[2],
        }}
        opacity={this.props.seed.tint[3]}
        animations={this._getAnimations()}
        defaultMotionId={this.props.seed.defaultMotionId}
        setColor={this._setColor}
        setOpacity={this._setOpacity}
        setEmissive={this._setEmissive}
        setMetalness={this._setMetalness}
        setShininess={this._setShininess}
        setPosition={this._setPosition}
        setRotation={this._setRotation}
        setScale={this._setScale}
        setName={this._setName}
        createTag={this._createTag}
        removeTag={this._removeTag}
        setTag={this._setTag}
        setDefaultMotionId={this._setDefaultMotionId}
        changeTitle={this.changeBasicSettingTitle}
        updateDetailPanelHeight={
          this.detailPanelRef.current?.updateDetailPanelHeight
        }
      />
    );
  };

  private _renderPhysicsSetting = () => {
    return (
      <PhysicsSetting
        rigidbody={!this.props.seed.fixed}
        collides={this.props.seed.collision}
        gravity={this.props.seed.gravity}
        mass={this.props.seed.mass}
        friction={this.props.seed.friction}
        restitution={this.props.seed.restitution}
        enableDamge={this.props.seed.damage.enabled}
        hp={this.props.seed.damage.hp}
        maxHp={this.props.seed.damage.maxHp}
        setMass={this._setMass}
        setFriction={this._setFriction}
        setRestitution={this._setRestitution}
        setEnableDamage={this._setEnableDamage}
        setHp={this._setHp}
        setMaxHp={this._setMaxHp}
        setRigidBody={this._setRigidBody}
        setCollides={this._setCollides}
        setGravity={this._setGravity}
      />
    );
  };

  private _renderParticleSetting = () => {
    return (
      <ParticleSetting
        seedId={this.props.id}
        particleConfig={this.props.seed.particle}
      />
    );
  };

  private _renderScriptBinding = () => {
    return <div></div>;
  };

  private _renderSoundEffectSetting = () => {
    return (
      <SoundEffectSetting
        seedId={this.props.id}
        soundSetting={this.props.seed.sound}
        changeTitle={this.changeSoundEffectTitle}
        updateDetailPanelHeight={
          this.detailPanelRef.current?.updateDetailPanelHeight
        }
        showMusicLibrary={this.props.showMusicLibrary}
      />
    );
  };

  private _renderRenderSetting = () => {
    return (
      <RadioProperty
        name={
          <div className={style.staticShadow}>
            {this.props.intl.formatMessage({
              id: 'seedDetail.staticShadow',
            })}
            <TooltipTrigger
              text={this.props.intl.formatMessage({
                id: 'seedDetail.staticShadowToolTips',
              })}
              placement="bottomLeft"
              align={{ offset: [0, 8] }}
            >
              <IconInfo className={style.staticShadowInfoIcon} />
            </TooltipTrigger>
          </div>
        }
        value={this.props.seed.staticShadow}
        onChange={(e) => this._setStaticShadow(!!e)}
      />
    );
  };

  public render() {
    return (
      <DetailPanel
        className={style.PropertyPanel}
        ref={this.detailPanelRef}
        onSelectPage={this._onSelectPage}
        contentWrapperStyle={{ overflow: 'hidden scroll', paddingRight: '4px' }}
        contentList={[
          {
            title: this.state.basicSettingTitle,
            content: this._renderBasicSetting,
            tab: <IconBasic />,
          },
          {
            title: this.props.intl.formatMessage({ id: 'physics' }),
            content: this._renderPhysicsSetting,
            tab: <IconPhysics />,
          },
          {
            title: this.props.intl.formatMessage({ id: 'particleEffect' }),
            content: this._renderParticleSetting,
            tab: <IconEffect />,
          },
          {
            title: this.state.soundEffectTitle,
            content: this._renderSoundEffectSetting,
            contentContainerStyle: { padding: '0 0 16px 0' },
            contentStyle: { padding: '0 16px', width: '100%' },
            tab: <IconMusic />,
          },
          {
            title: this.props.intl.formatMessage({ id: 'seedDetail.render' }),
            content: this._renderRenderSetting,
            tab: <IconPrint />,
          },
          // {
          //     title: this.props.intl.formatMessage({ id: 'script' }),
          //     content: this._renderScriptBinding,
          //     tab: (
          //         <div className={style.scriptIcon}></div>
          //     ),
          // },
        ]}
      />
    );
  }
}

export const SeedDetailPanel = memo(() => {
  const { seedId } = useSelector((state: RootState) => ({
    seedId: state.seeds.selectedTreeNodes[0],
  }));

  const { replica } = useContext(ArenaEditorUIContext);
  const seed = replica.project.entitiesTree[seedId]?.value;

  const { showMusicLibrary } = useContext(StageAreaContext);

  const intl = useIntl();

  if (!seed) {
    return null;
  }

  return (
    <SeedDetailContainer
      id={seedId}
      seed={seed}
      showMusicLibrary={showMusicLibrary}
      intl={intl}
    />
  );
});
