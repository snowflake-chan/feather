import {
  memo,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import {
  pickAutoLayoutProp,
  isUIElement,
  isUIScreen,
} from '@box/schema/project/ui-rda/util';
import type { RootState } from 'src/redux/edit';
import { PropertyTabs, TabsConfig } from './tabs';
import { PropertyCards } from './cards';
import { UITreeContext } from '../hooks';
import {
  CARD_ID_PREFIX,
  GameUIPropsContext,
  GameUIPropsContextType,
  PropTabType,
  TAB_ID_PREFIX,
} from './defs';
import styles from './container.module.scss';

function GameUIPropertiesView() {
  const { selectedIds, selectedScreenId } = useSelector((state: RootState) => ({
    selectedIds: state.gameUI.selectedIds,
    selectedScreenId: state.gameUI.screen.selectedScreenId,
  }));

  const uiTreeRef = useContext(UITreeContext);

  const {
    textIds,
    inputIds,
    imageIds,
    scrollBoxIds,
    autoLayoutIds,
    screenIds,
    hasText,
    hasInput,
    hasImage,
    hasScrollBox,
    hasAutoLayout,
    hasScreen,
  } = useMemo(() => {
    const textIds: string[] = [];
    const inputIds: string[] = [];
    const imageIds: string[] = [];
    const scrollBoxIds: string[] = [];
    const autoLayoutIds: string[] = [];
    const screenIds: string[] = [];

    const { uiTree } = uiTreeRef;

    // TODO 按照列表序排序
    selectedIds.forEach((id) => {
      const node = uiTree[id];

      if (!node || !node.value) {
        return;
      }

      if (isUIElement(node.value)) {
        switch (node.value.data.type) {
          case 'text':
            textIds.push(id);
            break;
          case 'input':
            inputIds.push(id);
            break;
          case 'image':
            imageIds.push(id);
            break;
          case 'scrollBox':
            scrollBoxIds.push(id);
            break;
        }
      }

      if (pickAutoLayoutProp(node.value)) {
        autoLayoutIds.push(node.id);
      }
    });

    if (!selectedIds.length && selectedScreenId) {
      // 添加当前选中屏幕
      const screenNode = uiTree[selectedScreenId];
      if (screenNode && screenNode.value && isUIScreen(screenNode.value)) {
        screenIds.push(selectedScreenId);
        if (pickAutoLayoutProp(screenNode.value)) {
          autoLayoutIds.push(screenNode.id);
        }
      }
    }

    return {
      textIds,
      inputIds,
      imageIds,
      scrollBoxIds,
      autoLayoutIds,
      screenIds,
      hasText: textIds.length > 0,
      hasInput: inputIds.length > 0,
      hasImage: imageIds.length > 0,
      hasScrollBox: scrollBoxIds.length > 0,
      hasAutoLayout: autoLayoutIds.length > 0,
      hasScreen: screenIds.length > 0,
    };
  }, [selectedIds, selectedScreenId, uiTreeRef]);

  const tabsConfig = useMemo<TabsConfig>(() => {
    return {
      [PropTabType.Basic]: selectedIds.length > 0,
      [PropTabType.Text]: hasText,
      [PropTabType.Input]: hasInput,
      [PropTabType.Image]: hasImage,
      [PropTabType.ScrollBox]: hasScrollBox,
      [PropTabType.Screen]: hasScreen,
      [PropTabType.AutoLayout]: hasAutoLayout,
    };
  }, [
    selectedIds.length,
    hasText,
    hasInput,
    hasImage,
    hasScrollBox,
    hasAutoLayout,
    hasScreen,
  ]);

  const [selectedTab, setSelectedTab] = useState(PropTabType.Basic);

  const cardsRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const scrollCardByTab = useCallback<
    GameUIPropsContextType['scrollCardByTab']
  >(
    (tabType: PropTabType) => {
      if (
        (!tabsConfig[tabType] && tabType !== PropTabType.Basic) ||
        !cardsRef.current
      ) {
        return;
      }

      const card = cardsRef.current.querySelector(
        `#${CARD_ID_PREFIX}${tabType}`,
      );

      setSelectedTab(tabType);

      card?.scrollIntoView(true);
    },
    [tabsConfig],
  );

  const selectTabByCard = useCallback<
    GameUIPropsContextType['selectTabByCard']
  >(
    (tabType: PropTabType) => {
      setSelectedTab(tabType);

      const tab = tabsRef.current?.querySelector(`#${TAB_ID_PREFIX}${tabType}`);

      tab?.scrollIntoView({ block: 'center' });
    },
    [setSelectedTab],
  );

  const propsContext = useMemo<GameUIPropsContextType>(
    () => ({
      selectedTab,
      scrollCardByTab,
      selectTabByCard,
    }),
    [selectedTab, scrollCardByTab, selectTabByCard],
  );

  return (
    <GameUIPropsContext.Provider value={propsContext}>
      <div className={styles.container}>
        <PropertyTabs ref={tabsRef} config={tabsConfig} />
        <PropertyCards
          ref={cardsRef}
          textIds={textIds}
          inputIds={inputIds}
          imageIds={imageIds}
          scrollBoxIds={scrollBoxIds}
          autoLayoutIds={autoLayoutIds}
          screenIds={screenIds}
        />
      </div>
    </GameUIPropsContext.Provider>
  );
}

export const GameUIProperties = memo(GameUIPropertiesView);
