import React, {
  useContext,
  useMemo,
  createContext,
  useState,
  forwardRef,
  Ref,
  ReactNode,
  useRef,
  MouseEvent,
  useCallback,
  MouseEventHandler,
} from 'react';
import type { ComponentOptions, ItemId } from '../interfaces';
import { Icon } from '../icon';
import { useClassName } from '../util';
import styles from './style.module.scss';
import { Trigger } from '../trigger';
import ArrowSvg from '../toolbar/tool-expand-nor.svg';

interface MenuContextType {
  selectedItem?: ItemId;
  onItemSelect: (id: ItemId, e: MouseEvent) => void;
}

export interface MenuOptions extends ComponentOptions, MenuContextType {
  items: MenuItemOptions[];
}

const MenuContext = createContext<MenuContextType>({
  selectedItem: undefined,
  onItemSelect: () => {},
});

const MENU_CLASS = 'boxMenu';

const MENU_ITEM_CLASS = 'boxMenuItem';

function MenuView(props: MenuOptions, ref: Ref<HTMLDivElement>) {
  const {
    className: optionClassName,
    style,
    items: itemOptions,
    selectedItem: optionSelectedItem,
    onItemSelect: optionOnItemSelect,
  } = props;

  const [innerSelected, setInnerSelected] = useState<ItemId>();

  const contextValue = useMemo(() => {
    const selectedItem =
      optionSelectedItem !== undefined ? optionSelectedItem : innerSelected;

    const onItemSelect = (id: ItemId, e: MouseEvent) => {
      setInnerSelected(id);
      optionOnItemSelect(id, e);
    };

    return { selectedItem, onItemSelect };
  }, [optionSelectedItem, innerSelected, setInnerSelected, optionOnItemSelect]);

  const className = useClassName(
    [styles.menu, optionClassName, MENU_CLASS],
    [optionClassName],
  );

  const children = useMemo(
    () =>
      itemOptions.map((itemOption) => (
        <MenuItem key={itemOption.id} {...itemOption} />
      )),
    [itemOptions],
  );

  return (
    <MenuContext.Provider value={contextValue}>
      <div className={className} style={style} ref={ref}>
        {children}
      </div>
    </MenuContext.Provider>
  );
}

export const Menu = forwardRef(MenuView);

export interface MenuItemOptions {
  id: ItemId;
  text: string;
  icon?: string | ReactNode;
  className?: string;
  items?: MenuItemOptions[];
  disabled?: boolean;
}

export function MenuItem(props: MenuItemOptions) {
  const { id, icon, text, className: optionClassName, disabled, items } = props;

  const { selectedItem, onItemSelect } = useContext(MenuContext);

  const selected = selectedItem === id;

  const itemClassName = useMemo(() => {
    const list = [styles.menuItem, optionClassName, MENU_ITEM_CLASS];

    if (disabled) {
      list.push(styles.disabled);
    }

    return list.join(' ');
  }, [optionClassName, disabled]);

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

  const finalIcon = useMemo(
    () =>
      typeof icon === 'string' ? (
        <Icon className={styles.icon} symbolId={icon} />
      ) : icon instanceof Object ? (
        <div className={styles.icon}>{icon}</div>
      ) : null,
    [icon],
  );

  const ref = useRef<HTMLDivElement>(null);

  const itemLength = items?.length || 0;

  const triggerNode = useMemo(() => {
    const content = (
      <div className={itemClassName}>
        {selection}
        {finalIcon}
        <p>{text}</p>
        {itemLength > 0 && <ArrowSvg className={styles.expandArrow} />}
      </div>
    );

    if (!items || items.length === 0) {
      return content;
    }

    return (
      <Trigger
        popup={
          <Menu
            items={items || []}
            onItemSelect={onItemSelect}
            selectedItem={''}
          />
        }
        showAction={['click', 'hover']}
        hideAction={['hover']}
        placement="rightTop"
        getPortalContainer={() => ref.current || undefined}
        align={{ offset: [8, -4] }}
        delay={0}
      >
        {content}
      </Trigger>
    );
  }, [
    itemClassName,
    selection,
    finalIcon,
    text,
    itemLength,
    items,
    onItemSelect,
  ]);

  const onClick = useCallback<MouseEventHandler>(
    (e) => {
      e.preventDefault();

      if (disabled) {
        return;
      }

      onItemSelect(id, e);
    },
    [onItemSelect, disabled, id],
  );

  return (
    <div ref={ref} style={{ position: 'relative' }} onClick={onClick}>
      {triggerNode}
    </div>
  );
}
