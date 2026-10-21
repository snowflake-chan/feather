import React, {
  useContext,
  ReactNode,
  useMemo,
  createContext,
  useState,
  MouseEventHandler,
} from 'react';
import { Button } from '../button';
import { ComponentOptions } from '../interfaces';
import { useClassName } from '../util';
import styles from './style.module.scss';

interface CollapseOptions extends ComponentOptions {
  /**
   * 自定义切换面板图标
   */
  expandIcon: string | ReactNode;
  /**
   * 切换面板的回调
   */
  onChange?: (id: number[]) => void;
  /**
   * 面板被折叠或展开时的回调
   */
  onArrowClicked?: (id: number, isExpanded: boolean) => void;
  /**
   * 当前激活面板的id
   */
  activeIds?: number[];
  /**
   * 初始化选中面板的id
   */
  defaultActiveIds?: number[];

  /**
   * 是否被禁用
   * 默认为否
   */
  disabled?: boolean;
  children?: ReactNode;
  onMouseLeave?: MouseEventHandler;
}

interface CollapseContextProps {
  expandIcon: string | ReactNode;
  onChange: (id: number[]) => void;
  onArrowClicked: (id: number, isExpanded: boolean) => void;
  activeIds: number[];
}

const CollapseContext = createContext<CollapseContextProps>({
  expandIcon: '',
  onChange: () => {},
  onArrowClicked: () => {},
  activeIds: [],
});

/**
 * 折叠面板
 * 使用示例：
 * <Collapse expandIcon="#icon-list-dropup">
 *   <CollapsePanel id="1" header={'Panel 1'}/>
 *   <CollapsePanel id="2" header={'Panel 2'}/>
 * </Collapse>
 * @param props
 * @returns
 */
export function Collapse(props: CollapseOptions) {
  const {
    className: optionClassName,
    style,
    children,
    expandIcon,
    onChange,
    onArrowClicked,
    activeIds: optionActiveIds,
    defaultActiveIds,
    onMouseLeave,
    disabled,
  } = props;

  const className = useClassName(
    [optionClassName, styles.collapse],
    [optionClassName],
  );

  const [activeIds, setActiveIds] = useState<CollapseContextProps['activeIds']>(
    defaultActiveIds || [],
  );

  const disabledMask = useMemo(() => {
    if (!disabled) {
      return;
    }
    return <div className={styles.disabledMask} />;
  }, [disabled]);

  return (
    <CollapseContext.Provider
      value={{
        expandIcon,
        activeIds: optionActiveIds || activeIds,
        onChange: (id) => {
          setActiveIds(id);
          onChange && onChange(id);
        },
        onArrowClicked: (id, isExpanded) => {
          onArrowClicked && onArrowClicked(id, isExpanded);
        },
      }}
    >
      <div className={className} style={style} onMouseLeave={onMouseLeave}>
        {children}
        {disabledMask}
      </div>
    </CollapseContext.Provider>
  );
}

export interface CollapsePanelOptions extends ComponentOptions {
  /**
   * 当前面板ID
   */
  id: number;
  /**
   * 当前面板表头内容
   */
  header: ReactNode;
  /**
   * 是否显示当前面板上的箭头
   * 默认显示
   */
  showArrow?: boolean;
  /**
   * 是否显示表头与内容的分割线
   * 默认显示
   * 内容折叠时分割线也会被隐藏
   */
  showDivider?: boolean;
  /**
   * 自定义渲染面板右上角的内容
   */
  extra?: ReactNode;
  children?: ReactNode;
}

/**
 * 折叠面板中可以折叠/展开的内容区域
 * 一般用于Collapse组件的子组件
 * 示例：
 * <Collapse expandIcon="#icon-list-dropup">
 *   <CollapsePanel id="1" header={'Panel 1'}/>
 *   <CollapsePanel id="2" header={'Panel 2'}/>
 * </Collapse>
 * @param props
 * @returns
 */
export function CollapsePanel(props: CollapsePanelOptions) {
  const {
    id,
    showArrow,
    showDivider = true,
    header,
    extra,
    children,
    className,
    style,
  } = props;
  const { expandIcon, activeIds, onChange, onArrowClicked } =
    useContext(CollapseContext);

  const isExpanded = activeIds.includes(id);

  const arrow = useMemo(() => {
    return (
      <Button
        className={styles.expand}
        type="icon"
        icon={expandIcon}
        style={{
          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
        }}
        onClick={() => {
          onArrowClicked(id, !isExpanded);
          const newActiveIds = isExpanded
            ? activeIds.filter((activeId) => activeId !== id)
            : [...activeIds, id];
          onChange(newActiveIds);
        }}
      />
    );
  }, [expandIcon, isExpanded, onArrowClicked, id, activeIds, onChange]);

  return (
    <div className={className} style={style}>
      <div className={styles.header}>
        <div className={styles.left}>
          {(typeof showArrow === 'undefined' || showArrow) && arrow}
          {header}
        </div>
        {isExpanded && extra}
      </div>
      {isExpanded && showDivider && <div className={styles.divider} />}
      {isExpanded && children}
    </div>
  );
}
