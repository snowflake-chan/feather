import * as React from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { PermissionAccessLevel } from '@box/schema/permissions/permission-rda';

import { RootState } from 'src/redux/edit';
import { RadioBtn } from 'src/views/components/basic/radioBtn';
import { editor } from 'src/client/edit/edit-client';
import style from './index.module.scss';
import { apis } from 'src/apis/local-api';
import { clientConfig } from 'src/config/client';

export const PrivacySetting = () => {
  const intl = useIntl();
  const accessLevelPermission = useSelector(
    (state: RootState) => state.permission.accessLevel,
  );

  const handleSetPrivacy = async (accessLevel: PermissionAccessLevel) => {
    await apis.collaboration.updateMapPrivacyUsingPut({
      mapId: clientConfig.mapInfo.contentId + '',
      type: accessLevel,
    });
    editor.permissionController.setAccessLevel(accessLevel);
  };
  const _renderPrivacyOption = (accessLevel: PermissionAccessLevel) => {
    return (
      <>
        <div className={style.selection}>
          <div className={style.radio}>
            <RadioBtn
              checked={accessLevelPermission === accessLevel}
              onChange={() => {
                if (accessLevelPermission === accessLevel) {
                }
                handleSetPrivacy(accessLevel);
              }}
            />
          </div>
          <div className={style.radioName}>
            {intl.formatMessage({
              id: `visibility_${PermissionAccessLevel[accessLevel]}`,
            })}
          </div>
        </div>
        <div className={style.tip}>
          {intl.formatMessage({
            id: `visibility_${PermissionAccessLevel[accessLevel]}_tip`,
          })}
        </div>
      </>
    );
  };

  return (
    <div className={style.container}>
      {_renderPrivacyOption(PermissionAccessLevel.REGISTERED_ONLY)}
      {_renderPrivacyOption(PermissionAccessLevel.INVITED_ONLY)}
      {_renderPrivacyOption(PermissionAccessLevel.PRIVATE)}
      {editor.state.isAdmin &&
        _renderPrivacyOption(PermissionAccessLevel.SCRIPT_VIEW_ONLY)}
    </div>
  );
};
