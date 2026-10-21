import { useMemo, useContext } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import { Button, Menu, Trigger } from '@box/box-design';
import {
  IconSetting,
  IconMore,
  IconNotifications,
  IconDropDown,
} from '@box/icons';
import { RootState } from 'src/redux/edit';

import { MenuItemType, InnerRoles } from '../index';
import { PanelType } from '../management-panel/index';
import { ArenaEditorUIContext } from '../../../editor-ui-context';

import style from '../index.module.scss';

type HeaderProps = {
  title: string;
  isOwner: boolean;
  setSelectedRole: (item: MenuItemType) => void;
  setCurrentPanel?: (item: PanelType) => void;
  showRoleManageModal?: () => void;
};

export const MainHeader = (props: HeaderProps) => {
  const intl = useIntl();
  const { groups } = useSelector((state: RootState) => state.permission);
  const { replica } = useContext(ArenaEditorUIContext);

  // 职位列表
  const roleList = useMemo((): MenuItemType[] => {
    let roles = Object.keys(groups).filter((item) => item !== InnerRoles.guest);
    const inner = [InnerRoles.allCollaborator];
    roles = [...inner, ...roles];
    return roles.map((id) => ({
      id,
      text: InnerRoles[id] ? intl.formatMessage({ id }) : id,
      className: style.dropdownItem,
    }));
  }, [groups, intl]);

  return (
    <div className={style.header}>
      <Trigger
        placement={'bottomRight'}
        align={{ offset: [4, 4] }}
        action={['click']}
        showAction={['click']}
        hideAction={['click']}
        delay={0}
        popup={
          <Menu
            className={style.dropdown}
            items={roleList}
            selectedItem=""
            onItemSelect={(id) => {
              if (typeof id === 'string') {
                props.setSelectedRole({
                  id,
                  text: roleList.find((item) => item.id === id)?.text || '',
                });
              }
            }}
          />
        }
      >
        <div
          className={`${style.title} ${style.dropdownTab}`}
          onMouseDown={(ev) => {
            ev.preventDefault();
          }}
        >
          <div className={style.roleName}>{props.title}</div>
          <IconDropDown className={style.dropdownIcon} />
        </div>
      </Trigger>

      {props.isOwner && (
        <div className={style.operationBar}>
          <Button
            className={`${style.settingBtn} ${style.btn}`}
            type={'icon'}
            size={'custom'}
            icon={<IconSetting className={style.icon} />}
            onClick={() => {
              props.showRoleManageModal && props.showRoleManageModal();
            }}
          >
            {intl.formatMessage({ id: 'role_manage' })}
          </Button>
          <div className={style.buttonWrapper}>
            <Button
              className={`${style.basicBtn} ${style.btn}`}
              type={'icon'}
              size={'custom'}
              icon={<IconNotifications className={style.icon} />}
              onClick={() => {
                props.setCurrentPanel &&
                  props.setCurrentPanel(PanelType.application);
              }}
            />
            {Object.keys(replica.newApplicants).length > 0 && (
              <i className={style.redTips}></i>
            )}
          </div>
          <Trigger
            placement={'bottomRight'}
            align={{ offset: [4, 4] }}
            action={[]}
            showAction={['click']}
            hideAction={['click']}
            delay={0}
            popup={
              <Menu
                className={style.dropdown}
                items={[
                  {
                    id: PanelType.guest,
                    text: intl.formatMessage({ id: 'guest' }),
                  },
                  {
                    id: PanelType.blocked,
                    text: intl.formatMessage({ id: 'banned' }),
                  },
                ]}
                onItemSelect={(id) => {
                  props.setCurrentPanel &&
                    props.setCurrentPanel(id as PanelType);
                }}
              />
            }
          >
            <Button
              className={style.basicBtn}
              type={'icon'}
              size={'custom'}
              icon={<IconMore className={style.icon} />}
              onMouseDown={(ev) => {
                ev.preventDefault();
              }}
            />
          </Trigger>
        </div>
      )}
    </div>
  );
};
