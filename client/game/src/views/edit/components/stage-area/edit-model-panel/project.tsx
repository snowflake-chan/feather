import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import { ItemId, MenuItemOptions } from '@box/box-design';
import { ModelType } from '@box/apis';

import { RootState } from 'src/redux/edit';
import { ModelAction, ModelData, ModelPanelTab } from '.';
import { ModelList } from './model-list';
import { Search } from '../../search';
import { EditType, setVoxaData } from 'src/redux/edit/creator';
import ProjectModelActions, {
  Actions,
} from 'src/views/edit/components/stage-area/edit-model-panel/project-model-actions';
import { setSelectedModel } from 'src/redux/edit/ui';
import { ScrollAction, ScrollManage } from '../../scroll-trigger';

import style from './index.module.scss';
import { useEdit } from 'src/client/edit/edit-context';
import {
  projectModelSource,
} from './project-model-source';
import type { ProjectModelScope } from './project-model-source';
import { modelTypeForNewModel } from './project-model-membership';

/**
 * 从 extraProject 中获取所有项目模型（不分页,且按更新时间倒序排序）
 * */

export const ProjectModelPanel = ({
  currentTab,
  source = 'project',
}: {
  currentTab: ModelPanelTab;
  source?: ProjectModelScope;
}) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const editor = useEdit();
  const [modelList, setModelList] = useState<ModelData[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [searchName, setSearchName] = useState<string>('');
  const projectModelActionsRef = useRef<Actions>(null);
  const projectModelScrollRef = useRef<ScrollManage>(null);

  const getModelList = useCallback(async () => {
    setModelList(await projectModelSource.load(editor, source, searchName));
  }, [editor, searchName, source]);

  // 初始化列表 & 订阅刷新列表
  useEffect(() => {
    void getModelList();
    return projectModelSource.subscribe(editor, source, getModelList);
  }, [editor, getModelList, source]);

  useEffect(() => {
    setInputValue('');
  }, [currentTab]);

  const onNewModel = useCallback(() => {
    dispatch(
      setVoxaData({
        isShow: true,
        modelId: 0,
        modelType: modelTypeForNewModel(source),
        editType: EditType.Normal,
      }),
    );
  }, [dispatch, source]);

  const actionsMenu: MenuItemOptions[] = useMemo(() => {
    const actions = [
      {
        id: ModelAction.Edit,
        text: intl.formatMessage({ id: 'edit' }),
      },
      {
        id: ModelAction.Rename,
        text: intl.formatMessage({ id: 'rename' }),
      },
      {
        id: ModelAction.Copy,
        text: intl.formatMessage({ id: 'copy' }),
      },
      {
        id: ModelAction.Remove,
        text: intl.formatMessage({ id: 'remove' }),
      },
    ];
    // 本地模型走 VOXA，工程包模型走本地 runtime bridge；两者都支持
    // 编辑、重命名、移除。Copy 没有本地实现，不能请求云端接口。
    return actions.filter((action) =>
      projectModelSource.supportsAction(action.id),
    );
  }, [intl]);

  const handleMenuAction = useCallback(
    (params: {
      actionId: ItemId;
      modelId: number;
      modelData?: ModelData;
    }) => {
      const { actionId, modelId, modelData } = params;
      if (!projectModelActionsRef.current) {
        return;
      }
      const model = modelData || modelList.find((item) => item.id === modelId);
      if (!model) return;
      projectModelActionsRef.current[actionId]?.(model);
    },
    [modelList],
  );

  const selectedModel = useSelector(
    (state: RootState) => state.ui.selectedModel?.modelData,
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

  const scrollToTop = useCallback(() => {
    if (projectModelScrollRef.current) {
      projectModelScrollRef.current[ScrollAction.setScrollHeight](0);
    }
  }, []);

  return (
    <div className={style.projectModelPanel}>
      <div className={style.projectModelSearch}>
        <Search
          value={inputValue}
          onChange={setInputValue}
          onSearch={setSearchName}
          size="middle"
        />
      </div>
      <div className={style.projectModelList}>
        <ModelList
          ref={projectModelScrollRef}
          onSelect={onSelect}
          selectedId={selectedModel?.id ?? 0}
          modelList={modelList}
          newModel={projectModelSource.canCreate(source)}
          onNewModel={onNewModel}
          actionsMenu={actionsMenu.length ? actionsMenu : undefined}
          onMenuItemSelected={handleMenuAction}
        />
      </div>
      <ProjectModelActions
        ref={projectModelActionsRef}
        scrollToTop={scrollToTop}
      />
    </div>
  );
};
