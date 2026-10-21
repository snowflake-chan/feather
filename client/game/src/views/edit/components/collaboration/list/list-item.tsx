import { hashURL } from 'src/utils/hash-url';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { IconDrag } from '@box/icons';
import { RootState } from 'src/redux/edit';
import { userInfoType, InnerRoles } from '../index';
import style from '../index.module.scss';
import type { JSX } from 'react';

export type ListItemProps = {
  hasDot?: boolean;
  canDrag?: boolean;
  customProps?: React.HTMLAttributes<HTMLDivElement>;
  operation?: JSX.Element;
  highLight?: 'top' | 'bottom';
  className?: string;
} & userInfoType;
const maxTagsLength = 4;

const styles = {
  top: style.highLightTop,
  bottom: style.highLightBottom,
};

export const ListItem = (props: ListItemProps) => {
  const intl = useIntl();
  const user = useSelector((state: RootState) => state.user.id.toString());

  const { userId, avatarHash, name, operation, roles } = props;
  return (
    <div
      className={`${style.listItem} ${props.canDrag && style.drag} ${
        props.highLight && styles[props.highLight]
      } ${props.className}`}
      {...props.customProps}
    >
      {props.canDrag ? (
        <IconDrag className={`${style.basicBtn} ${style.dragIcon}`} />
      ) : (
        <div className={style.basicBtn}></div>
      )}
      <div
        className={style.avatar}
        style={
          avatarHash ? { backgroundImage: `url(${hashURL(avatarHash)})` } : {}
        }
      ></div>
      <div className={style.userDetail}>
        <span className={style.name}>
          {!name ? 'User ' + userId : name}
          {props.hasDot && <i className={style.dot}></i>}
        </span>
        {roles && roles.length > 0 && (
          <div className={style.tags}>
            {userId === user && (
              <span className={`${style.tag} ${style.me}`}>
                {intl.formatMessage({ id: 'me' })}
              </span>
            )}
            {roles.map((role: string, index) => {
              return (
                index < maxTagsLength && (
                  <span key={role} className={style.tag}>
                    {InnerRoles[role] ? intl.formatMessage({ id: role }) : role}
                  </span>
                )
              );
            })}
            {roles.length > maxTagsLength && (
              <span className={`${style.tag} ${style.num}`}>
                +{roles.length - maxTagsLength}
              </span>
            )}
          </div>
        )}
      </div>
      <div className={style.operationWrapper}>{operation}</div>
    </div>
  );
};
