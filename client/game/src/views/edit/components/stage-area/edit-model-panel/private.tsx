import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import style from './index.module.scss';
import { ModelType } from '@box/apis';
import { Search } from 'src/views/edit/components/search';
import { ModelList } from 'src/views/edit/components/stage-area/edit-model-panel/model-list';
import { Button, ItemId, MenuItemOptions, Modal, Toast } from '@box/box-design';
import {
  FETCH_LIMIT,
  fetchModelList,
  ModelAction,
  ModelData,
  ModelPanelTab,
} from 'src/views/edit/components/stage-area/edit-model-panel/index';
import { isMobile } from 'src/utils/mobile';
import { clientConfig } from 'src/config/client';
import { apis } from 'src/apis/local-api';
import { editor } from 'src/client/edit/edit-client';
import { RootState } from 'src/redux/edit';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedModel } from 'src/redux/edit/ui';
import { IconRotate } from '@box/icons';
import {
  ScrollAction,
  ScrollManage,
} from 'src/views/edit/components/scroll-trigger';
import { calc_class_name } from 'src/utils/classname';

export const PrivateModelPanel = ({
  currentTab,
}: {
  currentTab: ModelPanelTab;
}) => {
  const [modelList, setModelList] = useState<ModelData[]>([]);
  const [fetching, setFetching] = useState(false);
  const [keyword, setKeyword] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  const selectedModel = useSelector(
    (state: RootState) => state.ui.selectedModel?.modelData,
  );

  const intl = useIntl();
  const dispatch = useDispatch();

  const listRef = useRef<ScrollManage>(null);

  const offset = useRef(0);
  offset.current = modelList.length;

  const loadMore = useCallback(
    async (refresh?: boolean) => {
      setFetching(true);
      try {
        const res = await fetchModelList({
          modelType: ModelType.Private,
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

  const onSearch = useCallback((keyword: string) => {
    setKeyword(keyword);
  }, []);

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

  const actionsMenu: MenuItemOptions[] = useMemo(() => {
    return [
      {
        id: ModelAction.Open,
        text: intl.formatMessage({ id: 'open' }),
      },
    ];
  }, [intl]);

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

  const onNewModal = useCallback(() => {
    if (isMobile()) {
      Toast.warning({
        content: intl.formatMessage({
          id: 'mobileVeWarnning',
        }),
      });
      return;
    }
    window.open(clientConfig.WEBSITE_VOXA_URL);
  }, [intl]);

  return (
    <div className={style.privateModelPanel}>
      <div
        className={calc_class_name(
          style.privateModelSearch,
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
          onSelect={onSelect}
          selectedId={selectedModel?.id ?? 0}
          modelList={modelList}
          newModel={true}
          loading={fetching}
          onNewModel={onNewModal}
          actionsMenu={actionsMenu}
          onMenuItemSelected={handleMenuAction}
          onScrollToBottom={loadMore}
        />
      </div>
    </div>
  );
};
