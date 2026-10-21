import React, {
  ReactNode,
  useState,
  useMemo,
  useCallback,
  type JSX,
} from 'react';
import { IconCancel } from '@box/icons';
import { IconArrowBack } from '@box/icons';

import style from './index.module.scss';

export type Panel = {
  id: number;
  title: string;
  icon: ReactNode;
  content: JSX.Element;
  titleSuffix?: ReactNode;
  secondaryContent?: JSX.Element;
};

type MenuModalProps = {
  modalTitle: string;
  panelList: Panel[];
  onClose: () => void;
  showSecondary?: boolean;
  onToggleSecondary?: (show: boolean) => void;
};

/**
 * 复杂业务弹窗 - 带左侧菜单列表的弹窗
 */
export const MenuModal = (props: MenuModalProps) => {
  const {
    modalTitle,
    panelList,
    onClose,
    showSecondary: optionShowSecondary,
    onToggleSecondary,
  } = props;

  // 当前打开的面板的Id
  const [currentId, setCurrentId] = useState<number>(0);
  /** 当前打开的面板的配置信息 */
  const currentPanel = useMemo(() => {
    return panelList.find((panel) => panel.id === currentId);
  }, [currentId, panelList]);

  const [showSecondary, setShowSecondary] = useState(false);

  const currShowSecondary = useMemo(() => {
    return optionShowSecondary !== undefined
      ? optionShowSecondary
      : showSecondary;
  }, [optionShowSecondary, showSecondary]);

  const handleToggleSecondary = useCallback(
    (show: boolean) => {
      setShowSecondary(show);
      onToggleSecondary?.(show);
    },
    [onToggleSecondary],
  );

  const secondary = useMemo(() => {
    if (!currentPanel?.secondaryContent || !currShowSecondary) {
      return;
    }
    return (
      <div className={style.page}>
        {currentPanel.secondaryContent}
        <div
          className={style.back}
          onClick={() => handleToggleSecondary(false)}
        >
          <IconArrowBack />
        </div>
      </div>
    );
  }, [currShowSecondary, currentPanel, handleToggleSecondary]);

  const mainPage = useMemo(() => {
    return (
      <div className={`${style.page} ${currShowSecondary ? style.hide : ''}`}>
        <div className={style.tabList}>
          <div className={style.modalTitle}>{modalTitle}</div>
          <div className={style.list}>
            {panelList.map((panel) => {
              return (
                <div
                  className={`${style.item} ${
                    currentId === panel.id ? style.selected : ''
                  }`}
                  key={panel.id}
                  onClick={() => {
                    setCurrentId(panel.id);
                  }}
                >
                  {panel.icon}
                  <span className={style.tabTitle}>{panel.title}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className={style.panel}>
          <div className={style.header}>
            <div className={style.left}>
              <div className={style.title}>{currentPanel?.title}</div>
              {currentPanel?.titleSuffix}
            </div>
            <IconCancel onClick={onClose} />
          </div>
          {panelList.map((panel) => {
            return (
              <div
                className={`${style.content} ${
                  currentId === panel.id ? '' : style.hide
                }`}
                key={panel.id}
              >
                {panel.content}
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [
    currentId,
    currentPanel,
    modalTitle,
    onClose,
    panelList,
    currShowSecondary,
  ]);

  return (
    <div className={style.wrapper}>
      <div className={style.container}>
        {secondary}
        {mainPage}
      </div>
    </div>
  );
};
