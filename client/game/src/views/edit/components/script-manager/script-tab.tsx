import { useCallback, useState } from 'react';
import { IconDropDown, IconAdd2, IconDropUp } from '@box/icons';
import { Button } from '@box/box-design';

import style from './index.module.scss';

export const ScriptTab = (props: {
  title: string;
  readOnly?: boolean;
  onAdd?: () => void;
  onToggle: (expand: boolean) => void;
}) => {
  const {
    title,
    readOnly = false,
    onAdd: propsOnAdd,
    onToggle: propsOnToggle,
  } = props;
  const [isExpand, setIsExpand] = useState(true);

  const onAdd = useCallback(
    (ev: React.MouseEvent) => {
      ev.stopPropagation();
      propsOnAdd && propsOnAdd();
    },
    [propsOnAdd],
  );

  const onToggle = useCallback(() => {
    setIsExpand(!isExpand);
    propsOnToggle(!isExpand);
  }, [isExpand, propsOnToggle]);

  return (
    <div
      className={style.scriptTab}
      onClick={onToggle}
      onContextMenu={(evt) => {
        evt.preventDefault();
        evt.stopPropagation();
      }}
    >
      <div className={style.head}>
        {isExpand ? <IconDropDown /> : <IconDropUp />}
        <p>{title}</p>
      </div>
      {!readOnly && propsOnAdd ? (
        <Button
          type={'icon'}
          size={'custom'}
          className={style.addBtn}
          icon={<IconAdd2 />}
          onClick={onAdd}
          // disabled={disabled} // TODO: 脚本数量上限时才禁用
        />
      ) : null}
    </div>
  );
};
