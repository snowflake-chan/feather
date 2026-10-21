import { ReactNode, memo, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { IconCancel, IconSort } from '@box/icons';
import { Button, ItemId, MenuItemOptions, Select } from '@box/box-design';
import { SortOrder } from '@box/apis';
import ImgEmpty from './img-empty.png';
import { Search } from '../search';

import styles from './style.module.scss';

type Props = {
  title: string;
  selectedKey?: string;
  items: ReactNode[];
  onClose: () => void;
  onConfirm: () => void;
  setSearch: (search: string) => void;
  setSortBy: (sort: SortOrder) => void;
  sortBy: SortOrder;
  isEmptyWithoutSearch: boolean;
  listEmptyTips: string;
  extraBtn?: { onAction: () => void; actionBtn: string };
  gap?: number;
};
export const AssetLibrary = memo(
  ({
    title,
    selectedKey,
    items,
    onClose,
    onConfirm,
    setSearch,
    setSortBy,
    sortBy,
    isEmptyWithoutSearch,
    listEmptyTips,
    extraBtn,
    gap,
  }: Props) => {
    const intl = useIntl();

    const emptyItem = useMemo(() => {
      if (items.length !== 0) {
        return;
      }

      return (
        <div className={styles.emptyItem}>
          <img src={ImgEmpty.src} />
          <p>
            {isEmptyWithoutSearch
              ? listEmptyTips
              : intl.formatMessage({ id: 'gamePlayerSearchEmpty' })}
          </p>
        </div>
      );
    }, [items.length, isEmptyWithoutSearch, listEmptyTips, intl]);

    const list = useMemo(() => {
      if (items.length === 0) {
        return;
      }

      return (
        <div className={styles.listWrapper}>
          <div className={styles.list} style={{ gap: gap }}>
            {items}
          </div>
        </div>
      );
    }, [gap, items]);

    const sortItems: MenuItemOptions[] = useMemo(() => {
      return [
        {
          id: SortOrder.CreateTimeDesc,
          text: intl.formatMessage({ id: 'sortByCreateTime' }),
        },
        {
          id: SortOrder.NameAsc,
          text: intl.formatMessage({ id: 'sortByName' }),
        },
      ];
    }, [intl]);

    const onSelectSort = useCallback(
      (data: { id: ItemId }) => {
        if (typeof data.id === 'string' || sortBy === data.id) {
          return;
        }
        setSortBy(data.id);
      },
      [setSortBy, sortBy],
    );

    const toolBar = useMemo(() => {
      if (isEmptyWithoutSearch) {
        return;
      }
      return (
        <div className={styles.toolBar}>
          <Search
            onSearch={setSearch}
            clearBtn={true}
            size="middle"
            style={{ width: 300 }}
          />
          <div className={styles.sort}>
            <IconSort />
            <Select
              align={{ offset: [0, 0] }}
              items={sortItems}
              selection={sortBy}
              onSelect={onSelectSort}
            />
          </div>
        </div>
      );
    }, [isEmptyWithoutSearch, onSelectSort, setSearch, sortBy, sortItems]);

    return (
      <div className={styles.library}>
        <div className={styles.main}>
          <div className={styles.header}>
            <p className={styles.title}>{title}</p>
            <IconCancel className={styles.iconClose} onClick={onClose} />
          </div>
          {toolBar}
          {list}
          {emptyItem}
          <div className={styles.footer}>
            {extraBtn && (
              <Button
                type="secondary"
                onClick={extraBtn.onAction}
                style={{ width: 126 }}
              >
                {extraBtn.actionBtn}
              </Button>
            )}
            <Button type="secondary" onClick={onClose} style={{ width: 126 }}>
              {intl.formatMessage({
                id: 'cancel',
              })}
            </Button>
            <Button
              type="primary"
              onClick={onConfirm}
              disabled={!selectedKey}
              style={{ width: 126 }}
            >
              {intl.formatMessage({
                id: 'confirm',
              })}
            </Button>
          </div>
        </div>
      </div>
    );
  },
);
