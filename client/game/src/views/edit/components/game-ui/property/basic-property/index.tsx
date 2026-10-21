import { ReactNode, memo, useCallback, useContext, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { AutoResizeType, UICoord2Keys } from '@box/schema/project/ui-rda/defs';
import {
  isUIElement,
  pickAutoLayoutProp,
} from '@box/schema/project/ui-rda/util';
import { IconSizeW, IconSizeH, IconPositionY, IconPositionX } from '@box/icons';
import type { ItemId, MenuItemOptions, SelectProps } from '@box/box-design';
import { RootState } from 'src/redux/edit';
import { useEdit } from 'src/client/edit/edit-context';
import { UICoord2Input, Props as UICoord2Props } from '../inputs/coord2-input';
import { AnchorInput } from './anchor-input';
import { ColorPropertyGroups, addColorGroup } from '../inputs/color-property';
import { ColorGroups } from '../inputs/color-input';
import { UITreeContext } from '../../hooks';
import { InlineNamedSpinInput } from '../inputs/inline-named-spin-input';
import {
  MergedConfig,
  isAutoResize,
  mergeAxisInputValue,
  mergeBasicType,
} from '../util';
import type { AxisInputValue } from '../inputs/axis-input';
import type { AnchorAxisValue } from '../inputs/anchor-axis-input';
import { InlineNamedCheckbox } from '../inputs/inline-named-checkbox';
import { InlineSelectInput } from '../inputs/select-input';
import styles from './style.module.scss';
import { DEGREES_TO_RAD, normalizeRotation } from 'src/engine/game-ui/util';

const AUTO_RESIZE_ITEMS: MenuItemOptions[] = [
  {
    id: AutoResizeType.NONE,
    text: 'None',
  },
  {
    id: AutoResizeType.X,
    text: 'X',
  },
  {
    id: AutoResizeType.Y,
    text: 'Y',
  },
  {
    id: AutoResizeType.XY,
    text: 'XY',
  },
];

export const BasicProperty = memo(() => {
  const selectedIds = useSelector(
    (state: RootState) => state.gameUI.selectedIds,
  );

  const intl = useIntl();

  const editor = useEdit();
  const { gameUIEditor } = editor;

  const uiTreeRef = useContext(UITreeContext);

  const {
    positionX,
    positionY,
    sizeX,
    sizeY,
    anchorX,
    anchorY,
    zIndex,
    autoResize,
    visible,
    layoutOrderConfig,
    clipsDescendants,
    colorGroups,
    rotation,
  } = useMemo(() => {
    let positionX: AxisInputValue | undefined;
    let positionY: AxisInputValue | undefined;

    let sizeX: AxisInputValue | undefined;
    let sizeY: AxisInputValue | undefined;

    let anchorX: AnchorAxisValue | undefined;
    let anchorY: AnchorAxisValue | undefined;

    let visible: MergedConfig<boolean> | undefined;

    let zIndex: MergedConfig<number> | undefined;

    let autoResize: MergedConfig<AutoResizeType> | undefined;

    let layoutOrderConfig: MergedConfig<number> | undefined;

    let clipsDescendants: MergedConfig<boolean> | undefined;

    let rotation: MergedConfig<number> | undefined;

    const bgColorInputs: ReactNode[] = [];

    const colorGroups: ColorGroups = {};

    const { uiTree } = uiTreeRef;

    selectedIds.forEach((id) => {
      const node = uiTree[id];

      if (
        !node ||
        !node.value ||
        !node.value.data ||
        !isUIElement(node.value)
      ) {
        return;
      }

      addColorGroup(
        colorGroups,
        id,
        node.value.data.data.backgroundColor,
        node.value.data.data.backgroundOpacity,
      );

      positionX = mergeAxisInputValue({
        out: positionX,
        coord2: node.value.data.data.position,
        type: 'x',
      });
      positionY = mergeAxisInputValue({
        out: positionY,
        coord2: node.value.data.data.position,
        type: 'y',
      });

      sizeX = mergeAxisInputValue({
        out: sizeX,
        coord2: node.value.data.data.size,
        type: 'x',
      });
      sizeY = mergeAxisInputValue({
        out: sizeY,
        coord2: node.value.data.data.size,
        type: 'y',
      });

      anchorX = mergeBasicType({
        out: anchorX,
        b: node.value.data.data.anchor[0],
      });
      anchorY = mergeBasicType({
        out: anchorY,
        b: node.value.data.data.anchor[1],
      });

      visible = mergeBasicType({
        out: visible,
        b: node.value.data.data.visible,
      });

      zIndex = mergeBasicType({
        out: zIndex,
        b: node.value.data.data.zIndex,
      });

      autoResize = mergeBasicType({
        out: autoResize,
        b: node.value.data.data.autoResize,
      });

      rotation = mergeBasicType({
        out: rotation,
        b: node.value.data.data.rotation / DEGREES_TO_RAD,
      });

      const parent = uiTree[node.parentId];

      if (parent && parent.value) {
        const parentAutoLayout = pickAutoLayoutProp(parent.value);

        if (parentAutoLayout) {
          positionX.disabled = true;
          positionY.disabled = true;

          anchorX.disabled = true;
          anchorY.disabled = true;

          if (!sizeX.disabled) {
            sizeX.disabled = parentAutoLayout.data.columnWidthEnabled;
          }
          if (!sizeY.disabled) {
            sizeY.disabled = parentAutoLayout.data.lineHeightEnabled;
          }
        }
      }

      layoutOrderConfig = mergeBasicType({
        out: layoutOrderConfig,
        b: node.value.data.data.layoutOrder,
      });

      clipsDescendants = mergeBasicType({
        out: clipsDescendants,
        b: node.value.data.data.clipsDescendants,
      });

      return;
    });

    return {
      positionX,
      positionY,
      sizeX,
      sizeY,
      anchorX,
      anchorY,
      zIndex,
      autoResize,
      visible,
      bgColorInputs,
      layoutOrderConfig,
      clipsDescendants,
      colorGroups,
      rotation,
    };
  }, [selectedIds, uiTreeRef]);

  const onChange = useCallback(
    (
      ids: string[],
      prop: 'position' | 'size',
      axis: 'x' | 'y',
      type: UICoord2Keys,
      val,
    ) => {
      if (prop === 'position') {
        gameUIEditor.uiTreeController.setElementsPosition(ids, axis, type, val);
      } else {
        gameUIEditor.uiTreeController.setElementsSize(ids, axis, type, val);
      }
    },
    [gameUIEditor],
  );

  const onPositionChange = useCallback<UICoord2Props['onChange']>(
    (ids, axis, type, val) => {
      onChange(ids, 'position', axis, type, val);
    },
    [onChange],
  );

  const onSizeChange = useCallback<UICoord2Props['onChange']>(
    (ids, axis, type, val) => {
      onChange(ids, 'size', axis, type, val);
    },
    [onChange],
  );

  const onAnchorChange = useCallback(
    (ids: string[], axis: 'x' | 'y', value: number) => {
      gameUIEditor.uiTreeController.setElementsAnchor(ids, axis, value);
    },
    [gameUIEditor],
  );

  const onZIndexChange = useCallback(
    (ids: string[], zIndex: number) => {
      gameUIEditor.uiTreeController.setElementsZIndex(ids, zIndex);
    },
    [gameUIEditor],
  );

  const onLayoutOrderChange = useCallback(
    (ids: string[], layoutOrder: number) => {
      gameUIEditor.uiTreeController.setNodesLayoutOrder(ids, layoutOrder);
    },
    [gameUIEditor],
  );

  const onAutoResizeChange = useCallback<SelectProps['onSelect']>(
    ({ id }: { id: ItemId }) => {
      if (isAutoResize(id)) {
        gameUIEditor.uiTreeController.setElementsAutoResize(selectedIds, id);
      }
    },
    [selectedIds, gameUIEditor],
  );

  const onVisibilityChange = useCallback(
    (visible: boolean) => {
      gameUIEditor.uiTreeController.setElementsVisible(selectedIds, visible);
    },
    [selectedIds, gameUIEditor],
  );

  const { onClipsDescendantsChange } = useMemo(() => {
    const onClipsDescendantsChange = (clipsDescendants: boolean) =>
      gameUIEditor.uiTreeController.setElementsClipsDescendants(
        selectedIds,
        clipsDescendants,
      );

    return {
      onClipsDescendantsChange: onClipsDescendantsChange,
    };
  }, [gameUIEditor, selectedIds]);

  const onRotationChanged = useCallback(
    (ids: string[], val: number) => {
      const normalized = normalizeRotation(val);

      gameUIEditor.uiTreeController.setElementsRotation(
        ids,
        normalized * DEGREES_TO_RAD,
      );
    },
    [gameUIEditor],
  );

  return (
    <div className={styles.basicProperty}>
      {positionX && positionY && (
        <UICoord2Input
          title={intl.formatMessage({
            id: 'gameUIPropPosition',
          })}
          x={positionX}
          y={positionY}
          onChange={onPositionChange}
          prefixX={<IconPositionX />}
          prefixY={<IconPositionY />}
        />
      )}
      {sizeX && sizeY && (
        <UICoord2Input
          title={intl.formatMessage({
            id: 'gameUIPropSize',
          })}
          x={sizeX}
          y={sizeY}
          onChange={onSizeChange}
          prefixX={<IconSizeW />}
          prefixY={<IconSizeH />}
        />
      )}
      {anchorX && anchorY && (
        <AnchorInput x={anchorX} y={anchorY} onChange={onAnchorChange} />
      )}
      {rotation && (
        <InlineNamedSpinInput
          name={intl.formatMessage({
            id: 'gameUIPropRotation',
          })}
          value={rotation.value}
          mixed={rotation.mixed}
          precision={0}
          min={-Infinity}
          max={Infinity}
          onChange={onRotationChanged}
        />
      )}
      {autoResize && (
        <InlineSelectInput
          name={intl.formatMessage({
            id: 'gameUIPropAutoResize',
          })}
          items={AUTO_RESIZE_ITEMS}
          selection={autoResize.value}
          mixed={autoResize.mixed}
          onSelect={onAutoResizeChange}
        />
      )}
      {zIndex && (
        <InlineNamedSpinInput
          name={intl.formatMessage({
            id: 'gameUIPropZIndex',
          })}
          value={zIndex.value}
          mixed={zIndex.mixed}
          onChange={onZIndexChange}
        />
      )}
      {layoutOrderConfig && (
        <InlineNamedSpinInput
          name={intl.formatMessage({
            id: 'gameUIPropLayoutOrder',
          })}
          value={layoutOrderConfig.value}
          mixed={layoutOrderConfig.mixed}
          onChange={onLayoutOrderChange}
        />
      )}
      {clipsDescendants && (
        <InlineNamedCheckbox
          {...clipsDescendants}
          name={intl.formatMessage({
            id: 'gameUIPropClipsDescendants',
          })}
          onChange={onClipsDescendantsChange}
        />
      )}
      {visible && (
        <InlineNamedCheckbox
          name={intl.formatMessage({
            id: 'gameUIPropVisibility',
          })}
          value={visible.value}
          mixed={visible.mixed}
          onChange={onVisibilityChange}
        />
      )}
      <ColorPropertyGroups
        groupName={intl.formatMessage({
          id: 'gameUIPropBgColor',
        })}
        groups={colorGroups}
        onColorChange={editor.gameUIEditor.uiTreeController.setElementsBgColor}
        onOpacityChange={
          editor.gameUIEditor.uiTreeController.setElementsBgOpacity
        }
      />
    </div>
  );
});
