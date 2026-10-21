import SelectedIcon from 'src/assets/img-select.svg';
import { LeftNavModeEnum, CenterPanelEnum } from '../../../defs';
import styles from './index.module.scss';

export type NavItemType = {
  id: LeftNavModeEnum | CenterPanelEnum;
  title: string;
  isActive?: boolean;
  activeStyle?: string;
  hasSelectedStyle?: boolean;
  handleClickItem: () => void;
};

type NavModeProps = {
  contentList: NavItemType[];
};

export const NavMode = (props: NavModeProps) => {
  const { contentList } = props;
  return (
    <div className={styles.navMode}>
      {contentList.map((item) => (
        <div
          className={`${styles.navItem} ${
            item.isActive && styles.selectedItem
          }`}
          onClick={item.handleClickItem}
          key={item.id}
        >
          <div
            className={`${styles.navItemContent} ${
              item.isActive && styles.navItemActive
            }`}
          >
            <div className={styles.divider} />
            <div className={styles.titleItem}>{item.title}</div>
          </div>
          {item.hasSelectedStyle && <SelectedIcon />}
        </div>
      ))}
    </div>
  );
};
