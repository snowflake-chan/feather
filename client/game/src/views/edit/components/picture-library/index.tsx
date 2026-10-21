import {
  ReactNode,
  memo,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useContext,
} from 'react';
import { useIntl } from 'react-intl';
import { Toast } from '@box/box-design';
import { SortOrder } from '@box/apis';
import { getOSSResourceUrl } from 'src/engine/resource/util';
import { copyToClipboard } from 'src/utils/copy2clipboard';
import { AssetLibrary } from '../asset-library';

import styles from './style.module.scss';
import { GroupAssetEntry } from '@box/schema/project/project-rda';
import { ArenaEditorUIContext } from '../../editor-ui-context';

type Props = {
  onUploadClick: (spec: {
    onConfirm?: () => void;
    onSuccess?: () => void;
  }) => void;
  onClose: () => void;
  onConfirm: (selectedKey: string) => void;
};

function PictureLibraryView(props: Props) {
  const intl = useIntl();
  const {
    replica: {
      project: { pictureAssets },
    },
  } = useContext(ArenaEditorUIContext);
  const {
    onUploadClick: propsUploadClick,
    onClose,
    onConfirm: propsConfirm,
  } = props;
  const [selectedKey, setSelectedKey] = useState<string | undefined>();
  const [isEmptyWithoutSearch, setIsEmptyWithoutSearch] = useState(true);
  const [assetsArray, setAssetsArray] = useState<
    (GroupAssetEntry & { name: string })[]
  >([]);
  const [search, setSearch] = useState<string>();
  const [sortBy, setSortBy] = useState(SortOrder.CreateTimeDesc);

  useEffect(() => {
    let res = Object.entries(pictureAssets).map(([key, asset]) => {
      const path = key.split('/');
      const name = path[path.length - 1];
      return {
        name,
        ...asset,
      };
    });

    if (search) {
      res = res.filter(
        (v) => v.name.toLowerCase().indexOf(search.toLowerCase()) !== -1,
      );
    }

    switch (sortBy) {
      case SortOrder.NameAsc:
        res.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        break;
      default:
        res.sort((a, b) => {
          return b.updateAt - a.updateAt;
        });
        break;
    }
    setAssetsArray(res);

    if (!search) {
      setIsEmptyWithoutSearch(!res.length);
    }
  }, [search, sortBy, setAssetsArray, pictureAssets]);

  const onConfirm = useCallback(async () => {
    if (!selectedKey) {
      return;
    }
    const target = assetsArray?.find((asset) => asset.id === selectedKey);
    if (!target) {
      return;
    }
    propsConfirm(`picture/${target.name}`);
    onClose();
  }, [selectedKey, assetsArray, propsConfirm, onClose]);

  const items = useMemo(() => {
    if (!assetsArray) {
      return [];
    }
    const itemList: ReactNode[] = [];
    assetsArray?.map((asset) => {
      itemList.push(
        <Item
          id={asset.id}
          key={asset.id}
          picture={getOSSResourceUrl(asset.previewImage)}
          name={asset.name}
          onSelect={setSelectedKey}
          selected={selectedKey === asset.id}
        />,
      );
    });

    return itemList;
  }, [assetsArray, selectedKey]);

  const onUploadClick = useCallback(() => {
    propsUploadClick({ onConfirm: onClose });
  }, [onClose, propsUploadClick]);

  return (
    <AssetLibrary
      title={intl.formatMessage({
        id: 'pictureLibrary',
      })}
      items={items}
      selectedKey={selectedKey}
      onClose={onClose}
      onConfirm={onConfirm}
      setSearch={setSearch}
      sortBy={sortBy}
      setSortBy={setSortBy}
      isEmptyWithoutSearch={isEmptyWithoutSearch}
      listEmptyTips={intl.formatMessage({ id: 'pictureLibraryEmpty' })}
      gap={24}
      extraBtn={{
        onAction: onUploadClick,
        actionBtn: intl.formatMessage({
          id: 'uploadPicture',
        }),
      }}
    />
  );
}

export const PictureLibrary = memo(PictureLibraryView);

type ItemProps = {
  id: string;
  name: string;
  picture: string;
  onSelect: (key: string) => void;
  selected: boolean;
};

function ItemView(props: ItemProps) {
  const intl = useIntl();
  const { id, picture, name, onSelect, selected } = props;

  const className = useMemo(() => {
    const list: string[] = [styles.item];

    if (selected) {
      list.push(styles.selected);
    }

    return list.join(' ');
  }, [selected]);

  const nameWithoutPrefix = useMemo(() => {
    const path = name.split('/');
    return path[path.length - 1];
  }, [name]);

  const copy = useCallback(
    (name: string) => {
      if (copyToClipboard(name)) {
        Toast.success({
          content: intl.formatMessage({ id: 'copySuccess' }),
        });
      } else {
        Toast.error({
          content: intl.formatMessage({ id: 'copyFailed' }),
        });
      }
    },
    [intl],
  );
  return (
    <div className={className} onClick={() => onSelect(id)}>
      <img src={picture} />
      <div className={styles.itemFooter}>
        <p
          onClick={(ev) => {
            ev.stopPropagation();
            copy(nameWithoutPrefix);
          }}
        >
          {nameWithoutPrefix}
        </p>
      </div>
    </div>
  );
}

const Item = memo(ItemView);
