import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useEdit } from '~/client/edit/edit-context';
import { EditorUIEvent } from '~/client/edit/schema';
import { RootState } from '~/redux/edit';
import { LoadingSeed } from '~/views/edit/components/stage-area/seeds';
import { CreateTabEnum } from '../../defs';
import { AudioLibrary } from '../audio-library';
import { TransformType } from '../transformHandler';
import { StageAreaContext, StageAreaContextType } from './context';
import { MainContent } from './main-content';
import { RightSidebar } from './right-sidebar';

type StageAreaProps = {
  transformType: TransformType;
  isGuest: boolean;
};
/**
 * 创作舞台
 ** 组成部分: 左侧主要内容区、右侧列表面板
 */
export function StageArea(props: StageAreaProps) {
  const { isGuest, transformType } = props;
  const [isShowMusicLibrary, setShowMusicLibrary] = useState(false);
  const [UIEventPayload, setUIEventPayload] = useState(['', '']);
  const createTab = useSelector((state: RootState) => state.creator.createTab);
  // TODO: 将需要frame刷新的组件包裹，待后续数据结构整理清楚后删除
  const editor = useEdit();
  const [, updateState] = useState({});

  useEffect(() => {
    editor.setGameframeCb(() => updateState({}));
  }, [editor]);

  const handleShowMusicLibrary = useCallback(
    (params: [event: EditorUIEvent, payload: string[]]) => {
      if (params[0] === EditorUIEvent.openMusicLibrary) {
        setShowMusicLibrary(true);
        setUIEventPayload(params[1]);
      }
    },
    [],
  );

  const [loadingSeeds, setLoadingSeeds] = useState<LoadingSeed[]>([]);
  const addLoadingSeed = useCallback(
    (seed: LoadingSeed) => {
      setLoadingSeeds([...loadingSeeds, seed]);
    },
    [loadingSeeds],
  );

  const removeLoadingSeed = useCallback(
    (seed: LoadingSeed) => {
      setLoadingSeeds(loadingSeeds.filter((i) => i !== seed));
    },
    [loadingSeeds],
  );

  const allSelectedSeeds = useSelector(
    (state: RootState) => state.seeds.allSelectedSeeds,
  );
  const stageAreaContext: StageAreaContextType = useMemo(() => {
    return {
      showMusicLibrary: handleShowMusicLibrary,
      addLoadingSeed,
      removeLoadingSeed,
      loadingSeeds,
    };
  }, [handleShowMusicLibrary, addLoadingSeed, removeLoadingSeed, loadingSeeds]);

  return (
    <StageAreaContext.Provider value={stageAreaContext}>
      <div className="flex flex-row min-h-[220px] h-full">
        {/* 主要内容区 */}
        <MainContent
          transformType={transformType}
          isGuest={isGuest}
          handleShowMusicLibrary={handleShowMusicLibrary}
        />
        {!isGuest && <RightSidebar />}
        {isShowMusicLibrary &&
          (createTab === CreateTabEnum.Scene || !!allSelectedSeeds[0]) && (
            <AudioLibrary
              onClose={() => {
                setShowMusicLibrary(false);
              }}
              UIEventPayload={UIEventPayload}
            />
          )}
      </div>
    </StageAreaContext.Provider>
  );
}
