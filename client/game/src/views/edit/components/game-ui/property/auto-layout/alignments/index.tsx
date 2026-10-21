import { memo, useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
  AutoLayoutHorizontalAlignType,
  AutoLayoutVerticalAlignType,
} from '@box/schema/project/ui-rda/defs';
import { TooltipTrigger } from '@box/box-design';
import {
  IconLayoutAlignTopLeft,
  IconLayoutAlignTopCenter,
  IconLayoutAlignTopRight,
  IconLayoutAlignCenterLeft,
  IconLayoutAlignCenter,
  IconLayoutAlignCenterRight,
  IconLayoutAlignBottomLeft,
  IconLayoutAlignBottomRight,
  IconLayoutAlignBottomCenter,
  IconLayoutDefault,
} from '@box/icons';
import type {
  HorizontalAlignmentConfig,
  VerticalAlignmentConfig,
} from '../../util';
import styles from './style.module.scss';

export type AlignmentsProps = {
  horizontal: HorizontalAlignmentConfig;
  vertical: VerticalAlignmentConfig;
  onChange: (
    horizontal: AutoLayoutHorizontalAlignType,
    vertical: AutoLayoutVerticalAlignType,
  ) => void;
};

const ID_SYMBOL = '-';
function generateId(
  horizontal: AutoLayoutHorizontalAlignType,
  vertical: AutoLayoutVerticalAlignType,
) {
  return `${horizontal}${ID_SYMBOL}${vertical}`;
}

function splitId(id: string): [number, number] {
  const [a, b] = id.split(ID_SYMBOL);

  return [parseInt(a), parseInt(b)];
}

function AutoLayoutAlignmentsView(props: AlignmentsProps) {
  const { horizontal, vertical, onChange } = props;

  const intl = useIntl();

  const activeId = useMemo(() => {
    if (horizontal.mixed || vertical.mixed) {
      return;
    }

    return generateId(horizontal.value, vertical.value);
  }, [horizontal, vertical]);

  const items = useMemo(
    () => [
      {
        id: generateId(
          AutoLayoutHorizontalAlignType.Left,
          AutoLayoutVerticalAlignType.Top,
        ),
        tips: intl.formatMessage({ id: 'gameUIPropAlignTopLeft' }),
        icon: <IconLayoutAlignTopLeft />,
      },
      {
        id: generateId(
          AutoLayoutHorizontalAlignType.Center,
          AutoLayoutVerticalAlignType.Top,
        ),
        tips: intl.formatMessage({ id: 'gameUIPropAlignTopCenter' }),
        icon: <IconLayoutAlignTopCenter />,
      },
      {
        id: generateId(
          AutoLayoutHorizontalAlignType.Right,
          AutoLayoutVerticalAlignType.Top,
        ),
        tips: intl.formatMessage({ id: 'gameUIPropAlignTopRight' }),
        icon: <IconLayoutAlignTopRight />,
      },
      {
        id: generateId(
          AutoLayoutHorizontalAlignType.Left,
          AutoLayoutVerticalAlignType.Center,
        ),
        tips: intl.formatMessage({ id: 'gameUIPropAlignCenterLeft' }),
        icon: <IconLayoutAlignCenterLeft />,
      },
      {
        id: generateId(
          AutoLayoutHorizontalAlignType.Center,
          AutoLayoutVerticalAlignType.Center,
        ),
        tips: intl.formatMessage({ id: 'gameUIPropAlignCenterCenter' }),
        icon: <IconLayoutAlignCenter />,
      },
      {
        id: generateId(
          AutoLayoutHorizontalAlignType.Right,
          AutoLayoutVerticalAlignType.Center,
        ),
        tips: intl.formatMessage({ id: 'gameUIPropAlignCenterRight' }),
        icon: <IconLayoutAlignCenterRight />,
      },
      {
        id: generateId(
          AutoLayoutHorizontalAlignType.Left,
          AutoLayoutVerticalAlignType.Bottom,
        ),
        tips: intl.formatMessage({ id: 'gameUIPropAlignBottomLeft' }),
        icon: <IconLayoutAlignBottomLeft />,
      },
      {
        id: generateId(
          AutoLayoutHorizontalAlignType.Center,
          AutoLayoutVerticalAlignType.Bottom,
        ),
        tips: intl.formatMessage({ id: 'gameUIPropAlignBottomCenter' }),
        icon: <IconLayoutAlignBottomCenter />,
      },
      {
        id: generateId(
          AutoLayoutHorizontalAlignType.Right,
          AutoLayoutVerticalAlignType.Bottom,
        ),
        tips: intl.formatMessage({ id: 'gameUIPropAlignBottomRight' }),
        icon: <IconLayoutAlignBottomRight />,
      },
    ],
    [intl],
  );

  const cells = useMemo(
    () =>
      items.map(({ id, tips, icon }) => {
        const classNames = [styles.cell];

        let defaultIcon = <IconLayoutDefault className={styles.default} />;

        if (id === activeId) {
          classNames.push(styles.active);
        }

        return (
          <TooltipTrigger
            key={id}
            className={styles.tooltip}
            text={tips}
            placement="top"
            delay={0}
          >
            <div
              className={classNames.join(' ')}
              onClick={() => {
                const [horizontal, vertical] = splitId(id);
                onChange(
                  horizontal as AutoLayoutHorizontalAlignType,
                  vertical as AutoLayoutVerticalAlignType,
                );
              }}
            >
              {defaultIcon}
              {icon}
            </div>
          </TooltipTrigger>
        );
      }),
    [items, activeId, onChange],
  );

  return (
    <div className={styles.alignments}>
      <div className={styles.title}>
        {intl.formatMessage({ id: 'gameUIpropAlignments' })}
      </div>
      <div className={styles.grid}>{cells}</div>
    </div>
  );
}

export const AutoLayoutAlignments = memo(AutoLayoutAlignmentsView);
