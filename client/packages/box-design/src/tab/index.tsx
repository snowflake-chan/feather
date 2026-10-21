import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Button } from '../button';
import type { ComponentOptions } from '../interfaces';
import { TooltipTrigger, TooltipTriggerOptions } from '../tooltip';
import { useClassName } from '../util';
import styles from './style.module.scss';

export interface TabsOptions extends ComponentOptions {
  /**
   * 默认激活的tab ID.
   */
  defaultActiveId: string | number;
  /**
   * 当前激活的tab ID.
   */
  activeId?: string | number;
  /**
   * active tab改变时执行的回调。
   */
  onChange?: (id: string | number) => void;
  /**
   * tab被点击时执行的回调
   */
  onTabClick?: (id: string | number) => void;
  children?: ReactNode;
}

interface TabsContextProps {
  activeId: string | number;
  onChange: (id: string | number) => void;
  onTabClick: (id: string | number) => void;
}

const TabsContext = createContext<TabsContextProps>({
  activeId: '',
  onChange: () => {},
  onTabClick: () => {},
});

/**
 * Tabs标签页
 * 只有tab nav的简易版本
 */
export function Tabs(options: TabsOptions) {
  const {
    defaultActiveId,
    activeId: optionActiveId,
    onChange,
    onTabClick,
    children,
    className: optionClassName,
    style,
  } = options;
  const className = useClassName(
    [styles.tabNav, optionClassName],
    [optionClassName],
  );
  const [activeId, setActiveId] = useState<TabsContextProps['activeId']>(
    optionActiveId !== undefined ? optionActiveId : defaultActiveId,
  );

  const currActiveId = useMemo(() => {
    return optionActiveId !== undefined ? optionActiveId : activeId;
  }, [optionActiveId, activeId]);

  const onActiveIdChange = useCallback(
    (id) => {
      setActiveId(id);
      onChange && onChange(id);
    },
    [onChange],
  );

  return (
    <TabsContext.Provider
      value={{
        activeId: currActiveId,
        onChange: onActiveIdChange,
        onTabClick: (id) => {
          onTabClick && onTabClick(id);
        },
      }}
    >
      <div className={className} style={style}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

type TabType = 'text' | 'icon';

export interface TabPanelOptions extends ComponentOptions {
  /**
   * tab的ID.
   */
  id: string | number;
  /**
   * tab的类型。
   */
  type: TabType;
  /**
   * icon配置
   */
  icon?: ReactNode;
  /**
   * tab的文本内容.
   * @deprecated 使用 children 代替
   */
  tab?: ReactNode;
  /**
   * tab是否禁用
   */
  disabled?: boolean;
  /**
   * tooltip相关配置
   */
  tooltipTrigger?: TooltipTriggerOptions;
  /**
   *  Tab 按钮的内容
   */
  children?: ReactNode;
}

/**
 * 单个Tab标签
 */
export function TabPanel(options: TabPanelOptions) {
  const {
    id,
    type,
    icon,
    tab,
    className: optionClassName,
    style,
    disabled,
    tooltipTrigger,
  } = options;
  const { activeId, onChange, onTabClick } = useContext(TabsContext);
  const isActive = id === activeId;

  const className = useMemo(() => {
    const list = [styles.tabPanel];

    type === 'text' && list.push(styles.tabText);
    type === 'icon' && list.push(styles.tabIcon);
    optionClassName && list.push(optionClassName);
    isActive && list.push(styles.activated);
    disabled && list.push(styles.disabled);

    return list.join(' ');
  }, [type, optionClassName, isActive, disabled]);

  const onClick = () => {
    if (disabled) {
      return;
    }
    onTabClick(id);
    if (id !== activeId) {
      onChange(id);
    }
  };

  const tabPanel =
    type === 'icon' ? (
      <Button
        className={className}
        style={style}
        type={type}
        icon={icon}
        onClick={onClick}
        disabled={disabled}
        size="small"
      >
        {tab}
        {options.children}
      </Button>
    ) : (
      <div className={className} style={style} onClick={onClick}>
        {tab}
        {options.children}
        {isActive && !disabled && <div className={styles.selector} />}
      </div>
    );

  return tooltipTrigger ? (
    <TooltipTrigger {...tooltipTrigger}>{tabPanel}</TooltipTrigger>
  ) : (
    tabPanel
  );
}
