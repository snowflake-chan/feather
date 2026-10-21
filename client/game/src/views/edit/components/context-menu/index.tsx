import React, { useRef, useEffect, ReactNode, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ItemId, SerializedVec2 } from '@box/box-design/build/interfaces';
import { Menu } from '@box/box-design/build';
import { MenuItemOptions } from '@box/box-design/build/menu';

export type ContextmenuData = MenuItemOptions;

export type OnContextMenuSelect = (id: string) => void;

export interface ContextMenuOptions {
  data: ContextmenuData[];
  position?: SerializedVec2;
  onSelect: (id: ItemId, e: React.MouseEvent) => void;
  onMouseDownOutside: () => void;
  /**
   * 排列在menu组件下方。
   */
  extra?: ReactNode;
  /**
   * 指定右键菜单的类名
   */
  className?: string;
}

export function ContextMenu(params: ContextMenuOptions) {
  const { data, position, onSelect, onMouseDownOutside, extra, className } =
    params;

  const contextMenuRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const onDocumentMouseDown = useCallback(
    (e: MouseEvent) => {
      if (
        !(e.target instanceof Node) ||
        !contextMenuRef.current?.contains(e.target)
      ) {
        onMouseDownOutside();
      }
    },
    [onMouseDownOutside],
  );

  useEffect(() => {
    document.addEventListener('mousedown', onDocumentMouseDown);
    return () => document.removeEventListener('mousedown', onDocumentMouseDown);
  }, [onDocumentMouseDown]);

  useEffect(() => {
    const element = contextMenuRef.current;
    if (!element || !position) {
      return;
    }

    const { width, height } = element.getBoundingClientRect();
    const left =
      position[0] + width > window.innerWidth
        ? window.innerWidth - width
        : position[0];
    const top =
      position[1] + height > window.innerHeight
        ? window.innerHeight - height
        : position[1];
    Object.assign(element.style, {
      position: 'fixed',
      pointerEvents: 'initial',
      left: `${left}px`,
      top: `${top}px`,
    });
  }, [onMouseDownOutside, position]);

  const menu = (
    <Menu ref={menuRef} selectedItem="" items={data} onItemSelect={onSelect} />
  );

  return createPortal(
    <div
      ref={contextMenuRef}
      className={className}
      style={{ position: 'fixed', zIndex: 11, outline: 'none' }}
    >
      {menu}
      {extra}
    </div>,
    document.body,
  );
}
