import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { HierarchyCollapsePanel } from '../../hierarchy-collapse-panel';
import { PropertyCollapsePanel } from '../../property-collapse-panel';
import { useSelector } from 'react-redux';
import { RootState } from 'src/redux/edit';
import { Collapse } from '@box/box-design';
import { IconDropUp } from '@box/icons';
import { useIntl } from 'react-intl';
import { useEventListener, useResizeObserver } from 'src/views/hooks';
import { debounce } from 'src/utils/debounce-throttle';
import style from './index.module.scss';
import RunningIcon from './running.svg';
/** 折叠面板的先后顺序 */
export enum PANEL_IDS {
  /** 导览列表 */
  hierarchy = 0,
  /** 属性面板 */
  property = 1,
}

/** 初始状态下默认打开的面板 */
const DEFAULT_ACTIVE_IDS = [PANEL_IDS.property, PANEL_IDS.hierarchy];

/**
 ** 导览面板 最小高度 174
 ** 属性面板 最小高度 116
 * @MIN_HEIGHTS 各面板的最小高度
 */
const MIN_HEIGHTS = {
  [PANEL_IDS.hierarchy]: 174,
  [PANEL_IDS.property]: 116,
};

/** 折叠面板的最小总高度 */
const MIN_TOTAL_HEIGHT =
  MIN_HEIGHTS[PANEL_IDS.hierarchy] + MIN_HEIGHTS[PANEL_IDS.property];

/** 面板被折叠后的高度(版头高度) */
const COLLAPSED_HEIGHT = 36;

/** 面板内容区域高度(不包含版头高度) */
const PANEL_CONTENT_HEIGHT = `calc(100% - ${COLLAPSED_HEIGHT}px)`;

// 触发resize时，防抖的时间间隔
const RESIZE_DEBOUNCE_TIME = 50;

type DragStartState = {
  /**
   * 拖拽杆上方可以改变高度的面板的序号
   */
  above: number[];
  /**
   * 拖拽杆下方可以改变高度的面板的序号
   */
  below: number[];
  /**
   * 开始拖拽时的鼠标位置
   */
  startY: number;
  /**
   * 开始拖拽时的面板高度
   */
  startHeights: number[];
};

export const ContentPanel = memo(RightPanelView);

function RightPanelView() {
  const isShowRightPanel = useSelector(
    (state: RootState) => state.creator.isShowRightPanel,
  );
  const intl = useIntl();
  const isRunning = useSelector((state: RootState) => state.ui.isRunning);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 高度数组，记录当前各面板的高度
  const [heights, setHeights] = useState<number[]>([]);
  const dragStartState = useRef<DragStartState>(undefined);
  // 记录是否正在拖拽
  const [dragging, setDragging] = useState<boolean>(false);
  // 面板折叠前的高度
  const heightCache = useRef<{
    [id: number]: number | undefined;
  }>({});
  const isCollapsed = useCallback((h: number) => {
    return h === COLLAPSED_HEIGHT;
  }, []);
  const disabledMask = useMemo(() => {
    if (isRunning) {
      return (
        <div className={style.disabledMask}>
          <div className={style.runningIcon}>
            <RunningIcon className={style.topIcon} />
            <RunningIcon className={style.bottomIcon} />
          </div>
          <div className={style.disabledTips}>
            {intl.formatMessage({ id: 'disableRightPanelTips' })}
          </div>
        </div>
      );
    }
    return;
  }, [intl, isRunning]);

  /**
   * @growPanel 面板ID - 该面板目前的高度不足最小高度
   * @diff 高度 - growPanel面板需要补充的高度
   * @shrinkList 面板ID数组 - 高度能够压缩的面板
   * @inputCurHeights 高度数组 - 目前各面板的高度
   * @outputNewHeights 高度数组 - 经过调整后，各面板的高度
   */
  const shrinkPanels = useCallback(
    (
      growPanelID: number,
      diffHeight: number,
      shrinkList: number[],
      inputCurHeights: number[],
      outputNewHeights: number[],
    ) => {
      let shrinkIndex = 0;
      while (shrinkIndex < shrinkList.length) {
        const shrinkPanelID = shrinkList[shrinkIndex];
        const curDiff =
          inputCurHeights[shrinkPanelID] - MIN_HEIGHTS[shrinkPanelID];

        if (curDiff >= diffHeight) {
          outputNewHeights[growPanelID] =
            outputNewHeights[growPanelID] + diffHeight;
          outputNewHeights[shrinkPanelID] =
            inputCurHeights[shrinkPanelID] - diffHeight;
          break;
        }

        // 当前shrinkPanel压缩到最小高度，growPanel增加对应的高度差
        outputNewHeights[growPanelID] = outputNewHeights[growPanelID] + curDiff;
        outputNewHeights[shrinkPanelID] = MIN_HEIGHTS[shrinkPanelID];

        // 下一个面板还需要压缩的高度
        diffHeight = diffHeight - curDiff;
        shrinkIndex++;
      }
    },
    [],
  );

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const { offsetHeight } = containerRef.current;

    /** 容器的最终高度: 如果容器到达最小高度，则最终高度应为最小高度*/
    const containerHeight = Math.max(MIN_TOTAL_HEIGHT, offsetHeight);

    /**
     ** 导览面板:预设初始高度为固定高度 200
     ** 属性面板:预设初始高度剩余高度 containerHeight - 200
     * @initHeight 各面板的预设初始高度
     */
    const initHeight: number[] = [];
    initHeight[PANEL_IDS.hierarchy] = 200;
    initHeight[PANEL_IDS.property] = containerHeight - 200;

    /**
     ** 如果属性面板高度不够，则压缩导览面板
     * @newHeights 各面板的实际初始高度
     */
    const newHeights = [...initHeight];

    // 导览面板需要压缩的高度
    const diffHeight =
      MIN_HEIGHTS[PANEL_IDS.property] - initHeight[PANEL_IDS.property];

    if (diffHeight > 0) {
      shrinkPanels(
        PANEL_IDS.property,
        diffHeight,
        [PANEL_IDS.hierarchy],
        initHeight,
        newHeights,
      );
    }
    setHeights(newHeights);
    prevContainerHeight.current = containerHeight;
  }, [shrinkPanels]);
  const prevContainerHeight = useRef<number>(0);

  /**
   * 获得在拖拽/折叠时可以被改变高度（即没有被折叠）的所有面板序号
   */
  const getAffectedPanels = useCallback(
    (panelId: number) => {
      let abovePanels: number[] = [];
      for (let i = panelId - 1; i >= 0; i--) {
        if (heightCache.current[i] === undefined) {
          abovePanels.push(i);
        }
      }

      let belowPanels: number[] = [];
      for (let i = panelId; i <= DEFAULT_ACTIVE_IDS.length - 1; i++) {
        if (heightCache.current[i] === undefined) {
          belowPanels.push(i);
        }
      }
      return {
        above: abovePanels,
        below: belowPanels,
      };
    },
    [heightCache],
  );

  /**
   * 拖拽开始时，记录当前各面板的状态
   */
  const onDragStart = useCallback(
    (e: React.MouseEvent, panelIndex: number) => {
      const draggablePanels = getAffectedPanels(panelIndex);
      if (
        !draggablePanels ||
        isCollapsed(heights[PANEL_IDS.property]) ||
        isCollapsed(heights[PANEL_IDS.hierarchy])
      ) {
        return;
      }
      setDragging(true);
      dragStartState.current = {
        above: draggablePanels.above,
        below: draggablePanels.below,
        startY: e.clientY,
        startHeights: [...heights],
      };
    },
    [getAffectedPanels, heights, isCollapsed],
  );

  /**
   * 拖拽时
   */
  const onDrag = useCallback(
    (e: React.MouseEvent) => {
      if (!dragStartState.current) {
        return;
      }
      const { above, below, startY, startHeights } = dragStartState.current;

      // 如果拖拽杆上方或下方没有可改变高度的面板，则禁止拖拽
      if (!above.length || !below.length) {
        return;
      }
      const newHeights = [...startHeights];

      let diff = startY - e.clientY;
      // 当前被拉伸的面板
      let growPanel: number;
      // 所有可被压缩的面板
      let shrinkList: number[];

      if (diff > 0) {
        growPanel = below[0];
        shrinkList = above;
      } else {
        growPanel = above[0];
        shrinkList = below;
        diff = -diff;
      }

      shrinkPanels(growPanel, diff, shrinkList, startHeights, newHeights);
      setHeights(newHeights);
    },
    [dragStartState, shrinkPanels],
  );

  /**
   * 拖拽结束时，清除各面板的状态记录
   */
  const onDragEnd = useCallback(() => {
    setDragging(false);
    dragStartState.current = undefined;
  }, []);

  // 在右边栏以外的地方抬手时，也需要结束拖拽。否则抬手再回来的时候会保持拖拽状态
  useEventListener('mouseup', onDragEnd);

  /**
   * 点击折叠面板时的回调
   */
  const onPanelChange = useCallback(
    (panelId: number, isExpanded: boolean) => {
      const { above, below } = getAffectedPanels(panelId);

      const newHeights = [...heights];

      // 当前面板折叠后的高度
      const panelHeight = COLLAPSED_HEIGHT;

      if (!isExpanded) {
        // 当前面板还未完成折叠，被计入below中，先把它移除
        below.splice(0, 1);

        // 保存被折叠面板当前的高度
        heightCache.current[panelId] = heights[panelId];

        // 折叠当前面板
        newHeights[panelId] = panelHeight;

        // 没有可以被拉伸的面板，只改变自身高度
        if (!above.length && !below.length) {
          setHeights(newHeights);
          return newHeights;
        }

        const diff = heights[panelId] - panelHeight;

        // 优先拉伸上面的面板
        if (above.length) {
          newHeights[above[0]] = heights[above[0]] + diff;
          setHeights(newHeights);
          return newHeights;
        }

        if (below.length) {
          newHeights[below[0]] = heights[below[0]] + diff;
          setHeights(newHeights);
        }
        return newHeights;
      }

      // 没有可以被压缩的面板，则当前面板撑满整个容器高度
      if (!above.length && !below.length) {
        if (containerRef.current) {
          let maxHeight = containerRef.current.offsetHeight;
          heights.forEach((h, index) => {
            if (panelId !== index) {
              maxHeight -= h;
            }
          });
          newHeights[panelId] = maxHeight;
        }
        setHeights(newHeights);
        // 从cache中删除
        heightCache.current[panelId] = undefined;
        return newHeights;
      }

      // 恢复被折叠前的高度
      const cachedHeight = heightCache.current[panelId] || MIN_HEIGHTS[panelId];

      let diff = cachedHeight - panelHeight;

      // 从cache中删除
      heightCache.current[panelId] = undefined;

      // 优先压缩上面的面板，空间不够的话再压缩下面的面板
      const panels = [...above, ...below];
      shrinkPanels(panelId, diff, panels, heights, newHeights);
      setHeights(newHeights);
      return newHeights;
    },
    [getAffectedPanels, heightCache, heights, shrinkPanels],
  );

  /**
   * 屏幕缩放时的回调
   */
  const resize = useMemo(() => {
    return debounce(() => {
      if (!containerRef.current) {
        return;
      }

      let curHeights = [...heights];
      const height = containerRef.current.offsetHeight;
      let totalDiff = height - prevContainerHeight.current;
      let minContainerHeight = 0;

      heights.forEach((h, index) => {
        if (isCollapsed(h)) {
          minContainerHeight += h;
        } else {
          minContainerHeight += MIN_HEIGHTS[index];
        }
      });

      if (
        !totalDiff ||
        (height <= minContainerHeight &&
          prevContainerHeight.current <= minContainerHeight)
      ) {
        return;
      }

      let newHeights = [...curHeights];
      let num = curHeights.filter((h) => !isCollapsed(h)).length;

      // 计算每个面板平均要增加的大小，用ceil是因为优先保证前面的面板拿到更多的空间
      const average = Math.ceil(totalDiff / num);

      let consumed = 0;

      if (totalDiff > 0) {
        curHeights.forEach((h, index) => {
          if (isCollapsed(h)) {
            return;
          }

          const diff = Math.min(average, totalDiff - consumed);
          consumed += diff;

          newHeights[index] = h + diff;
        });
        prevContainerHeight.current = height;
        setHeights(newHeights);
        return;
      }

      // 计算面板剩余的可压缩空间
      const availableSpaces: { index: number; availableSpace: number }[] = [];
      curHeights.forEach((h, index) => {
        if (isCollapsed(h)) {
          return;
        }
        availableSpaces.push({
          index: index,
          availableSpace: h - MIN_HEIGHTS[index],
        });
      });

      // 根据剩余空间从小到大排序
      availableSpaces.sort((a, b) => {
        return a.availableSpace - b.availableSpace;
      });

      availableSpaces.forEach(({ index }) => {
        let diff = Math.round(totalDiff / num);

        if (newHeights[index] + diff < MIN_HEIGHTS[index]) {
          diff = MIN_HEIGHTS[index] - newHeights[index];
          newHeights[index] = MIN_HEIGHTS[index];
        } else {
          newHeights[index] = newHeights[index] + diff;
        }

        // 减去当前面板已压缩的高度，剩余diff由剩余面板平分
        totalDiff -= diff;
        num--;
      });

      prevContainerHeight.current =
        height > minContainerHeight ? height : minContainerHeight;
      setHeights(newHeights);
    }, RESIZE_DEBOUNCE_TIME);
  }, [heights, isCollapsed]);

  useResizeObserver(containerRef.current, resize);

  const className = useMemo(() => {
    const list = [style.rightPanelContainer];

    dragging && list.push(style.dragging);

    return list.join(' ');
  }, [dragging]);

  return (
    <div className={className} onMouseMove={onDrag} ref={containerRef}>
      <Collapse
        className={style.collapseContainer}
        expandIcon={<IconDropUp />}
        defaultActiveIds={DEFAULT_ACTIVE_IDS}
        onArrowClicked={onPanelChange}
      >
        <div
          className={style.panel}
          style={{
            height: `${heights[PANEL_IDS.hierarchy]}px`,
          }}
        >
          {isShowRightPanel && (
            <HierarchyCollapsePanel
              panelId={PANEL_IDS.hierarchy}
              height={PANEL_CONTENT_HEIGHT}
            />
          )}
        </div>
        <div
          className={style.panel}
          style={{
            height: `${heights[PANEL_IDS.property]}px`,
          }}
        >
          <div
            className={`${style.resizeHandle} ${
              !isCollapsed(heights[PANEL_IDS.property]) &&
              !isCollapsed(heights[PANEL_IDS.hierarchy])
                ? style.allowResize
                : ''
            }`}
            onMouseDown={(e) => onDragStart(e, PANEL_IDS.property)}
          />
          {isShowRightPanel && (
            <PropertyCollapsePanel
              panelId={PANEL_IDS.property}
              height={PANEL_CONTENT_HEIGHT}
            />
          )}
        </div>
      </Collapse>
      {isShowRightPanel && disabledMask}
    </div>
  );
}
