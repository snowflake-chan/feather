import { Button } from '@box/box-design';
import { IconArrowBack } from '@box/icons';

import style from '../index.module.scss';

type HeaderProps = {
  back: () => void;
  name: string;
  num: number;
};

export const BackHeader = (props: HeaderProps) => {
  return (
    <div className={style.header}>
      <div className={`${style.title}`}>
        <Button
          className={`${style.basicBtn} ${style.btn}`}
          type={'icon'}
          size={'custom'}
          icon={<IconArrowBack className={style.icon} />}
          onClick={props.back}
        />
        <div className={style.roleName}>{props.name}</div>
        <div className={style.num}>({props.num})</div>
      </div>
    </div>
  );
};
