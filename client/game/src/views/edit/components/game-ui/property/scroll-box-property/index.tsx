import { vec2 } from 'gl-matrix';
import { memo, useContext, useMemo } from 'react';
import { useIntl } from 'react-intl';

import type { ItemId, SelectProps } from '@box/box-design';
import {
  AutoResizeType,
  UIScrollDirection,
  UIScrollbarHorizontal,
  UIScrollbarVertical,
  UIScrollbarVisibility,
} from '@box/schema/project/ui-rda/defs';
import { isUIScrollBoxNode } from '@box/schema/project/ui-rda/util';
import { IconPixel, IconSizeH, IconSizeW } from '@box/icons/build';

import { InlineSelectInput } from '../inputs/select-input';
import {
  MergedConfig,
  isAutoResize,
  isScrollDirection,
  isScrollbarHorizontal,
  isScrollbarVertical,
  isScrollbarVisibility,
  mergeAxisInputValue,
  mergeBasicType,
} from '../util';
import { UITreeContext } from '../../hooks';
import { TabInput, TabInputProps } from '../inputs/tab-input';
import { InlineNamedSpinInput } from '../inputs/inline-named-spin-input';
import { AUTO_RESIZE_ITEMS } from '../defs';
import { CoordInput, CoordInputProps } from '../inputs/coord-input';
import type { AxisInputValue } from '../inputs/axis-input';
import { OnCoord2InputChange, UICoord2Input } from '../inputs/coord2-input';
import { useEdit } from 'src/client/edit/edit-context';
import { SpinInputProps } from '../inputs/spin-input';
import { ColorGroups } from '../inputs/color-input';
import { ColorPropertyGroups, addColorGroup } from '../inputs/color-property';
import type { AnchorAxisValue } from '../inputs/anchor-axis-input';

import styles from './style.module.scss';

const TEMP_VEC2_1: vec2 = [0, 0];
const TEMP_VEC2_2: vec2 = [0, 0];

function ScrollBoxPropertyView(props: { ids: string[] }) {
  const { ids } = props;

  const intl = useIntl();

  const scrollDirections = useMemo<SelectProps['items']>(
    () => [
      {
        id: UIScrollDirection.X,
        text: 'X',
      },
      {
        id: UIScrollDirection.Y,
        text: 'Y',
      },
      {
        id: UIScrollDirection.XY,
        text: 'XY',
      },
    ],
    [],
  );

  const scrollbarVisibilities = useMemo<SelectProps['items']>(
    () => [
      {
        id: UIScrollbarVisibility.Hidden,
        text: intl.formatMessage({ id: 'gameUIPropScrollbarNever' }),
      },
      {
        id: UIScrollDirection.Y,
        text: intl.formatMessage({ id: 'gameUIPropScrollbarAvailable' }),
      },
    ],
    [intl],
  );

  const uiTreeRef = useContext(UITreeContext);
  const { gameUIEditor } = useEdit();

  const {
    direction,
    scrollbarHorizontal,
    scrollbarVertical,
    scrollbarVisibility,
    scrollbarThickness,
    canvasAutoResize,
    sizeX,
    sizeY,
    scrollTop,
    scrollLeft,
    colorGroups,
  } = useMemo(() => {
    let direction: MergedConfig<UIScrollDirection> | undefined;
    let scrollbarHorizontal: MergedConfig<UIScrollbarHorizontal> | undefined;
    let scrollbarVertical: MergedConfig<UIScrollbarVertical> | undefined;
    let scrollbarVisibility: MergedConfig<UIScrollbarVisibility> | undefined;
    let scrollbarThickness: MergedConfig<number> | undefined;
    let canvasAutoResize: MergedConfig<AutoResizeType> | undefined;
    let sizeX: AxisInputValue | undefined;
    let sizeY: AxisInputValue | undefined;
    let scrollLeft: AnchorAxisValue | undefined;
    let scrollTop: AnchorAxisValue | undefined;

    const colorGroups: ColorGroups = {};

    const { uiTree } = uiTreeRef;

    vec2.zero(TEMP_VEC2_1);
    vec2.zero(TEMP_VEC2_2);

    ids.forEach((id) => {
      const node = uiTree[id];

      if (!node || !node.value || !isUIScrollBoxNode(node.value)) {
        return;
      }

      const { data } = node.value.data;

      addColorGroup(
        colorGroups,
        id,
        data.scrollbarColor,
        data.scrollbarOpacity,
      );

      direction = mergeBasicType({
        out: direction,
        b: data.scrollDirection,
      });

      // 如果配置了水平方向的滚动，那么滚动条可配置上/下
      if (
        [UIScrollDirection.X, UIScrollDirection.XY].includes(
          data.scrollDirection,
        )
      ) {
        scrollbarVertical = mergeBasicType({
          out: scrollbarVertical,
          b: data.scrollbarVertical,
        });
      }

      // 如果配置了垂直方向的滚动，那么滚动条可配置左/右
      if (
        [UIScrollDirection.Y, UIScrollDirection.XY].includes(
          data.scrollDirection,
        )
      ) {
        scrollbarHorizontal = mergeBasicType({
          out: scrollbarHorizontal,
          b: data.scrollbarHorizontal,
        });
      }

      scrollbarVisibility = mergeBasicType({
        out: scrollbarVisibility,
        b: data.scrollbarVisibility,
      });

      scrollbarThickness = mergeBasicType({
        out: scrollbarThickness,
        b: data.scrollbarThickness,
      });

      canvasAutoResize = mergeBasicType({
        out: canvasAutoResize,
        b: data.scrollCanvasAutoResize,
      });

      sizeX = mergeAxisInputValue({
        out: sizeX,
        coord2: data.scrollCanvasSize,
        type: 'x',
      });
      sizeY = mergeAxisInputValue({
        out: sizeY,
        coord2: data.scrollCanvasSize,
        type: 'y',
      });

      scrollLeft = mergeBasicType({
        out: scrollLeft,
        b: data.scrollPosition[0],
      });
      scrollTop = mergeBasicType({
        out: scrollTop,
        b: data.scrollPosition[1],
      });

      if (scrollLeft) {
        scrollLeft.max = Infinity;
      }
      if (scrollTop) {
        scrollTop.max = Infinity;
      }
    });

    return {
      direction,
      scrollbarHorizontal,
      scrollbarVertical,
      scrollbarVisibility,
      scrollbarThickness,
      canvasAutoResize,
      sizeX,
      sizeY,
      colorGroups,
      scrollLeft,
      scrollTop,
    };
  }, [ids, uiTreeRef]);

  const {
    onScrollPositionChange,
    onScrollCanvasAutoResizeChange,
    onScrollCanvasSizeChange,
    onScrollDirectionChange,
    onScrollbarHorizontalChange,
    onScrollbarVerticalChange,
    onScrollbarVisibilityChange,
    onScrollbarThicknessChange,
  } = useMemo(() => {
    const onScrollPositionChange: CoordInputProps['onChange'] = (
      axis,
      ids,
      val,
    ) => {
      gameUIEditor.uiTreeController.setScrollAxisPosition(ids, axis, val);
    };

    const onScrollCanvasAutoResizeChange: SelectProps['onSelect'] = ({
      id,
    }) => {
      if (isAutoResize(id)) {
        gameUIEditor.uiTreeController.setScrollCanvasAutoResize(ids, id);
      }
    };

    const onScrollCanvasSizeChange: OnCoord2InputChange = (
      ids,
      axis,
      type,
      val,
    ) => {
      gameUIEditor.uiTreeController.setScrollCanvasSize(ids, axis, type, val);
    };

    const onScrollDirectionChange: SelectProps['onSelect'] = ({ id }) => {
      if (isScrollDirection(id)) {
        gameUIEditor.uiTreeController.setScrollDirections(ids, id);
      }
    };

    const onScrollbarHorizontalChange: TabInputProps['onChange'] = (id) => {
      if (isScrollbarHorizontal(id)) {
        gameUIEditor.uiTreeController.setScrollbarHorizontal(ids, id);
      }
    };
    const onScrollbarVerticalChange: TabInputProps['onChange'] = (id) => {
      if (isScrollbarVertical(id)) {
        gameUIEditor.uiTreeController.setScrollbarVertical(ids, id);
      }
    };

    const onScrollbarVisibilityChange: SelectProps['onSelect'] = ({ id }) => {
      if (isScrollbarVisibility(id)) {
        gameUIEditor.uiTreeController.setScrollbarVisibility(ids, id);
      }
    };

    const onScrollbarThicknessChange: SpinInputProps['onChange'] = (
      ids,
      val,
    ) => {
      gameUIEditor.uiTreeController.setScrollbarThickness(ids, val);
    };

    return {
      onScrollPositionChange,
      onScrollCanvasAutoResizeChange,
      onScrollCanvasSizeChange,
      onScrollDirectionChange,
      onScrollbarHorizontalChange,
      onScrollbarVerticalChange,
      onScrollbarVisibilityChange,
      onScrollbarThicknessChange,
    };
  }, [ids, gameUIEditor]);

  return (
    <div className={styles.scrollBoxProperty}>
      <div className={styles.subTitle}>
        {intl.formatMessage({ id: 'gameUIPropScrollbar' })}
      </div>
      {direction && (
        <InlineSelectInput
          name={intl.formatMessage({ id: 'gameUIPropScrollDirection' })}
          items={scrollDirections}
          selection={direction.value}
          mixed={direction.mixed}
          onSelect={onScrollDirectionChange}
        />
      )}
      <ScrollbarPositions
        horizontal={scrollbarHorizontal}
        vertical={scrollbarVertical}
        onHorizontalChange={onScrollbarHorizontalChange}
        onVerticalChange={onScrollbarVerticalChange}
      />
      {scrollbarVisibility && (
        <InlineSelectInput
          // 这里也叫可见性，所以用和基础属性“可见性”一样的id
          name={intl.formatMessage({ id: 'gameUIPropVisibility' })}
          items={scrollbarVisibilities}
          selection={scrollbarVisibility.value}
          mixed={scrollbarVisibility.mixed}
          onSelect={onScrollbarVisibilityChange}
        />
      )}
      {scrollbarThickness && (
        <InlineNamedSpinInput
          name={intl.formatMessage({ id: 'gameUIPropScrollbarThickness' })}
          value={scrollbarThickness.value}
          mixed={scrollbarThickness.mixed}
          min={0}
          onChange={onScrollbarThicknessChange}
        />
      )}
      <ColorPropertyGroups
        groupName={intl.formatMessage({ id: 'gameUIPropScrollbarColor' })}
        groups={colorGroups}
        onColorChange={gameUIEditor.uiTreeController.setScrollbarColor}
        onOpacityChange={gameUIEditor.uiTreeController.setScrollbarOpacity}
      />
      <div className={styles.divider} />
      <div className={styles.subTitle}>
        {intl.formatMessage({ id: 'gameUIPropScrollCanvas' })}
      </div>
      {canvasAutoResize && (
        <InlineSelectInput
          /**
           * 和基础属性的自适应一样，用同个id
           */
          name={intl.formatMessage({ id: 'gameUIPropAutoResize' })}
          items={AUTO_RESIZE_ITEMS}
          selection={canvasAutoResize.value}
          mixed={canvasAutoResize.mixed}
          onSelect={onScrollCanvasAutoResizeChange}
        />
      )}
      {scrollLeft && scrollTop && (
        <CoordInput
          name={intl.formatMessage({ id: 'gameUIPropPosition' })}
          suffix={<IconPixel />}
          x={scrollLeft}
          y={scrollTop}
          onChange={onScrollPositionChange}
        />
      )}
      {sizeX && sizeY && (
        <UICoord2Input
          title={intl.formatMessage({ id: 'gameUIPropSize' })}
          prefixX={<IconSizeW />}
          prefixY={<IconSizeH />}
          x={sizeX}
          y={sizeY}
          onChange={onScrollCanvasSizeChange}
        />
      )}
    </div>
  );
}

export const ScrollBoxProperty = memo(ScrollBoxPropertyView);

const ScrollbarPositions = memo(
  (props: {
    horizontal?: MergedConfig<UIScrollbarHorizontal>;
    vertical?: MergedConfig<UIScrollbarVertical>;
    onHorizontalChange: (value: ItemId) => void;
    onVerticalChange: (value: ItemId) => void;
  }) => {
    const { horizontal, vertical, onHorizontalChange, onVerticalChange } =
      props;
    const intl = useIntl();

    const { horizontalTabs, verticalTabs } = useMemo(
      () => ({
        /**
         * 纵向的滚动条，配置左或右
         */
        horizontalTabs: [
          {
            id: UIScrollbarHorizontal.Left,
            tab: intl.formatMessage({ id: 'gameUIPropScrollbarLeft' }),
          },
          {
            id: UIScrollbarHorizontal.Right,
            tab: intl.formatMessage({ id: 'gameUIPropScrollbarRight' }),
          },
        ],
        /**
         * 横向的滚动条，配置上或下
         */
        verticalTabs: [
          {
            id: UIScrollbarVertical.Top,
            tab: intl.formatMessage({ id: 'gameUIPropScrollbarTop' }),
          },
          {
            id: UIScrollbarVertical.Bottom,
            tab: intl.formatMessage({ id: 'gameUIPropScrollbarBottom' }),
          },
        ],
      }),
      [intl],
    );

    return (
      <div className={styles.scrollbarPositions}>
        <div className={styles.title}>
          {intl.formatMessage({ id: 'gameUIPropScrollbarPos' })}
        </div>
        {vertical && (
          <TabInput
            name={intl.formatMessage({ id: 'gameUIPropScrollbarHorizontal' })}
            items={verticalTabs}
            mixed={vertical.mixed}
            value={vertical.value}
            onChange={onVerticalChange}
          />
        )}
        {horizontal && (
          <TabInput
            name={intl.formatMessage({ id: 'gameUIPropScrollbarVertical' })}
            items={horizontalTabs}
            mixed={horizontal.mixed}
            value={horizontal.value}
            onChange={onHorizontalChange}
          />
        )}
      </div>
    );
  },
);
