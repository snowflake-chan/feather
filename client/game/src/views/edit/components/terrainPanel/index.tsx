import { MouseButton, MouseState } from '@box/schema/input/input-schema';
import { BlockCategory } from '@box/schema/voxel/block-schema';
import { vec3 } from 'gl-matrix';
import * as React from 'react';
import { IntlShape, injectIntl } from 'react-intl';
import { editor } from 'src/client/edit/edit-client';
import { TerrainRecord } from 'src/client/edit/schema';
import { VOXEL_ROTATION_SHIFT } from 'src/defs/script';
import { UI3DVoxelEventSchema } from 'src/engine/ui3d/ui3d-schema';
import { Range } from '../../../components/edit/inputSlider';
import { AnimatedBlock } from '../basic/animated-block';
import { DetailPanel } from '../detailPanel';
import { Search } from '../search';
import {
  CursorIndicatorType,
  UI3DContainer,
  UI3DCursorIndicator,
} from '../ui-3d';
import { Quad } from '../ui-3d/quad';
import { TextureBox } from '../ui-3d/ui3d-texture-box';
import { RangePicker } from './rangePicker/rangePicker';
import { SizeNumber } from './size-number';
import {
  getColumnVoxelCenter,
  getColumnVoxelList,
  getSquareVoxelCenter,
  getSquareVoxelList,
} from './voxel-helper';

import {
  IconAdd,
  IconBlockArithmetic,
  IconBlockBreak,
  IconBlockColor,
  IconBlockFont,
  IconBlockHome,
  IconBlockLandform,
  IconBlockLights,
  IconBlockNature,
  IconBlockNumber,
  IconBlockRecently,
  IconFill,
  IconSub,
} from '@box/icons';
import style from './index.module.scss';

const RECENT_TAB = -1;
const terrainRecord = TerrainRecord.alloc();

enum TerrainEditMode {
  add = 1,
  remove = 2,
  replace = 3,
}

enum TerrainAddPattern {
  slice = 1,
  column = 2,
}

type Props = {
  intl: IntlShape;
  isRunning: boolean;
  handleSetIsTerrainPenActive: (boolean) => void;
  isTerrainPenActive: boolean;
};

type BlockTab = BlockCategory | typeof RECENT_TAB;

type State = {
  searchText: string;
  voxelType: BlockTab;
  penSize: number;
  columnSize: number;
  expand: boolean;
};

class TerrainContainer extends React.Component<Props, State> {
  private _hitRes = UI3DVoxelEventSchema.alloc();
  private _isDragging = false;
  private _isMouseDown = false;
  private _editMode: TerrainEditMode = TerrainEditMode.add;
  private _terrainAddPatten: TerrainAddPattern = TerrainAddPattern.slice;
  private _selectedElm: HTMLDivElement | undefined;
  private _shouldUpdateScroll = false;
  private _blockId_rotation_table: { [key: string]: number } = {};
  public voxelTransaction = editor.replica.voxelTransaction();

  constructor(props: Props) {
    super(props);
    this.state = {
      searchText: '',
      voxelType: terrainRecord.lastVoxel ? RECENT_TAB : BlockCategory.element,
      penSize: 1,
      columnSize: 1,
      expand: false,
    };
    for (const key in editor.game.state.blockIndex.id) {
      this._blockId_rotation_table[editor.game.state.blockIndex.id[key]] = 0;
    }
  }

  public componentDidUpdate(prevProps: Props, prevState: State) {
    if (this._shouldUpdateScroll) {
      this.scrollToSelectedVoxel();
      this._shouldUpdateScroll = false;
    }

    if (!this.props.isTerrainPenActive && prevProps.isTerrainPenActive) {
      terrainRecord.selectedVoxel[this.state.voxelType] = 0;
    }
  }

  private _setEditMode = (mode: TerrainEditMode) => {
    this._editMode = mode;
  };

  private getCenter = () => {
    return getSquareVoxelCenter(this._hitRes, this.state.penSize);
  };
  // block放置的位置
  private _render3DIndicator() {
    if (this.props.isRunning) {
      return null;
    }

    let offsetX =
      this._hitRes.hitNormal[0] === -1
        ? -0.001
        : this._hitRes.hitNormal[0] * 1.001;
    let offsetY =
      this._hitRes.hitNormal[1] === -1
        ? -0.001
        : this._hitRes.hitNormal[1] * 1.001;
    let offsetZ =
      this._hitRes.hitNormal[2] === -1
        ? -0.001
        : this._hitRes.hitNormal[2] * 1.001;
    if (this._hitRes.hitNormal[0]) {
      offsetY += 0.5;
      offsetZ += 0.5;
    } else if (this._hitRes.hitNormal[1]) {
      offsetX += 0.5;
      offsetZ += 0.5;
    } else if (this._hitRes.hitNormal[2]) {
      offsetX += 0.5;
      offsetY += 0.5;
    }

    const center = this.getCenter();

    return (
      <UI3DContainer
        ui3D={editor.game.state.ui3D}
        onVoxel={(hitRes) => {
          if (
            this._hitRes.mouseState === MouseState.release &&
            (hitRes.mouseState === MouseState.press ||
              hitRes.mouseState === MouseState.drag)
          ) {
            this._mouseDownListener();
          } else if (
            this._hitRes.mouseState === MouseState.press &&
            hitRes.mouseState === MouseState.release
          ) {
            this._mouseUpListener(hitRes.mouseButton);
            if (this._hitRes.mouseButton === MouseButton.left) {
              this._clickListener(this._hitRes.mouseButton);
            }
          } else if (
            this._hitRes.mouseState === MouseState.drag &&
            hitRes.mouseState === MouseState.release
          ) {
            this._mouseUpListener(hitRes.mouseButton);
          }
          if (
            (this._hitRes.mouseState === MouseState.drag ||
              this._hitRes.mouseState === MouseState.press) &&
            hitRes.mouseState === MouseState.drag &&
            !vec3.equals(this._hitRes.worldPosition, hitRes.worldPosition)
          ) {
            this._mouseMoveListener();
          }
          this._hitRes = UI3DVoxelEventSchema.assign(this._hitRes, hitRes);
          return false;
        }}
      >
        {this._editMode === TerrainEditMode.add &&
        this._terrainAddPatten === TerrainAddPattern.slice &&
        terrainRecord.selectedVoxel[this.state.voxelType] &&
        this.props.isTerrainPenActive &&
        vec3.len(this._hitRes.hitNormal) !== 0 ? (
          <UI3DCursorIndicator
            position={center}
            normal={this._hitRes.hitNormal}
            radius={this.state.penSize / 2}
            offset={vec3.fromValues(offsetX, offsetY, offsetZ)}
            type={this._editMode as any as CursorIndicatorType}
          ></UI3DCursorIndicator>
        ) : (
          ''
        )}
        {this._editMode !== TerrainEditMode.add &&
        this.props.isTerrainPenActive &&
        vec3.len(this._hitRes.hitNormal) !== 0 ? (
          <UI3DCursorIndicator
            position={center}
            normal={this._hitRes.hitNormal}
            radius={this.state.penSize / 2}
            offset={vec3.fromValues(offsetX, offsetY, offsetZ)}
            type={this._editMode as any as CursorIndicatorType}
          ></UI3DCursorIndicator>
        ) : (
          ''
        )}
        {terrainRecord.selectedVoxel[this.state.voxelType] &&
        this._editMode === TerrainEditMode.add &&
        this._terrainAddPatten === TerrainAddPattern.column &&
        this.props.isTerrainPenActive &&
        vec3.len(this._hitRes.hitNormal) !== 0 ? (
          <div>
            <UI3DCursorIndicator
              position={this._hitRes.voxelPosition}
              normal={this._hitRes.hitNormal}
              radius={0.5}
              offset={vec3.fromValues(offsetX, offsetY, offsetZ)}
              type={this._editMode as any as CursorIndicatorType}
            ></UI3DCursorIndicator>
            <Quad
              position={this._hitRes.voxelPosition}
              normal={this._hitRes.hitNormal}
              radius={0.5}
              offset={vec3.fromValues(offsetX, offsetY, offsetZ)}
              color={vec3.fromValues(0, 1, 0)}
              fence={true}
              draggable={false}
              screenSizeFixed={false}
            ></Quad>
          </div>
        ) : (
          ''
        )}
        {this.renderTextureBox(center)}
      </UI3DContainer>
    );
  }
  // block的preview
  public renderTextureBox(center) {
    if (
      terrainRecord.selectedVoxel[this.state.voxelType] &&
      this._editMode === TerrainEditMode.add &&
      this.props.isTerrainPenActive &&
      this._blockId_rotation_table[
        terrainRecord.selectedVoxel[this.state.voxelType]
      ] !== undefined
    ) {
      if (this._terrainAddPatten === TerrainAddPattern.column) {
        const centerPos = getColumnVoxelCenter(
          this._hitRes,
          this.state.columnSize,
        );
        return (
          <TextureBox
            opacity={0.7}
            dimension={vec3.fromValues(
              Math.max(
                1,
                Math.abs(this._hitRes.hitNormal[0]) * this.state.columnSize,
              ),
              Math.max(
                1,
                Math.abs(this._hitRes.hitNormal[1]) * this.state.columnSize,
              ),
              Math.max(
                1,
                Math.abs(this._hitRes.hitNormal[2]) * this.state.columnSize,
              ),
            )}
            position={centerPos}
            offset={vec3.fromValues(0.5, 0.5, 0.5)}
            blockType={terrainRecord.selectedVoxel[this.state.voxelType]}
            rotation={
              this._blockId_rotation_table[
                terrainRecord.selectedVoxel[this.state.voxelType]
              ]
            }
          ></TextureBox>
        );
      } else {
        return (
          <TextureBox
            opacity={0.7}
            dimension={vec3.fromValues(
              Math.max(
                1,
                (1 - Math.abs(this._hitRes.hitNormal[0])) * this.state.penSize,
              ),
              Math.max(
                1,
                (1 - Math.abs(this._hitRes.hitNormal[1])) * this.state.penSize,
              ),
              Math.max(
                1,
                (1 - Math.abs(this._hitRes.hitNormal[2])) * this.state.penSize,
              ),
            )}
            position={vec3.add(vec3.create(), center, this._hitRes.hitNormal)}
            offset={vec3.fromValues(0.5, 0.5, 0.5)}
            blockType={terrainRecord.selectedVoxel[this.state.voxelType]}
            rotation={
              this._blockId_rotation_table[
                terrainRecord.selectedVoxel[this.state.voxelType]
              ]
            }
          ></TextureBox>
        );
      }
    }
    return '';
  }

  private _handleSearchVoxel = (name: string) => {
    this.setState({
      searchText: name,
    });
  };

  private _handleSelectVoxelType = (type: BlockTab) => {
    this.setState(
      {
        voxelType: type,
      },
      () => {
        this._shouldUpdateScroll = true;
      },
    );
  };

  private _handleSetPenSize = (penSize: number) => {
    this.setState({
      penSize,
    });
  };

  private _handleTabChange = (tab: number) => {
    if (tab + 1 !== TerrainEditMode.remove) {
      if (!!terrainRecord.selectedVoxel[this.state.voxelType]) {
        this.props.handleSetIsTerrainPenActive(true);
      }
      return;
    }
    if (this._editMode !== TerrainEditMode.remove) {
      // 点击remove tab时，激活移除画笔
      this.props.handleSetIsTerrainPenActive(true);
    } else if (this._editMode === TerrainEditMode.remove) {
      // 再次点击remove tab时，取消移除画笔激活
      this.props.handleSetIsTerrainPenActive(!this.props.isTerrainPenActive);
    }
  };

  private _mouseDownListener = () => {
    this._isMouseDown = true;
  };

  private _mouseMoveListener = () => {
    if (this._isMouseDown) {
      this._isDragging = true;
    }
  };

  private _mouseUpListener = (button: number) => {
    this._isMouseDown = false;
    if (this._isDragging) {
      // 鼠标有滑动
      this._isDragging = false;
      return;
    }
    if (button === MouseButton.middle) {
      // scroll button
      this._handleSelectVoxel(this._hitRes.block);
      return;
    }
    if (
      button === MouseButton.left ||
      (this._editMode === TerrainEditMode.add && button !== MouseButton.right)
    ) {
      return;
    }
    if (!this.props.isTerrainPenActive) {
      return;
    }
    const targetVoxel =
      this._editMode === TerrainEditMode.remove
        ? 0
        : button === MouseButton.right
        ? 0
        : terrainRecord.selectedVoxel[this.state.voxelType];
    const voxelPositionList = getSquareVoxelList(
      this._hitRes,
      this.state.penSize,
      false,
    );
    for (const position of voxelPositionList) {
      this.voxelTransaction.push(
        position[0],
        position[1],
        position[2],
        targetVoxel,
      );
    }
    this.voxelTransaction.commit();
  };

  // only left button will trigger _clickListener
  private _clickListener = (button: number) => {
    if (!this.props.isTerrainPenActive) {
      return;
    }
    const isAdd =
      this._editMode === TerrainEditMode.add && button !== MouseButton.right;

    const targetVoxel =
      this._editMode === TerrainEditMode.remove
        ? 0
        : terrainRecord.selectedVoxel[this.state.voxelType];
    let voxelPositionList: vec3[];
    if (
      this._terrainAddPatten === TerrainAddPattern.column &&
      this._editMode === TerrainEditMode.add
    ) {
      voxelPositionList = getColumnVoxelList(
        this._hitRes,
        this.state.columnSize,
      );
    } else {
      voxelPositionList = getSquareVoxelList(
        this._hitRes,
        this.state.penSize,
        isAdd,
      );
    }
    for (const position of voxelPositionList) {
      if (!isAdd) {
        if (
          editor.game.state.voxel.getVoxel(
            position[0],
            position[1],
            position[2],
          ) !== 0
        ) {
          this.voxelTransaction.push(
            position[0],
            position[1],
            position[2],
            targetVoxel |
              (this._blockId_rotation_table[targetVoxel] <<
                VOXEL_ROTATION_SHIFT),
          );
        }
      } else {
        this.voxelTransaction.push(
          position[0],
          position[1],
          position[2],
          targetVoxel |
            (this._blockId_rotation_table[targetVoxel] << VOXEL_ROTATION_SHIFT),
        );
      }
    }
    this.voxelTransaction.commit();
    if (this._editMode !== TerrainEditMode.remove && targetVoxel > 0) {
      if (targetVoxel in terrainRecord.voxelUsed) {
        terrainRecord.voxelUsed[targetVoxel]++;
      } else {
        terrainRecord.voxelUsed[targetVoxel] = 0;
      }
      terrainRecord.lastVoxel = targetVoxel;
    }
  };

  /**
   * 选择 地形块 的回调
   ** 再次点击已选中的地形块时，会取消选中地形块，无法搭建地形，并且允许用户选择地图中的模型.
   ** 点击非当前选中的地形块，会选中所点击的地形块.
   */
  private _handleSelectVoxel = (id: number) => {
    this.props.handleSetIsTerrainPenActive(
      terrainRecord.selectedVoxel[this.state.voxelType] !== id,
    );
    terrainRecord.selectedVoxel[this.state.voxelType] =
      terrainRecord.selectedVoxel[this.state.voxelType] === id ? 0 : id;
  };

  private scrollToSelectedVoxel = () => {
    if (this._selectedElm) {
      this._selectedElm.scrollIntoView();
    }
  };

  private _handleExpandClick = () => {
    this.setState({
      expand: !this.state.expand,
    });
  };

  private _renderVoxelList = (isAdd: boolean) => {
    this._setEditMode(isAdd ? TerrainEditMode.add : TerrainEditMode.replace);
    let voxels: number[] = [];
    if (this.state.voxelType === RECENT_TAB) {
      const usedVoxels = Object.keys(terrainRecord.voxelUsed).filter(
        (id) => +id !== terrainRecord.lastVoxel,
      );
      voxels = usedVoxels
        .sort((a, b) => {
          return terrainRecord.voxelUsed[b] - terrainRecord.voxelUsed[a];
        })
        .map((id) => +id);
      if (terrainRecord.lastVoxel) {
        voxels.unshift(terrainRecord.lastVoxel);
      }
    } else {
      voxels = editor.game.state.blockInfo.category[this.state.voxelType] || [];
    }
    return (
      <div
        className={
          this.state.expand
            ? style.voxelListContainerExpanded
            : style.voxelListContainer
        }
      >
        <div className={style.search}>
          <Search onSearch={(s) => this._handleSearchVoxel(s)} size="small" />
        </div>
        <div className={style.voxelContent}>
          <div className={style.voxelTypeListWrapper}>
            <div className={style.voxelTypeList}>
              <div
                className={
                  this.state.voxelType === RECENT_TAB
                    ? style.activeVoxelType
                    : style.voxelType
                }
                onClick={() => this._handleSelectVoxelType(RECENT_TAB)}
              >
                <IconBlockRecently />
              </div>
              <div
                className={
                  this.state.voxelType === BlockCategory.element
                    ? style.activeVoxelType
                    : style.voxelType
                }
                onClick={() =>
                  this._handleSelectVoxelType(BlockCategory.element)
                }
              >
                <IconBlockLandform />
              </div>
              <div
                className={
                  this.state.voxelType === BlockCategory.nature
                    ? style.activeVoxelType
                    : style.voxelType
                }
                onClick={() =>
                  this._handleSelectVoxelType(BlockCategory.nature)
                }
              >
                <IconBlockNature />
              </div>
              <div
                className={
                  this.state.voxelType === BlockCategory.structure
                    ? style.activeVoxelType
                    : style.voxelType
                }
                onClick={() =>
                  this._handleSelectVoxelType(BlockCategory.structure)
                }
              >
                <IconBlockHome />
              </div>
              <div
                className={
                  this.state.voxelType === BlockCategory.light
                    ? style.activeVoxelType
                    : style.voxelType
                }
                onClick={() => this._handleSelectVoxelType(BlockCategory.light)}
              >
                <IconBlockLights />
              </div>
              <div
                className={
                  this.state.voxelType === BlockCategory.color
                    ? style.activeVoxelType
                    : style.voxelType
                }
                onClick={() => this._handleSelectVoxelType(BlockCategory.color)}
              >
                <IconBlockColor />
              </div>
              <div
                className={
                  this.state.voxelType === BlockCategory.letter
                    ? style.activeVoxelType
                    : style.voxelType
                }
                onClick={() =>
                  this._handleSelectVoxelType(BlockCategory.letter)
                }
              >
                <IconBlockFont />
              </div>
              <div
                className={
                  this.state.voxelType === BlockCategory.number
                    ? style.activeVoxelType
                    : style.voxelType
                }
                onClick={() =>
                  this._handleSelectVoxelType(BlockCategory.number)
                }
              >
                <IconBlockNumber />
              </div>
              <div
                className={
                  this.state.voxelType === BlockCategory.symbol
                    ? style.activeVoxelType
                    : style.voxelType
                }
                onClick={() =>
                  this._handleSelectVoxelType(BlockCategory.symbol)
                }
              >
                <IconBlockArithmetic />
              </div>
              <div
                className={
                  this.state.voxelType === BlockCategory.food
                    ? style.activeVoxelType
                    : style.voxelType
                }
                onClick={() => this._handleSelectVoxelType(BlockCategory.food)}
              >
                <IconBlockBreak />
              </div>
            </div>
          </div>
          <div className={style.voxelListWrapper}>
            {this.state.voxelType === RECENT_TAB && !voxels.length && (
              <div className={style.emptyTip}>
                {this.props.intl.formatMessage({ id: 'recentTerrainIsEmpty' })}
              </div>
            )}
            <div className={style.voxelListScrollWrapper}>
              <div className={style.voxelList}>
                {voxels.map((voxel) => {
                  const name = editor.game.state.blockIndex.name[voxel];
                  if (name.indexOf(this.state.searchText) >= 0) {
                    return (
                      <div
                        key={voxel}
                        className={style.voxel}
                        ref={(ref) => {
                          if (
                            ref &&
                            terrainRecord.selectedVoxel[
                              this.state.voxelType
                            ] === voxel
                          ) {
                            this._selectedElm = ref;
                          }
                        }}
                      >
                        <AnimatedBlock
                          id={voxel}
                          blockInfo={editor.game.state.blockInfo}
                          blockIndex={editor.game.state.blockIndex}
                          selected={
                            terrainRecord.selectedVoxel[
                              this.state.voxelType
                            ] === voxel
                          }
                          name={name}
                          rotation={this._blockId_rotation_table[voxel]}
                          onRotateVoxel={(id) => {
                            this._blockId_rotation_table[id] =
                              (this._blockId_rotation_table[id] - 1 + 4) % 4;
                          }}
                          onClick={(id) => this._handleSelectVoxel(id)}
                        />
                      </div>
                    );
                  } else {
                    return null;
                  }
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  private _renderRemoveVoxel = () => {
    this._setEditMode(TerrainEditMode.remove);
    return (
      <div className={style.rangePickerContainer}>
        <RangePicker
          value={this.state.penSize}
          range={[1, Math.max(5, this.state.penSize)]}
          onChange={this._handleSetPenSize}
        />
      </div>
    );
  };

  private _renderFooterPenSize = () => {
    return (
      <div className={style.footer}>
        {this._editMode === TerrainEditMode.add &&
        this._terrainAddPatten === TerrainAddPattern.column ? (
          <div className={style.footerWrapper}>
            <div
              className={style.columnIcon}
              onClick={() => {
                this._terrainAddPatten = TerrainAddPattern.slice;
              }}
            ></div>
            <div className={[style.footerRange, style.rangeSlider].join(' ')}>
              <Range
                value={this.state.columnSize}
                min={1}
                max={Math.max(10, this.state.columnSize)}
                step={1}
                onValueChange={(v: number) => {
                  this.setState({
                    columnSize: v,
                  });
                }}
              />
            </div>
            <div className={style.footerCounter}>
              <SizeNumber
                value={this.state.columnSize}
                onChange={(value) => {
                  this.setState({
                    columnSize: value,
                  });
                }}
                warningThreshold={10}
              />
            </div>
          </div>
        ) : (
          <div className={style.footerWrapper}>
            <div
              className={style.brushIcon}
              onClick={() => {
                if (this._editMode === TerrainEditMode.add) {
                  this._terrainAddPatten = TerrainAddPattern.column;
                }
              }}
            ></div>
            <div className={style.footerRange}>
              <RangePicker
                value={this.state.penSize}
                range={[1, Math.max(5, this.state.penSize)]}
                onChange={this._handleSetPenSize}
                small
              />
            </div>
            <div className={style.footerCounter}>
              <SizeNumber
                value={this.state.penSize}
                onChange={(value) => {
                  this.setState({
                    penSize: value,
                  });
                }}
                warningThreshold={5}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  public render() {
    return (
      <>
        <DetailPanel
          className={style.terrainPanel}
          hidden={this.props.isRunning}
          expand={
            this._editMode !== TerrainEditMode.remove
              ? this.state.expand
              : undefined
          }
          onExpand={this._handleExpandClick}
          contentList={[
            {
              title: this.props.intl.formatMessage({ id: 'add' }),
              content: () => this._renderVoxelList(true),
              tab: <IconAdd />,
              footer: this._renderFooterPenSize(),
              contentContainerStyle: {
                backgroundColor: '#595959E5',
                backdropFilter: 'blur(4px)',
              },
            },
            {
              title: this.props.intl.formatMessage({ id: 'remove' }),
              content: this._renderRemoveVoxel,
              tab: <IconSub />,
              contentContainerStyle: {
                backgroundColor: '#595959E5',
                backdropFilter: 'blur(4px)',
              },
            },
            {
              title: this.props.intl.formatMessage({ id: 'fill' }),
              content: () => this._renderVoxelList(false),
              tab: <IconFill />,
              footer: this._renderFooterPenSize(),
              contentContainerStyle: {
                backgroundColor: '#595959E5',
                backdropFilter: 'blur(4px)',
              },
            },
          ]}
          onSelectPage={this._handleTabChange}
        />
        {this._render3DIndicator()}
      </>
    );
  }
}
export const TerrainPanel = injectIntl(TerrainContainer);
