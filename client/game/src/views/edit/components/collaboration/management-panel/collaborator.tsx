import { useState, useRef, useCallback, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import { Button, Menu, Toast, Trigger } from '@box/box-design';
import { IconMore } from '@box/icons';

import { debounce } from 'src/utils/debounce-throttle';
import { useEdit } from 'src/client/edit/edit-context';
import { RootState } from 'src/redux/edit';
import { ListItem } from '../list/list-item';
import { ArenaEditorUIContext } from '../../../editor-ui-context';
import type { UserInfoList, UserRolesList, MenuItemType } from '../index';

import style from '../index.module.scss';
import { apis } from 'src/apis/local-api';
import { clientConfig } from 'src/config/client';

type CollaboratorListProps = {
  isAllList: boolean;
  userInfoList: UserInfoList;
  userRolesList: UserRolesList;
  showUserRoleModal: (userId: string) => void;
};

enum OperationIdType {
  changeRole = 'changeRole',
  moveToTop = 'moveToTop',
  moveToBottom = 'moveToBottom',
  banUser = 'banUser',
}
const FEEDBACK = new Image();
const canvas = document.createElement('canvas');
canvas.width = 1;
canvas.height = 1;
FEEDBACK.src = canvas.toDataURL();

export const CollaboratorList = (props: CollaboratorListProps) => {
  const editor = useEdit();
  const intl = useIntl();
  const { replica } = useContext(ArenaEditorUIContext);
  const userId = useSelector((state: RootState) => state.user.id).toString();
  const collaborators = useSelector(
    (state: RootState) => state.permission.collaborators,
  );
  const owner = useSelector((state: RootState) => state.permission.owner);
  const [selectedUserId, setSelectedUserId] = useState('');
  const dragContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingId, setDraggingId] = useState('');
  const [dragTarget, setDragTarget] = useState<
    | {
        id: string;
        highLight: 'top' | 'bottom';
      }
    | undefined
  >(undefined);

  const handleDrag = useCallback(
    (event) => {
      event.persist();
      if (event.target) {
        const dragContainer = dragContainerRef.current;
        const offsetTop = dragContainer?.offsetTop || 0;
        const scrollTop = dragContainer?.scrollTop || 0;
        const scrollHeight = dragContainer?.scrollHeight || 0;
        const clientHeight = dragContainer?.clientHeight || 0;
        const rect = dragContainer!.getBoundingClientRect();
        if (clientHeight + offsetTop + scrollTop === scrollHeight) {
          return;
        }
        if (event.clientY > clientHeight + offsetTop) {
          dragContainer?.scrollTo(dragContainer.scrollLeft, scrollTop + 5);
        } else if (event.clientY < rect.top) {
          dragContainer?.scrollTo(dragContainer.scrollLeft, scrollTop - 5);
        }
      }
    },
    [dragContainerRef],
  );

  const menuList: MenuItemType[] = useMemo(() => {
    let list = [OperationIdType.changeRole, OperationIdType.banUser];

    // 全部列表时是allListOptions
    if (props.isAllList) {
      list = [
        OperationIdType.changeRole,
        OperationIdType.moveToTop,
        OperationIdType.moveToBottom,
        OperationIdType.banUser,
      ];
    }
    return list.map((item) => ({
      id: item,
      text: intl.formatMessage({ id: item }),
    }));
  }, [props.isAllList, intl]);

  const onMenuItemSelected = useCallback(
    async (id: OperationIdType) => {
      const index = collaborators.indexOf(selectedUserId);
      if (!Number(selectedUserId) || index < 0) {
        return;
      }
      switch (id) {
        case OperationIdType.banUser:
          try {
            await apis.collaboration.banUsingPost({
              mapId: clientConfig.mapInfo.contentId + '',
              userId: selectedUserId,
            });
          } catch (err) {
            Toast.error({
              content: intl.formatMessage({ id: 'unknownError' }),
            });
            return;
          }
          editor.permissionController.banUser(
            selectedUserId,
            userId,
            '',
            props.userRolesList[selectedUserId] || [],
          );
          break;
        case OperationIdType.changeRole:
          props.showUserRoleModal(selectedUserId);
          break;
        case OperationIdType.moveToBottom:
          // call createra api
          try {
            await apis.collaboration.memberSortUsingPost({
              mapId: clientConfig.mapInfo.contentId + '',
              userIds: [
                ...collaborators.filter((_) => _ !== selectedUserId),
                selectedUserId,
              ],
            });
          } catch (err) {
            Toast.error({
              content: intl.formatMessage({ id: 'unknownError' }),
            });
            return;
          }

          editor.permissionController.moveCollaboratorToBottom(
            index,
            selectedUserId,
          );
          break;
        case OperationIdType.moveToTop:
          // call createra api
          try {
            await apis.collaboration.memberSortUsingPost({
              mapId: clientConfig.mapInfo.contentId + '',
              userIds: [
                selectedUserId,
                ...collaborators.filter((_) => _ !== selectedUserId),
              ],
            });
          } catch (err) {
            Toast.error({
              content: intl.formatMessage({ id: 'unknownError' }),
            });
            return;
          }

          editor.permissionController.moveCollaboratorToTop(
            index,
            selectedUserId,
          );
          break;
        default:
          break;
      }
      setSelectedUserId('');
    },
    [collaborators, editor, userId, props, selectedUserId, intl],
  );

  return (
    <div className={style.listWrapper}>
      <div
        className={`${style.listContainer} ${style.dragContainer} ${
          isDragging && style.draggingCursor
        }`}
        ref={dragContainerRef}
      >
        {props.userInfoList.map((info) => {
          const canDrag = props.isAllList && owner !== info.userId;
          const isShowOperation = owner !== info.userId;
          const draggableProps = canDrag
            ? {
                draggable: true,
                onDragStart: (event) => {
                  setSelectedUserId('');
                  event.dataTransfer.setDragImage(FEEDBACK, 0, 32);
                  event.dataTransfer.effectAllowed = 'copyMove';
                  setIsDragging(true);
                  setDraggingId(info.userId);
                },
                onDrag: debounce(handleDrag, 500),
                onDragOver: (ev) => {
                  ev.preventDefault();
                  const { top, height, bottom } =
                    ev.currentTarget.getBoundingClientRect();
                  if (ev.clientY < top || ev.clientY > bottom) {
                    return;
                  }
                  // 设置高亮位置 top or bootom
                  if (ev.clientY < top + height / 2) {
                    setDragTarget({ id: info.userId, highLight: 'top' });
                  } else {
                    setDragTarget({ id: info.userId, highLight: 'bottom' });
                  }
                },
                onDragEnd: () => {
                  setIsDragging(false);
                  setDragTarget(undefined);
                  setDraggingId('');
                },
                onDrop: async (event) => {
                  setIsDragging(false);
                  setDragTarget(undefined);
                  setDraggingId('');
                  const dragId = draggingId;
                  const targetId = info.userId;
                  event.preventDefault();
                  event.persist();
                  if (dragId === targetId) {
                    return;
                  }
                  const dragIdx =
                    replica.permissions.collaborators.indexOf(dragId);
                  const targetIdx = replica.permissions.collaborators.indexOf(
                    targetId.toString(),
                  );
                  // call createra api
                  try {
                    const tempCollaborators = [...collaborators];
                    [tempCollaborators[dragIdx], tempCollaborators[targetIdx]] =
                      [
                        tempCollaborators[targetIdx],
                        tempCollaborators[dragIdx],
                      ];
                    await apis.collaboration.memberSortUsingPost({
                      mapId: clientConfig.mapInfo.contentId + '',
                      userIds: tempCollaborators,
                    });
                  } catch (err) {
                    Toast.error({
                      content: intl.formatMessage({ id: 'unknownError' }),
                    });
                    return;
                  }

                  editor.permissionController.moveCollaborator(
                    dragIdx,
                    targetIdx,
                  );
                },
              }
            : {};
          return (
            <ListItem
              key={info.userId}
              {...info}
              customProps={draggableProps}
              canDrag={canDrag}
              highLight={
                dragTarget?.id === info.userId
                  ? dragTarget.highLight
                  : undefined
              }
              className={draggingId === info.userId ? style.disabled : ''}
              operation={
                isShowOperation ? (
                  <Trigger
                    placement={'bottomRight'}
                    align={{ offset: [4, 4] }}
                    popupVisible={selectedUserId === info.userId}
                    onPopupVisibleChange={(visible) => {
                      if (visible && selectedUserId !== info.userId) {
                        setSelectedUserId('');
                      }
                    }}
                    onPopupBlur={() => {
                      setSelectedUserId('');
                    }}
                    popup={
                      <Menu
                        className={style.dropdown}
                        items={menuList}
                        onItemSelect={(id) =>
                          onMenuItemSelected(id as OperationIdType)
                        }
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
          );
        })}
      </div>
    </div>
  );
};
