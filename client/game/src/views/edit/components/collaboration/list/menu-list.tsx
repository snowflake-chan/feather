import { useState } from 'react';
import { Button, Menu, Trigger } from '@box/box-design';
import { IconMore } from '@box/icons';

import style from '../index.module.scss';
import { MenuItemType } from '../index';
import { ListItem, ListItemProps } from './list-item';

type MenuListProps = {
  items: (ListItemProps & { isHideOperation?: boolean })[];
  menuList: MenuItemType[];
  onMenuItemSelected: (id: string, selectedUserId: string) => void;
};

export const MenuList = (props: MenuListProps) => {
  const [selectedUserId, setSelectedUserId] = useState('');

  return (
    <div className={style.listWrapper}>
      <div className={style.listContainer}>
        {props.items.map((info) => (
          <ListItem
            key={info.userId}
            {...info}
            operation={
              !info.isHideOperation ? (
                <Trigger
                  placement={'bottomRight'}
                  align={{ offset: [4, 4] }}
                  popupVisible={selectedUserId === info.userId}
                  onPopupBlur={() => {
                    setSelectedUserId('');
                  }}
                  popup={
                    <Menu
                      className={style.dropdown}
                      items={props.menuList}
                      onItemSelect={(id) => {
                        if (typeof id !== 'string') {
                          return;
                        }
                        props.onMenuItemSelected(id, info.userId);
                        setSelectedUserId('');
                      }}
                    />
                  }
                >
                  <Button
                    className={style.basicBtn}
                    type={'icon'}
                    size={'custom'}
                    icon={<IconMore className={style.icon} />}
                    onClick={() => {
                      setSelectedUserId(info.userId);
                    }}
                  />
                </Trigger>
              ) : (
                <></>
              )
            }
          />
        ))}
      </div>
    </div>
  );
};
