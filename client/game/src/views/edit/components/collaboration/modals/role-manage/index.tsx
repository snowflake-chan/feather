import { useCallback, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Toast } from '@box/box-design';
import {
  PermissionSet,
  PermissionSetSchema,
} from '@box/schema/permissions/permission-rda';

import { RootState } from 'src/redux/edit';
import { useEdit } from 'src/client/edit/edit-context';

import { StackModalView, StackModal } from '../../../stack-modal';
import { RoleList } from './role-list';
import { EditRolePanel } from './edit-role';
import { InnerRoles } from '../../index';
import { apis } from 'src/apis/local-api';
import { clientConfig } from 'src/config/client';
import {
  getRoleId,
  refreshNameIDMap,
} from 'src/views/edit/components/collaboration/transform';
import { mapPermissionToCreatera } from '@box/utils/createra-permissions';

type RoleManageProps = {
  close: () => void;
};

export const RoleManage = (props: RoleManageProps) => {
  const intl = useIntl();
  const editor = useEdit();
  const groups = useSelector((state: RootState) => state.permission.groups);
  const defaultPermissions = useMemo(
    () => PermissionSetSchema.toJSON(PermissionSetSchema.alloc()),
    [],
  );
  const [isNewRole, setIsNewRole] = useState(false);
  const [selectedRoleName, setSelectedRoleName] = useState('');
  const [editingRoleName, setEditingRoleName] = useState('');

  const [editingPermissions, setEditingPermissions] =
    useState<PermissionSet>(defaultPermissions);

  const clearRoleInfo = useCallback(() => {
    setSelectedRoleName('');
    setEditingRoleName('');
    setEditingPermissions(defaultPermissions);
  }, [defaultPermissions]);

  const modelStack = useMemo(() => {
    return [
      {
        title: intl.formatMessage({ id: 'role' }),
        onClose: () => props.close(),
        width: 400,
        content: (
          <RoleList
            showEditRolePanel={(isNew, roleName) => {
              if (isNew) {
                setIsNewRole(true);
                clearRoleInfo();
              } else if (roleName) {
                setIsNewRole(false);
                setSelectedRoleName(roleName);
                setEditingRoleName(roleName);
                const permissions =
                  (groups[roleName] && groups[roleName].permissions) ||
                  defaultPermissions;
                setEditingPermissions(permissions);
              }
              StackModal.stackFns.handleNext();
            }}
          />
        ),
      },
      {
        title: isNewRole
          ? intl.formatMessage({ id: 'newRole' })
          : intl.formatMessage({ id: 'editRole' }),
        width: 400,
        confirmText: intl.formatMessage({ id: 'done' }),
        onConfirm: async () => {
          // 更新权限或者新增权限
          const name = editingRoleName || intl.formatMessage({ id: 'newRole' });
          if (
            Object.keys(groups).indexOf(name) > -1 &&
            selectedRoleName !== name
          ) {
            Toast.error({
              content: intl.formatMessage({ id: 'roleExisted' }),
            });
            return;
          }
          const { editProject, editModel, editScene, editFile } =
            editingPermissions;
          const newPermission = PermissionSetSchema.clone(editingPermissions);
          newPermission.editProject =
            editProject || editModel || editScene || editFile;
          if (!isNewRole) {
            // call createra api
            try {
              await apis.collaboration.updateRoleUsingPut({
                id: getRoleId(selectedRoleName),
                mapId: clientConfig.mapInfo.contentId + '',
                name,
                permissions: mapPermissionToCreatera(editingPermissions),
              });
            } catch (err) {
              Toast.error({
                content: intl.formatMessage({ id: 'unknownError' }),
              });
              return;
            }
            //
            editor.permissionController.setPermission(
              selectedRoleName,
              newPermission,
              name,
            );
          } else {
            // call createra api
            try {
              await apis.collaboration.addRoleUsingPost({
                mapId: clientConfig.mapInfo.contentId + '',
                name,
                permissions: mapPermissionToCreatera(editingPermissions),
              });
            } catch (err) {
              Toast.error({
                content: intl.formatMessage({ id: 'unknownError' }),
              });
              return;
            }

            editor.permissionController.addPermissionSet(
              newPermission,
              InnerRoles[name] ? InnerRoles[name] : name,
            );
          }
          refreshNameIDMap(clientConfig.mapInfo.contentId);
          clearRoleInfo();
          StackModal.stackFns.handleBack();
        },
        cancelText: intl.formatMessage({ id: 'cancel' }),
        onCancel: () => {
          clearRoleInfo();
          StackModal.stackFns.handleBack();
        },
        content: (
          <EditRolePanel
            permissions={editingPermissions}
            setPermissions={setEditingPermissions}
            roleName={editingRoleName}
            setRoleName={(name) => {
              setEditingRoleName(name);
            }}
          />
        ),
      },
    ];
  }, [
    intl,
    editingPermissions,
    props,
    isNewRole,
    selectedRoleName,
    defaultPermissions,
    editor.permissionController,
    groups,
    clearRoleInfo,
    editingRoleName,
  ]);

  return <StackModalView modalStack={modelStack} />;
};
