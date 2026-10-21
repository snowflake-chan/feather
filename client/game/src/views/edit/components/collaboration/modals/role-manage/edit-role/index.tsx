import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { Input, Switch } from '@box/box-design';
import { PermissionSet } from '@box/schema/permissions/permission-rda';
import { InputPauseConsumer } from 'src/views/components/input-lock';
import { InnerRoles } from '../../../index';

import style from './index.module.scss';
import { clientConfig } from 'src/config/client';
import { Permissions } from '@box/utils/createra-permissions';
import { RootState } from 'src/redux/edit';
import { useSelector } from 'react-redux';

type EditRolePanelProps = {
  permissions: PermissionSet;
  setPermissions: (permissions: PermissionSet) => void;
  roleName: string;
  setRoleName: (name: string) => void;
};

export const EditRolePanel = (props: EditRolePanelProps) => {
  const intl = useIntl();

  const { roleName, permissions, setPermissions, setRoleName } = props;
  const [isInputPause, setIsInputPause] = useState(false);
  const { mapPaidAccess } = useSelector((state: RootState) => state.permission);

  const { combType } = clientConfig.mapInfo;

  const itemListTop = useMemo((): (keyof typeof Permissions)[] => {
    return [
      'editVoxels',
      'editModel',
      'editScene',
      'editScripts',
      'editPlayer',
      'debugger',
      'playButton',
      'editFile',
    ];
  }, []);
  const itemListBottom = useMemo((): (keyof typeof Permissions)[] => {
    return combType !== 2
      ? [
          clientConfig.PAID_ACCESS && mapPaidAccess ? 'editMarket' : '',
          'editStatisticsData',
          'editPublish',
        ].filter(Boolean)
      : [];
  }, [combType, mapPaidAccess]);

  return (
    <div className={style.wrapper}>
      {isInputPause && <InputPauseConsumer />}

      <div className={style.title}>
        {intl.formatMessage({ id: 'roleName' })}
      </div>
      <Input
        className={style.input}
        type={'primary'}
        valueType={'string'}
        size={'middle'}
        value={
          InnerRoles[roleName] ? intl.formatMessage({ id: roleName }) : roleName
        }
        onFocus={(ev) => {
          ev.stopPropagation();
          setIsInputPause(true);
        }}
        placeholder={intl.formatMessage({ id: 'newRole' })}
        onChange={(value) => setRoleName(value)}
        onBlur={(ev) => {
          setIsInputPause(false);
        }}
      />
      <div className={style.title}>
        {intl.formatMessage({ id: 'permission' })}
      </div>
      <div className={style.listContainer}>
        {itemListTop.map((item) => {
          return (
            <div className={style.listItem} key={item}>
              <span>{intl.formatMessage({ id: item })}</span>
              <Switch
                checked={permissions[item]}
                onChange={(opts) => {
                  setPermissions({
                    ...props.permissions,
                    [item]: opts,
                  });
                }}
              />
            </div>
          );
        })}
        <i className={style.divider}></i>
        {itemListBottom.map((item) => {
          return (
            <div className={style.listItem} key={item}>
              <span>{intl.formatMessage({ id: item })}</span>
              <Switch
                checked={permissions[item]}
                onChange={(opts) => {
                  setPermissions({
                    ...props.permissions,
                    [item]: opts,
                  });
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
