import React, { useCallback, useState } from 'react';
import { useIntl } from 'react-intl';

import { Trigger } from '@box/box-design/build/trigger';
import { TooltipTrigger } from '@box/box-design';
import { Menu, MenuItemOptions } from '@box/box-design/build/menu';

import { CenterPanelEnum } from 'src/views/edit/defs';

import style from './style.module.scss';
import ArenaLogo from 'src/assets/arena_logo.svg';
export interface DropDownProps {
  items: MenuItemOptions[];
  onSelect: (data: { id: CenterPanelEnum }) => void;
}

export const DropDown = (props: DropDownProps) => {
  const { onSelect, items } = props;
  const intl = useIntl();
  const [expanded, setExpended] = useState<boolean>(false);

  const onItemSelect = useCallback(
    (options) => {
      const { id: key } = options;
      onSelect({ id: key });
      setExpended(false);
    },
    [onSelect],
  );

  const arenaLogoBtn = (
    <div
      className={`${style.logoBtn} ${expanded && style.menuExpanded}`}
      onClick={() => setExpended(!expanded)}
    >
      <TooltipTrigger
        text={intl.formatMessage({ id: 'arenaLogoMenu' })}
        align={{ offset: [0, 4] }}
        placement="bottomRight"
      >
        <div className={style.logo}>
          <ArenaLogo />
          <div className={style.collapse}></div>
        </div>
      </TooltipTrigger>
    </div>
  );

  return (
    <Trigger
      placement={'bottomLeft'}
      align={{ offset: [4, 4] }}
      popupVisible={expanded}
      popup={
        <div>
          <div
            className={style.closeWrapper}
            onClick={(ev) => {
              ev.stopPropagation();
              setExpended(false);
            }}
            onMouseDown={(ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              setExpended(false);
            }}
          />
          <Menu
            className={style.menu}
            items={items}
            onItemSelect={(id) => onItemSelect({ id })}
          />
        </div>
      }
    >
      {arenaLogoBtn}
    </Trigger>
  );
};
