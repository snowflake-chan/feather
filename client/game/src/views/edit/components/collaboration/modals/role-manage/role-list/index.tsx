import { useState, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import { Button, Menu, Trigger, Modal, Toast } from '@box/box-design';
import { IconMore } from '@box/icons';
import { useEdit } from 'src/client/edit/edit-context';
import { RootState } from 'src/redux/edit';
import { InnerRoles } from '../../../index';
import style from './index.module.scss';
import { apis } from 'src/apis/local-api';
import { clientConfig } from 'src/config/client';
import {
  getRoleId,
  refreshNameIDMap,
} from 'src/views/edit/components/collaboration/transform';

type RoleListProps = {
  showEditRolePanel: (isNew: boolean, roleName?: string) => void;
};

export const RoleList = (props: RoleListProps) => {
  const intl = useIntl();
  const editor = useEdit();
  const { groups } = useSelector((state: RootState) => state.permission);
  const [selectedId, setSelectedId] = useState('');

  const onMenuItemSelected = useCallback(
    (menuItemId, id) => {
      if (menuItemId === 'edit') {
        props.showEditRolePanel(false, id);
      } else if (menuItemId === 'delete') {
        const destroy = Modal.show({
          type: 'warning',
          width: 448,
          title: intl.formatMessage({ id: 'removeRole' }),
          content: intl.formatMessage(
            { id: 'removeRoleTips' },
            {
              roleName: InnerRoles[id] ? intl.formatMessage({ id }) : id,
            },
          ),
          confirmText: intl.formatMessage({ id: 'remove' }),
          onConfirm: async () => {
            // call createra api
            try {
              await apis.collaboration.deleteRoleUsingDelete({
                mapId: clientConfig.mapInfo.contentId + '',
                roleId: getRoleId(id),
              });
            } catch (err) {
              Toast.error({
                content: intl.formatMessage({ id: 'unknownError' }),
              });
              return;
            }

            refreshNameIDMap(clientConfig.mapInfo.contentId);
            editor.permissionController.removePermissionSet(id);
            destroy();
          },
          cancelText: intl.formatMessage({ id: 'cancel' }),
          onCancel: () => {
            destroy();
          },
        });
      }
    },
    [editor, props, intl],
  );

  return (
    <div className={style.wrapper}>
      <div className={style.btnWrapper}>
        <Button
          type={'secondary'}
          className={style.btnAdd}
          onClick={() => {
            if (
              Object.keys(groups).filter((groupName) => groupName !== 'guest')
                .length >= 20
            ) {
              Toast.error({
                content: intl.formatMessage({ id: 'roleLimit' }),
              });
              return;
            }
            props.showEditRolePanel(true);
          }}
        >
          + {intl.formatMessage({ id: 'newRole' })}
        </Button>
      </div>
      <div className={style.listWrapper}>
        <div className={style.listContainer}>
          {Object.keys(groups).map((role) => {
            return (
              role !== 'guest' && (
                <div key={role} className={style.listItem}>
                  <span className={style.name}>
                    {InnerRoles[role] ? intl.formatMessage({ id: role }) : role}
                  </span>
                  <Trigger
                    placement={'bottomRight'}
                    align={{ offset: [4, 4] }}
                    popupVisible={selectedId === role}
                    onPopupBlur={() => {
                      setSelectedId('');
                    }}
                    popup={
                      <Menu
                        className={style.dropdown}
                        items={[
                          {
                            id: 'edit',
                            text: intl.formatMessage({ id: 'edit' }),
                          },
                          {
                            id: 'delete',
                            text: intl.formatMessage({ id: 'delete' }),
                          },
                        ]}
                        onItemSelect={(id) => {
                          onMenuItemSelected(id, selectedId);
                          setSelectedId('');
                        }}
                      />
                    }
                  >
                    <Button
                      className={style.basicBtn}
                      type={'icon'}
                      size={'custom'}
                      icon={<IconMore className={style.icon} />}
                      onClick={(ev) => {
                        setSelectedId(role);
                      }}
                    />
                  </Trigger>
                </div>
              )
            );
          })}
        </div>
      </div>
      <p className={style.footer}>{intl.formatMessage({ id: 'guest' })}</p>
    </div>
  );
};
