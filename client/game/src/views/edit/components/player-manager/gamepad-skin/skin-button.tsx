import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { IconEdit } from '@box/icons';
import { AlignType, ItemId, Placement, TooltipTrigger } from '@box/box-design';

import { useEdit } from 'src/client/edit/edit-context';
import { getOSSResourceUrl } from 'src/engine/resource/util';
import { SerializedVec2 } from 'src/engine/interfaces';
import { ContextMenu, ContextmenuData } from '../../context-menu';
import {
  GamepadSkinType,
  setCurrEditType,
  setPictureLibraryVisible,
  setResetModalVisible,
} from 'src/redux/edit/gamepad-skin';
import { setSkinByType } from '.';
import { useUploadPicture } from 'src/views/edit/components/picture-library/hooks';

import style from './style.module.scss';
import { GroupAssetEntry } from '@box/schema/build/project/project-rda';
import { ArenaEditorUIContext } from 'src/views/edit/editor-ui-context';

enum ContextMenuId {
  PictureLibrary = 'PICTURE_LIBRARY',
  Upload = 'UPLOAD',
  Reset = 'RESET',
}

export const SkinButton = (props: {
  type: GamepadSkinType;
  skinName: string;
  tooltipText: string;
  tooltipPlacement?: Placement;
  tooltipAlign?: AlignType;
  children: ReactNode;
}) => {
  const {
    type,
    skinName,
    tooltipText,
    tooltipPlacement = 'rightTop',
    tooltipAlign = { offset: [8, 0] },
    children,
  } = props;
  const intl = useIntl();
  const editor = useEdit();
  const dispatch = useDispatch();
  const [skinUrl, setSkinUrl] = useState('');
  const [isHover, setIsHover] = useState(false);
  const [menuPos, setMenuPos] = useState<SerializedVec2 | undefined>();
  const {
    replica: {
      project: { pictureAssets },
    },
  } = useContext(ArenaEditorUIContext);

  const readSkinAssetsFromProject = useCallback(() => {
    const resource: GroupAssetEntry | undefined = pictureAssets[skinName];
    if (resource) {
      setSkinUrl(getOSSResourceUrl(resource.previewImage));
    } else {
      setSkinUrl('');
    }
  }, [pictureAssets, skinName]);

  const onUploadPictureClick = useUploadPicture({
    intl,
    editContentStorage: editor.editContentStorage,
    assetController: editor.assetController,
    dispatch: dispatch,
  });

  useEffect(() => {
    readSkinAssetsFromProject();
  }, [readSkinAssetsFromProject]);

  const onPointerUp = useCallback(
    (evt: React.PointerEvent) => setMenuPos([evt.clientX, evt.clientY]),
    [],
  );

  const menu = useMemo(() => {
    if (!menuPos) {
      return;
    }
    const list: (ContextmenuData | false)[] = [
      // 图库
      {
        id: ContextMenuId.PictureLibrary,
        text: intl.formatMessage({ id: 'pictureLibrary' }),
      },
      // 本地上传
      {
        id: ContextMenuId.Upload,
        text: intl.formatMessage({ id: 'gameUIPropImageUploadByLocal' }),
      },
      // 恢复默认图片
      !!skinUrl && {
        id: ContextMenuId.Reset,
        text: intl.formatMessage({ id: 'resetDefault' }),
      },
    ];
    const data: ContextmenuData[] = list.filter(
      (item): item is ContextmenuData => !!item,
    );
    const onSelect = (id: ItemId) => {
      if (!editor) {
        return;
      }
      dispatch(setCurrEditType(type));
      switch (id) {
        case ContextMenuId.PictureLibrary:
          dispatch(setPictureLibraryVisible(true));
          break;
        case ContextMenuId.Upload:
          {
            onUploadPictureClick({
              onSuccess: (skinName) => {
                setSkinByType(type, skinName);
              },
            });
          }
          break;
        case ContextMenuId.Reset:
          dispatch(setResetModalVisible(true));
          break;
      }

      setMenuPos(undefined);
    };
    return (
      <ContextMenu
        position={menuPos}
        data={data}
        onSelect={onSelect}
        onMouseDownOutside={() => setMenuPos(undefined)}
      />
    );
  }, [menuPos, dispatch, editor, intl, onUploadPictureClick, skinUrl, type]);

  const className = useMemo(() => {
    const list: string[] = [style.skinBtn];

    if (isHover || !!menuPos) {
      list.push(style.skinBtnHover);
    }

    return list.join(' ');
  }, [menuPos, isHover]);

  const finalSkin = useMemo(() => {
    if (isHover || !!menuPos) {
      return <IconEdit />;
    } else {
      if (skinUrl) {
        return (
          <div
            className={style.skinBtn}
            style={{
              backgroundImage: `url(${skinUrl})`,
            }}
          />
        );
      } else {
        return children;
      }
    }
  }, [children, menuPos, isHover, skinUrl]);

  return (
    <>
      <div
        className={className}
        onPointerEnter={() => setIsHover(true)}
        onPointerLeave={() => setIsHover(false)}
        onPointerUp={onPointerUp}
      >
        <TooltipTrigger
          text={tooltipText}
          placement={tooltipPlacement}
          align={tooltipAlign}
        >
          <div className={style.skinTooltip} />
        </TooltipTrigger>
        {finalSkin}
      </div>
      {menu}
    </>
  );
};
