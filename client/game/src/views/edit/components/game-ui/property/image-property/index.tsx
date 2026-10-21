import React, {
  ReactNode,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useIntl } from 'react-intl';
import { InputPauseFlags } from '@box/schema/input/input-schema';
import { isUIImageNode } from '@box/schema/project/ui-rda/util';
import { ImageDisplayMode } from '@box/schema/project/ui-rda/defs';
import {
  Input,
  ItemId,
  Menu,
  Modal,
  SelectProps,
  Toast,
} from '@box/box-design';
import type { MenuItemOptions } from '@box/box-design/build/menu';
import { IconAdd2, IconFolder, IconPublish, IconDelete } from '@box/icons';
import { InputPause, useInputPause } from 'src/views/components/input-lock';
import { useEdit } from 'src/client/edit/edit-context';
import { getOSSResourceUrl } from 'src/engine/resource/util';
import { ArenaEditorUIContext } from 'src/views/edit/editor-ui-context';
import { UITreeContext } from '../../hooks';
import styles from './style.module.scss';
import IconEdit from './icon-edit.svg';
import { GroupAssetEntry } from '@box/schema/project/project-rda';
import { InlineSelectInput } from '../inputs/select-input';
import { isDisplayMode, mergeBasicType, MergedConfig } from '../util';

type Props = {
  ids: string[];
  showPictureLibrary: (ids: string[]) => void;
  onUploadClick: (spec: {
    onConfirm?: () => void;
    onSuccess?: (imageName: string) => void;
  }) => void;
};

type ImageGroup = {
  groupId: string;
  ids: string[];
  image: string;
  opacity: number;
};
type ImageGroups = Record<string, ImageGroup>;

export const ImageProperty = memo((props: Props) => {
  const { ids, showPictureLibrary, onUploadClick } = props;

  const editor = useEdit();
  const uiTreeRef = useContext(UITreeContext);

  const { inputPauseChange } = useInputPause();

  const [isFocused, setIsFocused] = useState(false);

  const imageGroups = useRef<ImageGroups>({});

  const { replica } = useContext(ArenaEditorUIContext);

  const [selectedImageId, setSelectedImageId] = useState<string | undefined>();

  const intl = useIntl();

  const onMenuItemSelect = useCallback(
    (itemId: ItemId, groupId: string) => {
      const group = imageGroups.current[groupId];

      switch (itemId) {
        case MenuItemIds.PictureLibrary:
          showPictureLibrary(group.ids);
          break;
        case MenuItemIds.Upload:
          {
            onUploadClick({
              onSuccess: (imageName) => {
                editor.gameUIEditor.uiTreeController.setElementsImage(
                  group.ids,
                  imageName,
                );
              },
            });
          }
          break;
        case MenuItemIds.Remove:
          {
            const path = group.image.split('/');
            const destroy = Modal.show({
              type: 'warning',
              title: intl.formatMessage({
                id: 'removePicture',
              }),
              content: intl.formatMessage(
                {
                  id: 'removePictureContent',
                },
                {
                  fileName: path[path.length - 1],
                },
              ),
              confirmText: intl.formatMessage({
                id: 'gameUIPropImageRemoveConfirm',
              }),
              cancelText: intl.formatMessage({
                id: 'gameUIPropImageRemoveCancel',
              }),
              onConfirm: () => {
                editor.gameUIEditor.uiTreeController.setElementsImage(
                  group.ids,
                  '',
                );
                Toast.success({
                  content: intl.formatMessage({
                    id: 'removePictureSuccess',
                  }),
                });
                destroy();
              },
              onCancel: () => {
                destroy();
              },
            });
          }
          break;
      }
    },
    [showPictureLibrary, intl, editor, onUploadClick],
  );

  const imageItems = useMemo(() => {
    const imageItems: ReactNode[] = [];

    const { uiTree } = uiTreeRef;

    imageGroups.current = {};

    ids.forEach((id) => {
      const node = uiTree[id];

      if (!node || !node.value || !isUIImageNode(node.value)) {
        return;
      }

      const { image, imageOpacity } = node.value.data.data;

      const groupId = `${image}-${imageOpacity}`;

      const resource: GroupAssetEntry | undefined =
        editor.state.replica.project.pictureAssets[image];

      if (!imageGroups.current[groupId]) {
        imageGroups.current[groupId] = {
          groupId,
          ids: [node.id],
          image,
          opacity: imageOpacity,
        };

        imageItems.push(
          <ImageItem
            key={groupId}
            groupId={groupId}
            ids={imageGroups.current[groupId].ids}
            opacity={imageOpacity}
            image={image}
            preview={resource?.previewImage}
            onOpacityChange={(ids, v) => {
              editor.gameUIEditor.uiTreeController.setElementsOpacity(ids, v);
            }}
            selected={selectedImageId === groupId}
            setSelectedId={setSelectedImageId}
            onMenuItemSelect={onMenuItemSelect}
          />,
        );
      } else {
        imageGroups.current[groupId].ids.push(node.id);
      }
    });

    return imageItems;
    // 依赖replica，但实际从editor取
  }, [ids, uiTreeRef, replica, selectedImageId, onMenuItemSelect, editor]);

  const displayMode = useMemo(() => {
    let displayMode: MergedConfig<ImageDisplayMode> | undefined;
    ids.forEach((id) => {
      const node = uiTreeRef.uiTree[id];
      if (
        !node ||
        !node.value ||
        !node.value.data ||
        !isUIImageNode(node.value)
      ) {
        return;
      }
      displayMode = mergeBasicType({
        out: displayMode,
        b: node.value.data.data.imageDisplayMode,
      });
      return;
    });
    return displayMode;
  }, [ids, uiTreeRef]);

  const displayModeItems: MenuItemOptions[] = useMemo(() => {
    return [
      {
        id: ImageDisplayMode.Fill,
        text: intl.formatMessage({ id: 'gameUIImageDisplayFill' }),
      },
      {
        id: ImageDisplayMode.Contain,
        text: intl.formatMessage({ id: 'gameUIImageDisplayContain' }),
      },
      {
        id: ImageDisplayMode.Cover,
        text: intl.formatMessage({ id: 'gameUIImageDisplayCover' }),
      },
      {
        id: ImageDisplayMode.None,
        text: intl.formatMessage({ id: 'gameUIImageDisplayNone' }),
      },
    ];
  }, [intl]);

  const onDisplayModeChange = useCallback<SelectProps['onSelect']>(
    ({ id }: { id: ItemId }) => {
      if (isDisplayMode(id)) {
        editor.gameUIEditor.uiTreeController.setElementsDisplayMode(ids, id);
      }
    },
    [editor.gameUIEditor.uiTreeController, ids],
  );

  const displayModeSelector = useMemo(() => {
    if (!displayMode) {
      return;
    }
    return (
      <InlineSelectInput
        className={styles.selectInput}
        name={intl.formatMessage({
          id: 'gameUIDisplayMode',
        })}
        items={displayModeItems}
        selection={displayMode.value}
        mixed={displayMode.mixed}
        onSelect={onDisplayModeChange}
      />
    );
  }, [displayModeItems, displayMode, intl, onDisplayModeChange]);

  return (
    <div
      className={styles.imageProperty}
      onFocus={() => {
        !isFocused && setIsFocused(true);
      }}
      onBlur={() => {
        isFocused && setIsFocused(false);
      }}
    >
      {isFocused && (
        <InputPause flags={InputPauseFlags.ALL} change={inputPauseChange} />
      )}
      {imageItems}
      {displayModeSelector}
    </div>
  );
});

enum MenuItemIds {
  PictureLibrary = 'PICTURE_LIBRARY',
  Upload = 'UPLOAD',
  Remove = 'REMOVE',
}

const ImageItem = memo(
  (props: {
    groupId: string;
    ids: string[];
    image?: string;
    preview?: string;
    opacity: number;
    selected: boolean;
    onOpacityChange: (ids: string[], value: number) => void;
    setSelectedId: (id: string | undefined) => void;
    onMenuItemSelect: (id: ItemId, groupId: string) => void;
  }) => {
    const {
      ids,
      groupId,
      image,
      preview,
      opacity,
      selected,
      onOpacityChange: propsOnOpacityChange,
      setSelectedId,
      onMenuItemSelect,
    } = props;

    const intl = useIntl();

    const [isFocused, setIsFocused] = useState(false);

    const [imgWH, setImgWH] = useState<string>();

    const editingIds = useRef<string[]>([]);

    const onOpacityChange = useCallback(
      (v: number) => {
        propsOnOpacityChange(editingIds.current, v);
      },
      [propsOnOpacityChange],
    );

    const menuItems: MenuItemOptions[] = useMemo(() => {
      const list: MenuItemOptions[] = [
        {
          id: MenuItemIds.PictureLibrary,
          text: intl.formatMessage({ id: 'pictureLibrary' }),
          icon: <IconFolder />,
        },
        {
          id: MenuItemIds.Upload,
          text: intl.formatMessage({ id: 'gameUIPropImageUploadByLocal' }),
          icon: <IconPublish />,
        },
      ];

      if (image) {
        list.push({
          id: MenuItemIds.Remove,
          text: intl.formatMessage({ id: 'gameUIPropImageRemove' }),
          icon: <IconDelete />,
        });
      }

      return list;
    }, [image, intl]);

    const selectedRef = useRef(false);
    selectedRef.current = selected;

    const size = useMemo(() => {
      if (!imgWH) {
        return;
      }
      return <div className={styles.imgWidthHeight}>{imgWH}</div>;
    }, [imgWH]);

    const img = useMemo(() => {
      if (!preview) {
        return;
      }
      return (
        <img
          src={getOSSResourceUrl(preview)}
          onLoad={(e) =>
            setImgWH(
              `${e.currentTarget.naturalWidth} × ${e.currentTarget.naturalHeight}`,
            )
          }
        />
      );
    }, [preview]);

    const previewRef = useRef<HTMLDivElement>(null);
    const previewContent = useMemo(() => {
      if (!preview) {
        return <IconAdd2 className={styles.iconAdd} />;
      }
      return (
        <>
          {img}
          {size}
          <div className={styles.editMask}>
            <IconEdit className={styles.iconEdit} />
          </div>
        </>
      );
    }, [img, preview, size]);

    useEffect(() => {
      const onMouseDown = (e: MouseEvent) => {
        if (
          selectedRef.current &&
          (!(e.target instanceof Node) ||
            !previewRef.current?.contains(e.target))
        ) {
          setSelectedId(undefined);
        }
      };

      document.addEventListener('mousedown', onMouseDown);

      return () => {
        document.removeEventListener('mousedown', onMouseDown);
      };
    }, [setSelectedId]);

    const itemClassName = useMemo(() => {
      const list: string[] = [styles.item];

      if (selected) {
        list.push(styles.selected);
      }

      if (!image) {
        list.push(styles.empty);
      }

      return list.join(' ');
    }, [selected, image]);

    return (
      <div className={itemClassName}>
        <div className={styles.opacity}>
          <p>{intl.formatMessage({ id: 'gameUIPropImageOpacity' })}</p>
          <Input
            type="line"
            value={Math.round(opacity * 100)}
            valueType="number"
            size="custom"
            min={0}
            max={100}
            precision={0}
            formatter={(v) => `${v}%`}
            onFocus={() => {
              !isFocused && setIsFocused(true);
              editingIds.current = ids;
            }}
            onBlur={(value) => {
              isFocused && setIsFocused(false);
              onOpacityChange(Number(value) / 100);
            }}
          />
        </div>
        <div
          ref={previewRef}
          className={styles.preview}
          onClick={() => !selected && setSelectedId(groupId)}
        >
          {previewContent}
          {selected && (
            <Menu
              selectedItem=""
              items={menuItems}
              onItemSelect={(menuItemId) => {
                setSelectedId(undefined);
                onMenuItemSelect(menuItemId, groupId);
              }}
            />
          )}
        </div>
      </div>
    );
  },
);
