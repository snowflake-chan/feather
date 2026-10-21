import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

import { Button, ItemId, Modal, Toast } from '@box/box-design';
import { ModelType } from '@box/apis';

import { Search } from 'src/views/edit/components/search';
import { ModelList } from '../edit-model-panel/model-list';
import {
  FETCH_LIMIT,
  fetchModelList,
  ModelAction,
  ModelData,
  ModelPanelTab,
} from '../edit-model-panel/index';
import { isMobile } from 'src/utils/mobile';
import { clientConfig } from 'src/config/client';
import { apis } from 'src/apis/local-api';
import { editor } from 'src/client/edit/edit-client';
import { setSelectedModel } from 'src/redux/edit/ui';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/redux/edit';

import style from './index.module.scss';
import { IconRotate } from '@box/icons';
import {
  ScrollAction,
  ScrollManage,
} from 'src/views/edit/components/scroll-trigger';
import { calc_class_name } from 'src/utils/classname';

export const PublicModelPanel = ({ currentTab }: { currentTab: ModelPanelTab }) => {
  const [modelList, setModelList] = useState<ModelData[]>([]);
  const [fetching, setFetching] = useState(false);
  const [keyword, setKeyword] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  const intl = useIntl();
  const dispatch = useDispatch();

  const listRef = useRef<ScrollManage>(null);

  const offset = useRef(0);
  offset.current = modelList.length;

  const selectedModel = useSelector(
    (state: RootState) => state.ui.selectedModel?.modelData,
  );

  const loadMore = useCallback(
    async (refresh?: boolean) => {
      setFetching(true);
      try {
        const res = await fetchModelList({
          modelType: ModelType.Public,
          limit: FETCH_LIMIT,
          offset: refresh ? 0 : offset.current,
          modelName: keyword,
        });
        if (res) {
          setModelList((prev) => (refresh ? res : [...prev, ...res]));
        }
      } finally {
        setFetching(false);
      }
    },
    [keyword],
  );

  const refreshModelList = useCallback(async () => {
    await loadMore(true);
    if (listRef.current) {
      listRef.current[ScrollAction.setScrollHeight](0);
    }
  }, [loadMore]);

  useEffect(() => {
    setInputValue('');
  }, [currentTab]);

  useEffect(() => {
    refreshModelList();
  }, [refreshModelList]);

  const onSearch = useCallback((keyword: string) => {
    setKeyword(keyword);
  }, []);

  const handleOpenModel = useCallback(
    (modelId: number) => {
      if (isMobile()) {
        Toast.warning({
          content: intl.formatMessage({
            id: 'mobileVeWarnning',
          }),
        });
        return;
      }
      window.open(`${clientConfig.WEBSITE_VOXA_URL}/${modelId}`);
    },
    [intl],
  );

  const handleRemoveModel = useCallback(
    (modelId: number) => {
      const destroy = Modal.show({
        type: 'warning',
        title: intl.formatMessage({ id: 'removeModel' }),
        content: intl.formatMessage({ id: 'removePrivateModelWarning' }),
        confirmText: intl.formatMessage({ id: 'remove' }),
        cancelText: intl.formatMessage({ id: 'cancel' }),
        onConfirm: async () => {
          try {
            const res = await apis.model.deleteModelUsingDelete([modelId]);
            if (res) {
              await refreshModelList();
              Toast.success({
                content: intl.formatMessage({
                  id: 'deleteSuccess',
                }),
              });
            }
          } catch (e) {
            editor.logger.error(`error deleting private model: ${e}`);
          } finally {
            destroy();
          }
        },
        onCancel: () => {
          destroy();
        },
      });
    },
    [intl, refreshModelList],
  );

  const handleMenuAction = useCallback(
    (params: { actionId: ItemId; modelId: number }) => {
      const { actionId, modelId } = params;
      switch (actionId) {
        case ModelAction.Open:
          handleOpenModel(modelId);
          break;
        case ModelAction.Remove:
          handleRemoveModel(modelId);
          break;
      }
    },
    [handleOpenModel, handleRemoveModel],
  );

  const onSelect = useCallback(
    (modelId, event: React.MouseEvent) => {
      if (modelId === selectedModel?.id) {
        dispatch(setSelectedModel(undefined));
        return;
      }
      const modelData = modelList.find((_) => _.id === modelId);
      if (modelData) {
        dispatch(
          setSelectedModel({
            modelData,
            mousePosition: {
              x: event.clientX,
              y: event.clientY,
            },
          }),
        );
      }
    },
    [dispatch, modelList, selectedModel?.id],
  );

  return (
    <div className={style.publicModelPanel}>
      <div
        className={calc_class_name(
          style.publicModelSearch,
          style.modelSearchContainer,
        )}
      >
        <Search
          onSearch={onSearch}
          value={inputValue}
          onChange={setInputValue}
          size="middle"
        />
        <Button
          className={style.searchIcon}
          type="icon"
          icon={<IconRotate />}
          onClick={() => {
            refreshModelList();
          }}
        />
      </div>
      <div className={style.privateModelList}>
        <ModelList
          ref={listRef}
          selectedId={selectedModel?.id ?? 0}
          onSelect={onSelect}
          newModel={false}
          modelList={modelList}
          loading={fetching}
          onMenuItemSelected={handleMenuAction}
          onScrollToBottom={loadMore}
        />
      </div>
    </div>
  );
};
