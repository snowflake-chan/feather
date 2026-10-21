import React, {
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
  forwardRef,
  Ref,
} from 'react';
import { useIntl } from 'react-intl';

import { ItemId, MenuItemOptions } from '@box/box-design';

import ScrollTrigger, { ScrollManage } from '../../../scroll-trigger';
import { ObjectCard } from 'src/views/edit/components/object-card';
import { PlayerSkin } from 'src/redux/edit/player-skin';

import emptyImage from 'src/assets/img-empty.png';
import style from './index.module.scss';

type SkinListProps = {
  skinList: PlayerSkin[];
  /**
   * 列表为空时的提示语
   */
  emptyTips: string;
  /**
   * 默认皮肤ID。
   * 默认皮肤需要标注label
   */
  defaultSkinId?: number;
  /**
   * 当选中的回调
   */
  onSelect?: (ids: number[]) => void;
  /**
   * 选中指定树节点
   */
  selectedIds?: number[];
  /**
   * 皮肤是否可以被选中。默认不可以
   */
  selectable?: boolean;
  /**
   * 是否可以点击复制title。默认不可以
   */
  copyTitle?: boolean;
  /**
   * 每一行的卡片数量。默认为3个
   */
  rowNum?: number;
  onScrollToBottom: () => void;
  loading: boolean;

  /**
   * 根据皮肤ID获取操作菜单列表
   * @param skinId
   * @returns
   */
  getActionsMenu?: (skinId: number) => MenuItemOptions[];
  /**
   * 操作菜单的回调
   */
  onMenuItemSelected?: (params: { actionId: ItemId; skinId: number }) => void;
};

const CARD_SIZE = 200;

export const SkinListView = (props: SkinListProps, ref: Ref<ScrollManage>) => {
  const {
    skinList,
    defaultSkinId,
    onSelect,
    selectedIds: optionSelectedIds,
    selectable,
    copyTitle,
    rowNum = 3,
    onScrollToBottom,
    emptyTips,
    getActionsMenu,
    onMenuItemSelected,
    loading,
  } = props;
  const intl = useIntl();
  const listWrapperRef = useRef<HTMLDivElement>(null);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [gap, setGap] = useState(0);

  const currSelectedIds = useMemo(() => {
    return optionSelectedIds || selectedIds;
  }, [optionSelectedIds, selectedIds]);

  useLayoutEffect(() => {
    if (listWrapperRef.current) {
      const rect = listWrapperRef.current.getBoundingClientRect();
      setGap((rect.width - CARD_SIZE * rowNum) / (rowNum - 1));
    }
  }, [rowNum]);

  const emptyContent = useMemo(() => {
    if (!skinList.length) {
      return (
        <div className={style.empty}>
          <img className={style.emptyImg} src={emptyImage.src} />
          {emptyTips}
        </div>
      );
    }
    return;
  }, [emptyTips, skinList]);

  const list = useMemo(() => {
    const filterRecord = new Set<number>();
    return skinList.map((skin) => {
      // 过滤由于异步协作产生的一些奇怪的重复数据
      if (filterRecord.has(skin.id)) {
        return;
      }
      filterRecord.add(skin.id);
      return (
        <ObjectCard
          key={skin.id}
          id={skin.id}
          title={skin.name}
          label={
            defaultSkinId === skin.id
              ? intl.formatMessage({ id: 'gamePlayerDefaultSkin' })
              : undefined
          }
          selectable={selectable}
          copyTitle={copyTitle}
          isSelected={currSelectedIds.includes(skin.id)}
          selectedType={'checkBox'}
          onClick={() => {
            let ids: number[] = [];
            if (currSelectedIds.includes(skin.id)) {
              ids = currSelectedIds.filter((id) => id !== skin.id);
            } else {
              ids = [...currSelectedIds, skin.id];
            }

            setSelectedIds(ids);
            onSelect && onSelect(ids);
          }}
          size={'normal'}
          coverUrl={skin.previewUrl}
          actionsMenu={getActionsMenu?.(skin.id)}
          onMenuItemSelected={({ id, actionId }) =>
            onMenuItemSelected?.({
              actionId,
              skinId: id,
            })
          }
        />
      );
    });
  }, [
    copyTitle,
    currSelectedIds,
    defaultSkinId,
    getActionsMenu,
    intl,
    onMenuItemSelected,
    onSelect,
    selectable,
    skinList,
  ]);

  return (
    <div className={style.wrapper}>
      {emptyContent}
      <ScrollTrigger
        ref={ref}
        loading={loading}
        loadMore={onScrollToBottom}
        containerClassName={style.scrollWrapper}
      >
        <div ref={listWrapperRef} className={style.listWrapper} style={{ gap }}>
          {list}
        </div>
      </ScrollTrigger>
    </div>
  );
};

export const SkinList = forwardRef<ScrollManage, SkinListProps>(SkinListView);
