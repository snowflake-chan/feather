import * as React from 'react';
import { vec3, quat } from 'gl-matrix';
import { getEuler } from 'src/utils/rotate';
import { MODEL_TO_VOXEL } from 'src/defs/modelScale';
import { Vec3Slider } from '../basic/vec3Slider';
import { ColorInput } from '../basic/inputColor';
import { Divider } from '../../../components/common/divider';
import { Modal } from '../../../components/edit/modal';
import {
  NumberProperty,
  RotationProperty,
  StringProperty,
} from '../../../components/edit/property';
import { Button } from '../../../components/edit/button';
import { Input } from '../../../components/edit/input';
import { ClickPopup } from '../../../components/basic/click-popup';
import { RadioBtn } from '../../../components/basic/radioBtn';
import { isMobile } from 'src/utils/mobile';
import style from './index.module.scss';
import { IntlShape, injectIntl } from 'react-intl';
import type { JSX } from 'react';

type Props = {
  intl: IntlShape;
  name: string;
  tags: string[];
  position: vec3;
  rotation: quat;
  scale: vec3;
  emissive: number;
  metalness: number;
  shininess: number;
  color: { r: number; g: number; b: number };
  opacity: number;
  animations: {
    name: string;
    id: string;
  }[];
  defaultMotionId?: string;
  setColor: (c: { r: number; g: number; b: number }) => void;
  setOpacity: (t: number) => void;
  setEmissive: (e: number) => void;
  setMetalness: (m: number) => void;
  setShininess: (s: number) => void;
  setPosition: (position: vec3) => void;
  setRotation: (rotation: quat, commit?: boolean) => void;
  setScale: (scale: vec3) => void;
  setName: (name: string) => void;
  createTag: (newTag: string) => void;
  setTag: (idx: number, tag: string) => void;
  removeTag: (index: number) => void;
  setDefaultMotionId: (defaultId?: string) => void;
  changeTitle: (title: string | JSX.Element) => void;
  updateDetailPanelHeight: (() => void) | undefined;
};

enum PanelStatus {
  Basic,
  Tag,
  Animation,
}

type State = {
  positionCollapsed: boolean;
  rotationCollapsed: boolean;
  scaleCollapsed: boolean;
  panelStatus: PanelStatus;
  isCreatingTag: boolean;
  isEditingTag: boolean;
  isRemovingTag: boolean;
  editingTag: string;
  removingTag: string;
  editingTagIndex: number;
  removingTagIndex: number;
};

class BasicSettingContainer extends React.Component<Props, State> {
  private _rotationEuler = vec3.create();
  constructor(props: Props) {
    super(props);
    this.state = {
      positionCollapsed: false,
      rotationCollapsed: false,
      scaleCollapsed: false,
      panelStatus: PanelStatus.Basic,
      isCreatingTag: false,
      isEditingTag: false,
      isRemovingTag: false,
      editingTag: '',
      removingTag: '',
      editingTagIndex: -1,
      removingTagIndex: -1,
    };
  }

  private _handlePositionTabClick = () => {
    this.setState({
      positionCollapsed: !this.state.positionCollapsed,
    });
  };

  private _handleRotationTabClick = () => {
    this.setState({
      rotationCollapsed: !this.state.rotationCollapsed,
    });
  };

  private _handleScaleTabClick = () => {
    this.setState({
      scaleCollapsed: !this.state.scaleCollapsed,
    });
  };

  private _setPosition = (position: vec3) => {
    this.props.setPosition(position);
  };

  private _setScale = (scale: vec3) => {
    this.props.setScale(scale);
  };

  private _setPanelStatus = (status: PanelStatus) => {
    this.setState(
      {
        panelStatus: status,
      },
      () => {
        const { updateDetailPanelHeight } = this.props;
        updateDetailPanelHeight && updateDetailPanelHeight();
      },
    );
  };

  private _openCreateTagPanel = (open: boolean) => {
    this.setState({
      isCreatingTag: open,
      editingTag: '',
    });
  };

  private _openEditTagPanel = (open: boolean, index: number, tag: string) => {
    this.setState({
      isEditingTag: open,
      editingTag: tag,
      editingTagIndex: index,
    });
  };

  private _openRemoveTagPanel = (open: boolean, index: number, tag: string) => {
    this.setState({
      isRemovingTag: open,
      removingTag: tag,
      removingTagIndex: index,
    });
  };

  private _createTag = () => {
    if (
      this.state.editingTag.length &&
      !this.props.tags.some((tag) => tag === this.state.editingTag)
    ) {
      this.props.createTag(this.state.editingTag);
    }
  };

  private _modifyTag = () => {
    if (
      this.state.editingTag.length &&
      !this.props.tags.some((tag) => tag === this.state.editingTag) &&
      this.state.editingTagIndex >= 0
    ) {
      this.props.setTag(this.state.editingTagIndex, this.state.editingTag);
    }
  };

  private _removeTag = () => {
    if (
      this.state.removingTag.length &&
      this.props.tags.some((tag) => tag === this.state.removingTag) &&
      this.state.removingTagIndex >= 0
    ) {
      this.props.removeTag(this.state.removingTagIndex);
    }
  };

  private _handleSetTag = (tag: string) => {
    this.setState({
      editingTag: tag,
    });
  };

  private _renderTitle = (title: string) => {
    return (
      <div className={style.backIconWrapper}>
        <div
          className={style.backIcon}
          onClick={() => {
            this._setPanelStatus(PanelStatus.Basic);
            if (!isMobile()) {
              this.props.changeTitle(
                this.props.intl.formatMessage({ id: 'basic' }),
              );
            }
          }}
        />
        <Divider vertical />
        <div>{title}</div>
      </div>
    );
  };

  private _renderProperty = (data: {
    name: string;
    value: string | JSX.Element;
    onClick: () => void;
    disabled: boolean;
    showInfoIcon?: boolean;
  }) => {
    const { name, value, onClick, disabled, showInfoIcon } = data;
    return (
      <div className={`${style.property} ${disabled ? style.disabled : ''}`}>
        <div className={style.propName}>{name}</div>
        <div className={style.propValue}>
          <div
            className={style.tags}
            onClick={() => {
              if (disabled) {
                return;
              }
              onClick();
            }}
          >
            <div className={style.tagsName}>{value}</div>
            {showInfoIcon && <div className={style.infoIcon} />}
          </div>
        </div>
      </div>
    );
  };

  private _renderTagPanel = () => {
    return (
      <div className={style.tagEditingPanel}>
        {isMobile() &&
          this._renderTitle(this.props.intl.formatMessage({ id: 'tag' }))}
        <div className={style.addTagBtn}>
          <Button
            value={this.props.intl.formatMessage({ id: 'addTag' })}
            onClick={() => this._openCreateTagPanel(true)}
            fullWidth
          />
        </div>
        <div className={style.tagList}>
          {this.props.tags.map((tag, i) => {
            return (
              <div className={style.tag} key={tag}>
                <div className={style.tagNameWrapper}>
                  <div className={style.tagIcon}></div>
                  <div className={style.tagName}>{tag}</div>
                </div>
                <ClickPopup
                  popup={
                    <div className={style.popupContainer}>
                      <div
                        className={style.popupSelection}
                        onClick={() => this._openEditTagPanel(true, i, tag)}
                      >
                        {this.props.intl.formatMessage({ id: 'edit' })}
                      </div>
                      <div
                        className={style.popupSelection}
                        onClick={() => this._openRemoveTagPanel(true, i, tag)}
                      >
                        {this.props.intl.formatMessage({ id: 'remove' })}
                      </div>
                    </div>
                  }
                >
                  <div className={style.tagOperation}></div>
                </ClickPopup>
              </div>
            );
          })}
        </div>
        <Modal
          width={400}
          title={
            this.state.isCreatingTag
              ? this.props.intl.formatMessage({ id: 'addTag' })
              : this.props.intl.formatMessage({ id: 'editTag' })
          }
          visible={this.state.isCreatingTag || this.state.isEditingTag}
          cancel={this.props.intl.formatMessage({ id: 'cancel' })}
          confirm={this.props.intl.formatMessage({ id: 'confirm' })}
          handleCancel={() => {
            this._openCreateTagPanel(false);
            this._openEditTagPanel(false, -1, '');
          }}
          handleConfirm={() => {
            if (this.state.isCreatingTag) {
              this._openCreateTagPanel(false);
              this._createTag();
            }
            if (this.state.isEditingTag) {
              this._openEditTagPanel(false, -1, '');
              this._modifyTag();
            }
          }}
        >
          <div className={style.newTagName}>
            {this.props.intl.formatMessage({ id: 'name' })}
          </div>
          <Input
            value={this.state.editingTag}
            onChange={this._handleSetTag}
            placeholder={this.props.intl.formatMessage({ id: 'newTagName' })}
            clearBtn
          />
        </Modal>
        <Modal
          width={400}
          title={this.props.intl.formatMessage({ id: 'removeTag' })}
          visible={this.state.isRemovingTag}
          cancel={this.props.intl.formatMessage({ id: 'cancel' })}
          confirm={this.props.intl.formatMessage({ id: 'remove' })}
          dangerToConfirm
          handleCancel={() => {
            this._openRemoveTagPanel(false, -1, '');
          }}
          handleConfirm={() => {
            this._openRemoveTagPanel(false, -1, '');
            this._removeTag();
          }}
        >
          <div className={style.newTagName}>
            {`${this.props.intl.formatMessage({ id: 'removeTagTip' })} ${
              this.state.removingTag
            }?`}
          </div>
        </Modal>
      </div>
    );
  };

  private _renderAnimationPanel = () => {
    return (
      <div>
        {isMobile() &&
          this._renderTitle(
            this.props.intl.formatMessage({ id: 'animation.panelTitle' }),
          )}
        <div className={style.radioContainer}>
          <RadioBtn
            checked={!this.props.defaultMotionId}
            onChange={() => {
              // 设置空的默认动作即是静态动作
              this.props.setDefaultMotionId();
            }}
            text={this.props.intl.formatMessage({ id: 'animation.static' })}
          />
        </div>
        {this.props.animations.map((animation) => {
          return (
            <div className={style.radioContainer} key={animation.id}>
              <RadioBtn
                checked={this.props.defaultMotionId === animation.id}
                onChange={() => {
                  this.props.setDefaultMotionId(animation.id);
                }}
                text={animation.name}
              />
            </div>
          );
        })}
      </div>
    );
  };

  private _getDefaultAnimationName = () => {
    if (!this.props.defaultMotionId) {
      return this.props.intl.formatMessage({ id: 'animation.static' });
    }
    const animation = this.props.animations.find(
      (a) => a.id === this.props.defaultMotionId,
    );
    return (
      animation?.name ||
      this.props.intl.formatMessage({ id: 'animation.static' })
    );
  };

  private _renderBasic = () => {
    return (
      <div className={style.propertyContainer}>
        <StringProperty
          name={this.props.intl.formatMessage({ id: 'name' })}
          value={this.props.name}
          onChange={(e) => this.props.setName(e.toString())}
          inputContainerStyle={{ width: '100px' }}
        />
        {this._renderProperty({
          name: this.props.intl.formatMessage({ id: 'tag' }),
          value: this.props.tags.length ? (
            this.props.tags.join(', ')
          ) : (
            <div className={style.createTagBtn}>
              {this.props.intl.formatMessage({ id: 'addTag' })}
            </div>
          ),
          onClick: () => {
            this._setPanelStatus(PanelStatus.Tag);
            if (!isMobile()) {
              this.props.changeTitle(
                this._renderTitle(this.props.intl.formatMessage({ id: 'tag' })),
              );
            }
          },
          disabled: false,
          showInfoIcon: !!this.props.tags.length,
        })}
        {this._renderProperty({
          name: this.props.intl.formatMessage({ id: 'animation.title' }),
          value: this._getDefaultAnimationName(),
          onClick: () => {
            this._setPanelStatus(PanelStatus.Animation);
            if (!isMobile()) {
              this.props.changeTitle(
                this._renderTitle(
                  this.props.intl.formatMessage({ id: 'animation.panelTitle' }),
                ),
              );
            }
          },
          disabled: !this.props.animations.length,
          showInfoIcon: true,
        })}

        <Vec3Slider
          disabled={false}
          name={this.props.intl.formatMessage({ id: 'position' })}
          value={[
            this.props.position[0],
            this.props.position[1],
            this.props.position[2],
          ]}
          min={[0, 0, 0]}
          max={[128, 128, 128]}
          label={['X', 'Y', 'Z']}
          onChange={(position: number[] | vec3) => {
            this._setPosition(position as vec3);
          }}
        />
        <div
          className={
            this.state.rotationCollapsed
              ? style.collapsibleWrap + ' ' + style.collapsed
              : style.collapsibleWrap
          }
        >
          <div
            className={style.collapsibleTitle}
            onClick={this._handleRotationTabClick}
          >
            <span className={style.collapseIcon} />
            {this.props.intl.formatMessage({ id: 'rotation' })}
          </div>
          <RotationProperty
            setRotation={this.props.setRotation}
            rotation={this.props.rotation}
          />
        </div>

        <Vec3Slider
          disabled={false}
          name={this.props.intl.formatMessage({ id: 'scale' })}
          value={[
            this.props.scale[0] * MODEL_TO_VOXEL,
            this.props.scale[1] * MODEL_TO_VOXEL,
            this.props.scale[2] * MODEL_TO_VOXEL,
          ]}
          min={[0.01, 0.01, 0.01]}
          max={[20, 20, 20]}
          label={['X', 'Y', 'Z']}
          onChange={(scale: number[] | vec3) => {
            this._setScale(
              vec3.fromValues(
                scale[0] / MODEL_TO_VOXEL,
                scale[1] / MODEL_TO_VOXEL,
                scale[2] / MODEL_TO_VOXEL,
              ),
            );
          }}
        />
        <div className={style.colorItem}>
          <div className={style.itemTitle}>
            {this.props.intl.formatMessage({ id: 'color' })}
          </div>
          <ColorInput
            disabled={false}
            containerStyler={{
              width: '72px',
              height: '24px',
              transform: 'initial',
            }}
            value={this.props.color}
            range={[0, 255]}
            onChange={(color) => {
              this.props.setColor(color);
            }}
          />
        </div>
        <NumberProperty
          name={this.props.intl.formatMessage({ id: 'opacity' })}
          value={this.props.opacity}
          onChange={(v: number) => {
            this.props.setOpacity(Number(v));
          }}
          slider={[0, 255]}
          formatValue={(v) => Math.round(v)}
        />
        <NumberProperty
          name={this.props.intl.formatMessage({ id: 'emissive' })}
          value={this.props.emissive}
          numberFixed={2}
          onChange={(v: number) => {
            this.props.setEmissive(v);
          }}
          slider={[0, 1]}
        />
        <NumberProperty
          name={this.props.intl.formatMessage({ id: 'metalness' })}
          value={this.props.metalness}
          numberFixed={2}
          onChange={(v: number) => {
            this.props.setMetalness(v);
          }}
          slider={[0, 1]}
        />
        <NumberProperty
          name={this.props.intl.formatMessage({ id: 'shininess' })}
          value={this.props.shininess}
          numberFixed={2}
          onChange={(v: number) => {
            this.props.setShininess(v);
          }}
          slider={[0, 1]}
        />
      </div>
    );
  };

  private _renderContainer = () => {
    switch (this.state.panelStatus) {
      case PanelStatus.Basic:
        return this._renderBasic();
      case PanelStatus.Tag:
        return this._renderTagPanel();
      case PanelStatus.Animation:
        return this._renderAnimationPanel();
      default:
        return;
    }
  };

  public render() {
    this._rotationEuler = getEuler(this._rotationEuler, this.props.rotation);
    return <div className={style.container}>{this._renderContainer()}</div>;
  }
}

export const BasicSetting = injectIntl(BasicSettingContainer);
