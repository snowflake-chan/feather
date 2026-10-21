import React, {
  useContext,
  useMemo,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useCallback,
} from 'react';
import {
  SharedTipsContext,
  ToolbarMenuContext,
  ToolbarMenuContextProps,
} from '../context';
import { useSharedTipsDelay } from '../hooks';
import { ComponentOptions, ItemId } from '../interfaces';
import { Icon } from '../icon';
import { TooltipTrigger, TooltipTriggerOptions } from '../tooltip';
import { useClassName, useInteraction } from '../util';
import styles from './style.module.scss';
import ArrowSvg from './tool-expand-nor.svg';

export interface ToolbarOptions extends ComponentOptions {
  children: ReactNode;
  onSelect: (data: { id: ItemId }) => void;
  defaultSelection?: ItemId;
  selection?: ItemId;
}

export function Toolbar(props: ToolbarOptions) {
  const {
    children,
    className: OptionClassName,
    style,
    onSelect,
    defaultSelection,
    selection: optionSelection,
  } = props;

  const className = useClassName([styles.toolbar, OptionClassName]);

  const onItemSelect: ToolbarMenuContextProps['onItemSelect'] = (options) => {
    const { id: key } = options;

    setSelection(key);

    onSelect({ id: key });
  };

  const [selection, setSelection] = useState<
    ToolbarMenuContextProps['selectedItem']
  >(() => {
    defaultSelection && onSelect({ id: defaultSelection });

    return defaultSelection;
  });

  const selectedItem = optionSelection || selection;

  const sharedTipsDelay = useSharedTipsDelay();

  const { setDisplayed } = sharedTipsDelay;

  const onPointerLeave = useCallback(() => {
    setDisplayed(false);
  }, [setDisplayed]);

  return (
    <ToolbarMenuContext.Provider
      value={{
        selectedItem,
        onItemSelect,
      }}
    >
      <SharedTipsContext.Provider value={sharedTipsDelay}>
        <div
          className={className}
          style={style}
          onPointerLeave={onPointerLeave}
        >
          {children}
        </div>
      </SharedTipsContext.Provider>
    </ToolbarMenuContext.Provider>
  );
}

export interface ToolItemOptions {
  id: ItemId;
  /**
   * Icon节点
   */
  icon: ReactNode;
  /**
   * 是否被禁用
   */
  disabled?: boolean;
  /**
   * 子节点，如果有这个参数，说明有子菜单
   */
  children?: ReactNode;
  /**
   * 二级菜单的选项
   */
  subSelections?: { id: ItemId; icon: string | ReactNode }[];
  /**
   * 工具提示
   */
  tooltip?: TooltipTriggerOptions | ((id?: ItemId) => TooltipTriggerOptions);
  /**
   * 当点击时的回调
   * @param id
   */
  onItemClick?: (id?: ItemId) => void;
  /**
   * 当前选中的节点
   */
  selectedItem?: ItemId;
}

export const TOOL_ITEM_CLASS = 'boxToolItem';
export const SELECTED_TOOL_ITEM_CLASS = 'boxToolSelected';

export function ToolItem(props: ToolItemOptions) {
  const {
    id,
    icon: optionIcon,
    disabled = false,
    children,
    subSelections,
    tooltip,
    onItemClick,
    selectedItem: optionSelectedItem,
  } = props;

  const { selectedItem, onItemSelect } = useContext(ToolbarMenuContext);
  const sharedTipsDelay = useContext(SharedTipsContext);

  /**
   * 缓存当前选中的次级菜单数据。
   * 该数据在下面的useMemo中可能会被更新。
   */
  const curSubSelectionIdx = useRef(0);
  /**
   * 根据context选中当前数据，更新item自身的数据
   */
  const { selected, icon } = useMemo(() => {
    // 优先根据当前组件入参更新当前选中的选项
    if (optionSelectedItem !== undefined && subSelections) {
      const idx = subSelections.findIndex((sub) => {
        return sub.id === optionSelectedItem;
      });
      if (idx >= 0 && idx < subSelections.length) {
        curSubSelectionIdx.current = idx;
      }

      return {
        selected: false,
        icon: subSelections[curSubSelectionIdx.current].icon,
      };
    }
    let newSelected = false;
    let icon = optionIcon;
    if (!subSelections) {
      newSelected = selectedItem === id;
    } else {
      let idx = subSelections.findIndex((sub) => {
        return sub.id === selectedItem;
      });

      /**
       * 属于当前二级选项，进行更新。
       */
      if (idx >= 0 && idx < subSelections.length) {
        curSubSelectionIdx.current = idx;

        newSelected = true;
      }

      icon = subSelections[curSubSelectionIdx.current].icon;
    }

    return { selected: newSelected, icon };
  }, [optionIcon, subSelections, selectedItem, optionSelectedItem, id]);

  /**
   * 选中时，底层的渐变背景和左侧高亮
   */
  const selection = useMemo(() => {
    if (!selected) {
      return;
    }

    return (
      <div className={styles.selection}>
        <div className={styles.cover} />
        <div className={styles.bar} />
      </div>
    );
  }, [selected]);

  /**
   * 是否展开内容
   */
  const [expanded, setExpanded] = useState(false);

  const { setDisabled } = sharedTipsDelay;

  /**
   * 右侧的小箭头
   */
  const expandIcon = useMemo(() => {
    if (typeof children === 'undefined') {
      return;
    }

    return (
      <ArrowSvg
        className={styles.expandIcon}
        onPointerDown={(evt: React.PointerEvent) => {
          // 停止冒泡，避免触发选中item。
          evt.stopPropagation();

          setExpanded(true);

          // 弹出二级菜单时，禁用tooltip
          setDisabled && setDisabled(true);
        }}
      />
    );
  }, [children, setExpanded, setDisabled]);

  const expansionRef = useRef<HTMLDivElement>(null);

  /**
   * 渲染展开的内容
   */
  const expansion = useMemo(() => {
    if (!children || !expanded) {
      return;
    }

    return (
      <div
        ref={expansionRef}
        tabIndex={-1}
        className={styles.expansion}
        onBlur={() => {
          setExpanded(false);
          setDisabled && setDisabled(false);
        }}
        onClick={(evt) => {
          evt.stopPropagation();

          setExpanded(false);
          setDisabled && setDisabled(false);
        }}
        onPointerDown={(evt) => {
          evt.stopPropagation();
        }}
        onPointerUp={(evt) => {
          evt.stopPropagation();
        }}
      >
        {children}
      </div>
    );
  }, [expanded, children, setDisabled]);

  const className = useMemo(() => {
    /**
     * 未选中时，:hover和:active样式会生效
     */
    const list = [styles.toolItem, TOOL_ITEM_CLASS];

    if (selected) {
      list.push(styles.selected, SELECTED_TOOL_ITEM_CLASS);
    } else if (!disabled) {
      list.push(styles.interactive);
    }

    if (disabled) {
      list.push(styles.disabled);
    }

    if (expanded) {
      list.push(styles.expanded);
    }

    return list.join(' ');
  }, [selected, disabled, expanded]);

  /**
   * 展开后，自动聚焦。这样可以通过onBlur隐藏展开内容。
   */
  useEffect(() => {
    if (!expansionRef.current) {
      return;
    }
    expansionRef.current.focus();
  }, [expanded]);

  const { onStart, onEnd } = useInteraction({
    onLongPress: () => {
      if (!children) {
        return;
      }

      setExpanded(true);
    },
  });

  const onPointerDown = () => {
    if (disabled) {
      return;
    }
    onStart();

    if (subSelections) {
      const curSubSelection = subSelections[curSubSelectionIdx.current];

      onItemSelect({ id: curSubSelection.id });
    } else {
      onItemSelect({ id });
    }
  };

  const onClick = () => {
    if (!onItemClick || disabled || expanded) {
      return;
    }
    if (subSelections) {
      const curSubSelection = subSelections[curSubSelectionIdx.current];
      onItemClick(curSubSelection.id);
    } else {
      onItemClick(id);
    }
  };

  const { setDisplayed } = sharedTipsDelay;

  const onPopupVisibleChange = useCallback(
    (visible: boolean) => {
      if (visible) {
        setDisplayed(true);
      }
    },
    [setDisplayed],
  );

  const iconNode = useMemo(() => {
    if (typeof icon === 'string') {
      return <Icon className={styles.icon} symbolId={icon} />;
    }

    return icon;
  }, [icon]);

  const item = (
    <div
      className={className}
      onPointerDown={onPointerDown}
      onPointerUp={onEnd}
      onClick={onClick}
    >
      {!disabled && selection}
      <div className={styles.body}>
        {iconNode}
        {expandIcon}
        {expansion}
      </div>
    </div>
  );

  if (tooltip) {
    const subSelectionId = subSelections
      ? subSelections[curSubSelectionIdx.current]
      : undefined;

    const options =
      tooltip instanceof Function ? tooltip(subSelectionId?.id) : tooltip;

    return (
      <TooltipTrigger
        {...options}
        delay={sharedTipsDelay.delay}
        disabled={sharedTipsDelay.disabled}
        className={styles.tooltip}
        align={{ offset: [2] }}
        onPopupVisibleChange={onPopupVisibleChange}
      >
        {item}
      </TooltipTrigger>
    );
  } else {
    return item;
  }
}

export interface ToolbarGapOptions extends ComponentOptions {
  height: number;
}

export function ToolbarGap(options: ToolbarGapOptions) {
  const { className: optionClassName, style: optionStyle, height } = options;

  const className = useClassName(
    [styles.gap, optionClassName],
    [optionClassName],
  );

  const style = useMemo(() => {
    return {
      ...optionStyle,
      height: `${height}px`,
    };
  }, [optionStyle, height]);

  return <div className={className} style={style} />;
}
