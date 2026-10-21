import { memo, useContext, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { pickAutoLayoutProp } from '@box/schema/project/ui-rda/util';
import {
  AutoLayoutFillDirection,
  AutoLayoutHorizontalAlignType,
  AutoLayoutStartCorner,
  AutoLayoutVerticalAlignType,
  UIAutoLayoutType,
} from '@box/schema/project/ui-rda/defs';
import { IconPositionX, IconPositionY } from '@box/icons';
import { MenuItemOptions } from '@box/box-design';
import { useEdit } from 'src/client/edit/edit-context';
import { CheckboxSwitch, CheckboxSwitchProps } from '../inputs/checkbox-switch';
import {
  AxisInput,
  AxisInputProps,
  AxisInputValue,
} from '../inputs/axis-input';
import { InlineSelectInput, SelectInputProps } from '../inputs/select-input';
import { UITreeContext } from '../../hooks';
import {
  MergedConfig,
  composeMergeConfig,
  isFillDirection,
  isStartCorner,
  mergeBasicType,
  mergeAxisInputValue,
} from '../util';
import { TabInput, TabInputProps } from '../inputs/tab-input';
import { InlineNamedSpinInput } from '../inputs/inline-named-spin-input';
import { OnCoord2InputChange, UICoord2Input } from '../inputs/coord2-input';
import { AlignmentsProps, AutoLayoutAlignments } from './alignments';
import styles from './style.module.scss';

type Props = {
  ids: string[];
};

type CellSizeConfig = {
  switch: Pick<CheckboxSwitchProps, 'enabled' | 'mixedEnabled'>;
  input?: AxisInputValue;
};

function AutoLayoutPropertyView(props: Props) {
  const { ids } = props;

  const intl = useIntl();
  const { gameUIEditor } = useEdit();

  const uiTreeRef = useContext(UITreeContext);

  const startCorners: MenuItemOptions[] = useMemo(
    () => [
      {
        id: AutoLayoutStartCorner.TopLeft,
        text: intl.formatMessage({ id: 'gameUIPropCornerTopLeft' }),
      },
      {
        id: AutoLayoutStartCorner.TopRight,
        text: intl.formatMessage({ id: 'gameUIPropCornerTopRight' }),
      },
      {
        id: AutoLayoutStartCorner.BottomLeft,
        text: intl.formatMessage({ id: 'gameUIPropCornerBottomLeft' }),
      },
      {
        id: AutoLayoutStartCorner.BottomRight,
        text: intl.formatMessage({ id: 'gameUIPropCornerBottomRight' }),
      },
    ],
    [intl],
  );

  const fillDirections: TabInputProps['items'] = useMemo(
    () => [
      {
        id: AutoLayoutFillDirection.Horizontal,
        tab: intl.formatMessage({ id: 'gameUIPropDirectionHorizontal' }),
      },
      {
        id: AutoLayoutFillDirection.Vertical,
        tab: intl.formatMessage({ id: 'gameUIPropDirectionVertical' }),
      },
    ],
    [intl],
  );

  const {
    lineHeightConfig,
    columnWidthConfig,
    startCornerConfig,
    fillDirectionConfig,
    maxCellsConfig,
    cellPaddingX,
    cellPaddingY,
    horizontalAlignment,
    verticalAlignment,
  } = useMemo(() => {
    let lineHeightConfig: CellSizeConfig | undefined;
    let columnWidthConfig: CellSizeConfig | undefined;

    let startCornerConfig: MergedConfig<AutoLayoutStartCorner> | undefined;
    let fillDirectionConfig: MergedConfig<AutoLayoutFillDirection> | undefined;
    let maxCellsConfig: MaxCellsConfig | undefined;
    let cellPaddingX: AxisInputValue | undefined;
    let cellPaddingY: AxisInputValue | undefined;
    let horizontalAlignment:
      | MergedConfig<AutoLayoutHorizontalAlignType>
      | undefined;
    let verticalAlignment:
      | MergedConfig<AutoLayoutVerticalAlignType>
      | undefined;

    const { uiTree } = uiTreeRef;

    ids.forEach((id) => {
      const node = uiTree[id];

      if (!node || !node.value) {
        return;
      }

      const autoLayout = pickAutoLayoutProp(node.value);

      if (!autoLayout) {
        return;
      }

      lineHeightConfig = mergeCellSizeConfig({
        out: lineHeightConfig,
        autoLayout: autoLayout.data,
        enabled: autoLayout.data.lineHeightEnabled,
        type: 'y',
      });

      columnWidthConfig = mergeCellSizeConfig({
        out: columnWidthConfig,
        autoLayout: autoLayout.data,
        enabled: autoLayout.data.columnWidthEnabled,
        type: 'x',
      });

      startCornerConfig = mergeBasicType({
        out: startCornerConfig,
        b: autoLayout.data.startCorner,
      });

      fillDirectionConfig = mergeBasicType({
        out: fillDirectionConfig,
        b: autoLayout.data.fillDirection,
      });

      maxCellsConfig = mergeMaxCells({
        out: maxCellsConfig,
        b: autoLayout.data,
      });
      if (maxCellsConfig.value.maxCells) {
        maxCellsConfig.value.maxCells = mergeBasicType({
          out: maxCellsConfig.value.maxCells,
          b: autoLayout.data.maxCells,
        });
      }

      cellPaddingX = mergeAxisInputValue({
        out: cellPaddingX,
        coord2: autoLayout.data.cellPadding,
        type: 'x',
      });
      cellPaddingY = mergeAxisInputValue({
        out: cellPaddingY,
        coord2: autoLayout.data.cellPadding,
        type: 'y',
      });

      horizontalAlignment = mergeBasicType({
        out: horizontalAlignment,
        b: autoLayout.data.horizontalAlignment,
      });

      verticalAlignment = mergeBasicType({
        out: verticalAlignment,
        b: autoLayout.data.verticalAlignment,
      });
    });

    return {
      lineHeightConfig,
      columnWidthConfig,
      startCornerConfig,
      fillDirectionConfig,
      maxCellsConfig,
      cellPaddingX,
      cellPaddingY,
      horizontalAlignment,
      verticalAlignment,
    };
  }, [ids, uiTreeRef]);

  const {
    onLineHeightEnabledChange,
    onLineHeightChange,
    onColumnWidthEnabledChange,
    onColumnWidthChange,
    onStartCornerChange,
    onFillDirectionChange,
    onMaxCellsEnabledChange,
    onMaxCellsChange,
    onCellPaddingChange,
    onAlignmentsChange,
  } = useMemo(() => {
    const onLineHeightEnabledChange: AxisInputSwitchProps['onEnabledChange'] = (
      value: boolean,
      mixed: boolean,
    ) => {
      const enabled = mixed ? true : value;

      gameUIEditor.uiTreeController.toggleNodesLayoutCellSize(
        ids,
        'lineHeightEnabled',
        enabled,
      );
    };

    const onLineHeightChange: AxisInputSwitchProps['onInputChange'] = (
      ids,
      type,
      val,
    ) => {
      gameUIEditor.uiTreeController.setNodesCellSize(ids, type, 'y', val);
    };

    const onColumnWidthEnabledChange = (value: boolean, mixed: boolean) => {
      const enabled = mixed ? true : value;

      gameUIEditor.uiTreeController.toggleNodesLayoutCellSize(
        ids,
        'columnWidthEnabled',
        enabled,
      );
    };

    const onColumnWidthChange: AxisInputSwitchProps['onInputChange'] = (
      ids,
      type,
      val,
    ) => {
      gameUIEditor.uiTreeController.setNodesCellSize(ids, type, 'x', val);
    };

    const onStartCornerChange: SelectInputProps['onSelect'] = ({ id }) => {
      if (isStartCorner(id)) {
        gameUIEditor.uiTreeController.setNodesStartCorner(ids, id);
      }
    };

    const onFillDirectionChange: TabInputProps['onChange'] = (id) => {
      if (isFillDirection(id)) {
        gameUIEditor.uiTreeController.setNodesFillDirection(ids, id);
      }
    };

    const onMaxCellsEnabledChange = (value: boolean, mixed: boolean) => {
      const enabled = mixed ? true : value;

      gameUIEditor.uiTreeController.toggleNodesMaxCells(ids, enabled);
    };

    const onMaxCellsChange = (ids, value: number) => {
      gameUIEditor.uiTreeController.setNodesMaxCells(ids, value);
    };

    const onCellPaddingChange: OnCoord2InputChange = (ids, axis, type, val) => {
      gameUIEditor.uiTreeController.setNodesCellPadding(ids, type, axis, val);
    };

    const onAlignmentsChange: AlignmentsProps['onChange'] = (
      horizontal,
      vertical,
    ) => {
      gameUIEditor.uiTreeController.setNodesAlignments(
        ids,
        horizontal,
        vertical,
      );
    };

    return {
      onLineHeightEnabledChange,
      onLineHeightChange,
      onColumnWidthEnabledChange,
      onColumnWidthChange,
      onStartCornerChange,
      onFillDirectionChange,
      onMaxCellsEnabledChange,
      onMaxCellsChange,
      onCellPaddingChange,
      onAlignmentsChange,
    };
  }, [ids, gameUIEditor]);

  return (
    <div className={styles.autoLayout}>
      <div className={styles.cellSize}>
        {lineHeightConfig && (
          <AxisInputSwitch
            name={intl.formatMessage({ id: 'gameUIPropLineHeight' })}
            onEnabledChange={onLineHeightEnabledChange}
            onInputChange={onLineHeightChange}
            prefix={<IconPositionX />}
            switch={lineHeightConfig.switch}
            input={lineHeightConfig.input}
          />
        )}
        {columnWidthConfig && (
          <AxisInputSwitch
            name={intl.formatMessage({ id: 'gameUIPropColumnWidth' })}
            onEnabledChange={onColumnWidthEnabledChange}
            onInputChange={onColumnWidthChange}
            prefix={<IconPositionY />}
            switch={columnWidthConfig.switch}
            input={columnWidthConfig.input}
          />
        )}
      </div>
      <div className={styles.divider} />
      {startCornerConfig && (
        <InlineSelectInput
          name={intl.formatMessage({ id: 'gameUIPropStartCorner' })}
          mixed={startCornerConfig.mixed}
          selection={startCornerConfig.value}
          items={startCorners}
          onSelect={onStartCornerChange}
        />
      )}
      {fillDirectionConfig && (
        <TabInput
          name={intl.formatMessage({ id: 'gameUIPropFillDirection' })}
          mixed={fillDirectionConfig.mixed}
          value={fillDirectionConfig.value}
          items={fillDirections}
          onChange={onFillDirectionChange}
        />
      )}
      {maxCellsConfig && (
        <CheckboxSwitch
          name={intl.formatMessage({ id: 'gameUIPropMaxCells' })}
          enabled={maxCellsConfig.value.maxCellsEnabled}
          mixedEnabled={maxCellsConfig.mixed}
          onEnabledChange={onMaxCellsEnabledChange}
        >
          {maxCellsConfig.value.maxCells && (
            <InlineNamedSpinInput
              name={intl.formatMessage({ id: 'gameUIPropRowOrColumn' })}
              mixed={maxCellsConfig.value.maxCells.mixed}
              value={maxCellsConfig.value.maxCells.value}
              onChange={onMaxCellsChange}
              min={1}
            />
          )}
        </CheckboxSwitch>
      )}
      {cellPaddingX && cellPaddingY && (
        <UICoord2Input
          title={intl.formatMessage({ id: 'gameUIPropCellPadding' })}
          x={cellPaddingX}
          y={cellPaddingY}
          prefixX={<IconPositionX />}
          prefixY={<IconPositionY />}
          onChange={onCellPaddingChange}
        />
      )}
      {horizontalAlignment && verticalAlignment && (
        <AutoLayoutAlignments
          horizontal={horizontalAlignment}
          vertical={verticalAlignment}
          onChange={onAlignmentsChange}
        />
      )}
    </div>
  );
}

export const AutoLayoutProperty = memo(AutoLayoutPropertyView);

interface AxisInputSwitchProps extends CellSizeConfig {
  name: string;
  prefix: AxisInputProps['prefix'];
  onEnabledChange: CheckboxSwitchProps['onEnabledChange'];
  onInputChange: AxisInputProps['onChange'];
}

const AxisInputSwitch = memo((props: AxisInputSwitchProps) => {
  const {
    name,
    prefix,
    onEnabledChange,
    onInputChange,
    switch: checkboxSwitch,
    input: input,
  } = props;

  return (
    <CheckboxSwitch
      name={name}
      onEnabledChange={onEnabledChange}
      {...checkboxSwitch}
    >
      {input && (
        <AxisInput prefix={prefix} onChange={onInputChange} {...input} />
      )}
    </CheckboxSwitch>
  );
});

function mergeCellSizeConfig(spec: {
  out?: CellSizeConfig;
  autoLayout: UIAutoLayoutType;
  enabled: boolean;
  type: 'x' | 'y';
}): CellSizeConfig {
  const { out, autoLayout, enabled, type } = spec;

  const idx = type === 'x' ? 0 : 1;

  if (!out) {
    return {
      switch: {
        enabled,
        mixedEnabled: false,
      },
      input: {
        offset: {
          value: autoLayout.cellSize.offset[idx],
          mixed: false,
        },
        ratio: {
          value: autoLayout.cellSize.ratio[idx],
          mixed: false,
        },
      },
    };
  }

  if (!out.switch.mixedEnabled) {
    out.switch.mixedEnabled = out.switch.enabled !== enabled;

    if (out.switch.mixedEnabled) {
      out.input = undefined;
    } else {
      out.input = mergeAxisInputValue({
        out: out.input,
        coord2: autoLayout.cellSize,
        type,
      });
    }
  }

  return out;
}

type MaxCellsConfig = MergedConfig<{
  maxCellsEnabled: boolean;
  maxCells?: MergedConfig<number>;
}>;

const mergeMaxCells = composeMergeConfig<
  MaxCellsConfig['value'],
  Pick<UIAutoLayoutType, 'maxCells' | 'maxCellsEnabled'>
>(
  (a, b) => a.maxCellsEnabled !== b.maxCellsEnabled,
  (b, a) => {
    if (!a) {
      return {
        maxCellsEnabled: b.maxCellsEnabled,
        maxCells: {
          mixed: false,
          value: b.maxCells,
        },
      };
    }

    a.maxCells = undefined;

    return a;
  },
);
