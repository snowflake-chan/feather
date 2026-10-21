import React, { useState, useMemo, Ref, forwardRef } from 'react';

import { ItemId, MenuItemOptions } from '@box/box-design';
import { IconAdd } from '@box/icons';

import { ObjectCard } from 'src/views/edit/components/object-card';
import { ModelData } from '..';
import ScrollTrigger, { ScrollManage } from '../../../scroll-trigger';

import style from './index.module.scss';

type ModelListProps = {
  modelList: ModelData[];
  newModel: boolean;
  onNewModel?: () => void;
  /**
   * 当选中的回调
   */
  onSelect?: (id: number, event: React.MouseEvent) => void;
  /**
   * 选中指定树节点
   */
  selectedId?: number;
  onScrollToBottom?: () => void;
  /**
   * 操作菜单列表
   */
  actionsMenu?: MenuItemOptions[];
  /**
   * 操作菜单的回调
   */
  onMenuItemSelected?: (params: {
    actionId: ItemId;
    modelId: number;
    modelData?: ModelData;
  }) => void;
  /**
   * 用于标识列表是否正在加载
   */
  loading?: boolean;
};

const CARD_SIZE = 116;

export const ModelListView = (
  props: ModelListProps,
  ref: Ref<ScrollManage>,
) => {
  const {
    modelList,
    newModel,
    onNewModel,
    onSelect,
    selectedId: optionSelectedId,
    onScrollToBottom,
    actionsMenu,
    onMenuItemSelected,
    loading = false,
  } = props;

  const [selectedId, setSelectedId] = useState<number>(0);

  const currSelectedId = useMemo(() => {
    return optionSelectedId === undefined ? selectedId : optionSelectedId;
  }, [optionSelectedId, selectedId]);

  const newModelBtn = useMemo(() => {
    return (
      <div
        className={style.newModelBtn}
        onClick={() => {
          onNewModel && onNewModel();
        }}
      >
        <IconAdd />
      </div>
    );
  }, [onNewModel]);

  const list = useMemo(() => {
    const filterRecord: number[] = [];
    return modelList.map((model) => {
      // 过滤由于异步协作产生的一些奇怪的重复数据
      if (filterRecord[model.id]) {
        return;
      }
      filterRecord[model.id] = 1;
      return (
        <ObjectCard
          key={model.id}
          id={model.id}
          title={model.name}
          selectable={true}
          isSelected={currSelectedId === model.id}
          onClick={(ev) => {
            if (currSelectedId === model.id) {
              setSelectedId(0);
            } else {
              setSelectedId(model.id);
            }
            onSelect && onSelect(model.id, ev);
          }}
          size={'small'}
          coverUrl={model.modelPreviewUrl}
          animated={model.animated}
          actionsMenu={actionsMenu}
          showAction={'hover'}
          onMenuItemSelected={({ id, actionId }) =>
            onMenuItemSelected?.({
              actionId,
              modelId: id,
              modelData: model,
            })
          }
        />
      );
    });
  }, [currSelectedId, actionsMenu, onMenuItemSelected, onSelect, modelList]);

  return (
    <ScrollTrigger
      ref={ref}
      loading={loading}
      loadMore={onScrollToBottom}
      containerClassName={style.scrollWrapper}
    >
      <div className={style.listWrapper}>
        {newModel && newModelBtn}
        {list}
      </div>
    </ScrollTrigger>
  );
};

export const ModelList = forwardRef<ScrollManage, ModelListProps>(
  ModelListView,
);
