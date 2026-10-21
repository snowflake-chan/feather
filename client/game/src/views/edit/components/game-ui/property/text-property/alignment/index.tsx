import { memo, useMemo } from 'react';
import {
  TextXAlignType,
  TextYAlignType,
} from '@box/schema/project/ui-rda/defs';
import styles from './style.module.scss';
import {
  IconAlignBottom,
  IconAlignCenter,
  IconAlignLeft,
  IconAlignMiddle,
  IconAlignRight,
  IconAlignTop,
} from '@box/icons';

export type OnAlignmentChange = (
  spec:
    | { axis: 'x'; alignment: TextXAlignType }
    | { axis: 'y'; alignment: TextYAlignType },
) => void;

type Props = {
  x?: TextXAlignType;
  y?: TextYAlignType;
  onChange: OnAlignmentChange;
};

const Y_LIST = [
  {
    id: TextYAlignType.Top,
    icon: <IconAlignTop />,
  },
  {
    id: TextYAlignType.Center,
    icon: <IconAlignMiddle />,
  },
  {
    id: TextYAlignType.Bottom,
    icon: <IconAlignBottom />,
  },
];

const X_LIST = [
  {
    id: TextXAlignType.Left,
    icon: <IconAlignLeft />,
  },
  {
    id: TextXAlignType.Center,
    icon: <IconAlignCenter />,
  },
  {
    id: TextXAlignType.Right,
    icon: <IconAlignRight />,
  },
];

function TextAlignmentsView(props: Props) {
  const { x, y, onChange } = props;

  const xChildren = useMemo(
    () =>
      X_LIST.map(({ id, icon }) => (
        <div
          key={id}
          className={x === id ? styles.selected : undefined}
          onClick={() => {
            onChange({ axis: 'x', alignment: id });
          }}
        >
          {icon}
        </div>
      )),
    [x, onChange],
  );

  const yChildren = useMemo(
    () =>
      Y_LIST.map(({ id, icon }) => (
        <div
          key={id}
          className={y === id ? styles.selected : undefined}
          onClick={() => {
            onChange({ axis: 'y', alignment: id });
          }}
        >
          {icon}
        </div>
      )),
    [y, onChange],
  );

  return (
    <div className={styles.alignments}>
      <div className={styles.sub}>{yChildren}</div>
      <div className={styles.sub}>{xChildren}</div>
    </div>
  );
}

export const TextAlignments = memo(TextAlignmentsView);
