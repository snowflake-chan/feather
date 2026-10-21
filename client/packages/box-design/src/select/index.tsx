import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from 'react';
import type { ToolbarMenuContextProps } from '../context';
import type { ComponentOptions, ItemId } from '../interfaces';
import { Menu, MenuItemOptions } from '../menu';
import { AlignType, Placement, Trigger } from '../trigger';
import style from './style.module.scss';

type SizeType = 'large' | 'medium' | 'small';

export interface SelectProps extends ComponentOptions {
  /**
   * 下拉框的大小
   * @default medium
   */
  size?: SizeType;
  /**
   * 是否禁用
   * @default false
   */
  onSelect: (data: { id: ItemId }) => void;
  selection?: ItemId;
  disabled?: boolean;
  items: MenuItemOptions[];
  /**
   * 是否混选
   */
  mixed?: boolean;
  /**
   * 选项列表定位
   * @default bottom
   */
  placement?: Placement;
  /**
   * 选项列表对齐调整
   * @default { offset: [0, 8] }
   */
  align?: AlignType;
}

/**
 * 下拉框组件，其中内容展示通过Menu/MenuItem组件展示
 * 结构示意:
 * <root>
 *  <Select>
 *    <Menu>
 *      <MenuItem> Item 1 <MenuItem>
 *      <MenuItem> Item 2 <MenuItem>
 *      ...
 *    </Menu>
 *  </Select>
 * </root>
 * @param props
 * @returns
 */
function SelectView(props: SelectProps): JSX.Element {
  const {
    className: optionClassName,
    size = 'medium',
    onSelect,
    selection,
    disabled = false,
    items,
    mixed,
    placement = 'bottom',
    align = { offset: [0, 8] },
  } = props;

  const [expanded, setExpended] = useState<boolean>(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const className = useMemo<string>(() => {
    const list = [style.select, optionClassName, style[size]];
    expanded && list.push(style.expanded);
    disabled ? list.push(style.disabled) : list.push(style.interactive);
    return list.join(' ');
  }, [optionClassName, size, expanded, disabled]);

  const onItemSelect: ToolbarMenuContextProps['onItemSelect'] = useCallback(
    (options) => {
      const { id: key } = options;
      onSelect({ id: key });
      setExpended(false);
    },
    [onSelect],
  );

  useEffect(() => {
    if (!selectRef.current) {
      return;
    }
    expanded && selectRef.current.focus();
  }, [expanded]);

  const selectedItem = useMemo(
    () => items.find(({ id }) => id === selection),
    [items, selection],
  );

  const text = useMemo(() => {
    if (mixed) {
      return 'Mixed';
    }

    return selectedItem ? selectedItem.text : '';
  }, [selectedItem, mixed]);

  const component = (
    <div ref={selectRef} tabIndex={-1} className={className}>
      <div className={style.content}>
        <p>{text}</p>
        <div className={style.collapse}></div>
      </div>
    </div>
  );

  return (
    <Trigger
      action={['click']}
      showAction={['click']}
      hideAction={['click']}
      placement={placement}
      align={align}
      delay={0}
      onPopupVisibleChange={setExpended}
      popup={
        <Menu
          items={items}
          selectedItem={selection}
          onItemSelect={(id) => onItemSelect({ id })}
        />
      }
    >
      {component}
    </Trigger>
  );
}

export const Select = memo(SelectView);
