import React, { useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import {
  Button,
  ItemId,
  Menu,
  MenuItemOptions,
  Toast,
  TooltipTrigger,
  Trigger,
} from '@box/box-design';
import { IconMore } from '@box/icons/build';

import { hashURL } from 'src/utils/hash-url';
import { copyToClipboard } from 'src/utils/copy2clipboard';

import style from './index.module.scss';

export type CardProps = {
  id: number;
  title: string;
  /**
   * 皮肤预览图url
   */
  coverUrl: string;
  /**
   * 卡片尺寸配置。
   * normal：卡片200px，标题14px(默认)
   * small：卡片116px，标题12px
   * @default 'normal'
   */
  size?: 'normal' | 'small';
  /**
   * 卡片左上角的标签
   */
  label?: string;
  /**
   * 是否允许被选中
   */
  selectable?: boolean;
  /**
   * 是否可以点击复制title。默认不可以
   */
  copyTitle?: boolean;
  /**
   * 是否被选中
   */
  isSelected?: boolean;
  /**
   * 被选中时的样式
   * @default SelectedType.default
   */
  selectedType?: 'default' | 'checkBox';
  /**
   * 点击的回调
   */
  onClick?: (event: React.MouseEvent) => void;
  /**
   * 操作菜单
   */
  actionsMenu?: MenuItemOptions[];
  /**
   * 显示操作按钮的方式；always: 一直显示，hover: hover才显示。默认：always
   */
  showAction?: 'always' | 'hover';
  /**
   * 是否有动画
   */
  animated?: boolean;
  /**
   * 操作菜单的回调
   */
  onMenuItemSelected?: (params: { actionId: ItemId; id: number }) => void;
};

export const ObjectCard = (props: CardProps) => {
  const {
    id,
    title,
    coverUrl,
    size = 'normal',
    label,
    selectable,
    copyTitle,
    isSelected,
    onClick,
    actionsMenu,
    onMenuItemSelected,
    showAction = 'always',
    animated,
    selectedType = 'default',
  } = props;
  const intl = useIntl();
  const [isMenuActive, setIsMenuActive] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState(false);

  const className = useMemo<string>(() => {
    const list = [style.card];
    selectable && list.push(style.selectable);
    switch (selectedType) {
      case 'checkBox':
        isSelected && list.push(style.selectedCheckBox);
        break;
      default:
        isSelected && list.push(style.selectedDefault);
        break;
    }
    switch (size) {
      case 'small':
        list.push(style.smallSize);
        break;
      default:
        list.push(style.normalSize);
        break;
    }
    return list.join(' ');
  }, [isSelected, selectable, selectedType, size]);

  const copy = useCallback(
    (title) => {
      if (copyToClipboard(title)) {
        Toast.success({
          content: intl.formatMessage({ id: 'copySuccess' }),
        });
      } else {
        Toast.error({
          content: intl.formatMessage({ id: 'copyFailed' }),
        });
      }
    },
    [intl],
  );

  const actionMenu = useMemo(() => {
    if (showAction === 'hover' && !(isHovered || isMenuActive)) {
      return;
    }
    if (!actionsMenu) {
      return;
    }
    return (
      <div className={style.actionsMenu}>
        {
          <Trigger
            placement={'bottomRight'}
            align={{ offset: [4, 4] }}
            popupVisible={isMenuActive}
            onPopupBlur={() => {
              setIsMenuActive(false);
            }}
            popup={
              <Menu
                className={style.dropdown}
                items={actionsMenu}
                onItemSelect={(selectId, e) => {
                  e.stopPropagation();
                  onMenuItemSelected &&
                    onMenuItemSelected({
                      actionId: selectId,
                      id,
                    });
                  setIsMenuActive(false);
                }}
              />
            }
          >
            <Button
              type={'icon'}
              size={'custom'}
              icon={<IconMore />}
              onClick={(ev) => {
                ev.stopPropagation();
                setIsMenuActive(true);
              }}
            />
          </Trigger>
        }
      </div>
    );
  }, [
    actionsMenu,
    isMenuActive,
    onMenuItemSelected,
    id,
    isHovered,
    showAction,
  ]);

  return (
    <div
      className={className}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      onBlur={() => {
        setIsHovered(false);
      }}
      onClick={(ev) => {
        if (!selectable) {
          return;
        }
        onClick && onClick(ev);
      }}
    >
      <div
        className={style.previewImg}
        style={{ backgroundImage: `url(${hashURL(coverUrl)})` }}
      />
      {label !== undefined && <div className={style.label}>{label}</div>}
      {isSelected && selectedType === 'checkBox' && (
        <div className={style.checkBox}>
          <div className={style.selectMark} />
        </div>
      )}
      {actionMenu}
      <div className={style.footer}>
        {animated && (
          <TooltipTrigger
            placement={'bottomLeft'}
            text={intl.formatMessage({
              id: 'animation.tooltip',
            })}
          >
            <div className={style.animatedIcon} />
          </TooltipTrigger>
        )}
        <span
          className={style.title}
          onClick={(ev) => {
            if (!copyTitle) {
              return;
            }
            ev.stopPropagation();
            copy(title);
          }}
        >
          {title}
        </span>
      </div>
    </div>
  );
};
