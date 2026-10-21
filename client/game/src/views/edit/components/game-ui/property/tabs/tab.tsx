import {
  MouseEventHandler,
  ReactNode,
  Ref,
  forwardRef,
  memo,
  useCallback,
  useMemo,
} from 'react';
import { PropTabType, TAB_ID_PREFIX } from '../defs';
import styles from './tab.module.scss';

type Props = {
  content: ReactNode;
  tabType?: PropTabType;
  selected?: boolean;
  onSelect?: (tabType: PropTabType) => void;
  onClick?: MouseEventHandler;
};

function PropertyTabView(props: Props, ref?: Ref<HTMLDivElement>) {
  const { tabType, content, onSelect, onClick: propsOnClick, selected } = props;

  const className = useMemo(() => {
    const list = [styles.tab];

    selected && list.push(styles.selected);

    return list.join(' ');
  }, [selected]);

  const onClick = useCallback<MouseEventHandler>(
    (e) => {
      propsOnClick?.(e);

      tabType !== undefined && onSelect?.(tabType);
    },
    [onSelect, propsOnClick, tabType],
  );

  return (
    <div
      ref={ref}
      id={`${TAB_ID_PREFIX}${tabType}`}
      className={className}
      onClick={onClick}
    >
      {content}
    </div>
  );
}

export const PropertyTab = memo(forwardRef(PropertyTabView));
