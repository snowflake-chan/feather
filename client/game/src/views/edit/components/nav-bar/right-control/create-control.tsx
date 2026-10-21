import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import { IconListLeft } from '@box/icons';
import { TooltipTrigger } from '@box/box-design';

import { RootState } from 'src/redux/edit';
import { setIsShowRightPanel } from 'src/redux/edit/creator';
import { RightNavCtrlEnum } from 'src/views/edit/defs';
import { NavCtrlItemType } from '.';

import styles from './index.module.scss';

export const CreateControl = React.memo(() => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const hasPermission = useSelector(
    (state: RootState) => state.permission.editModel,
    // && state.permission.editUi
  );
  const isShowRightPanel = useSelector(
    (state: RootState) => state.creator.isShowRightPanel,
  );
  /**
   * 判断是否展示
   */
  const filterItems = useMemo(() => {
    const navItems: NavCtrlItemType[] = [
      {
        id: RightNavCtrlEnum.RightPanel,
        icon: <IconListLeft />,
        tooltip: intl.formatMessage({ id: 'rightPanel' }),
        isActive: isShowRightPanel,
        handleClickItem: () => {
          dispatch(setIsShowRightPanel(!isShowRightPanel));
        },
      },
    ];

    return navItems.filter((item) => {
      // 还没有UI新功能时，如果没有模型的编辑权限就不展示右侧面板
      if (item.id === RightNavCtrlEnum.RightPanel) {
        return hasPermission;
      }
      return true;
    });
  }, [intl, isShowRightPanel, dispatch, hasPermission]);

  return filterItems.length !== 0 ? (
    <div className={styles.navControl}>
      {filterItems.map((item, index) => {
        return (
          <div
            className={styles.navItem}
            onClick={item.handleClickItem}
            key={index}
          >
            <TooltipTrigger
              text={item.tooltip}
              placement="bottom"
              align={{ offset: [0, 4] }}
            >
              <div
                className={`${styles.navItemContent} ${
                  item.isActive && styles.navItemActive
                }`}
              >
                {item.icon}
              </div>
            </TooltipTrigger>
          </div>
        );
      })}
      <div className={styles.divider} />
    </div>
  ) : null;
});
