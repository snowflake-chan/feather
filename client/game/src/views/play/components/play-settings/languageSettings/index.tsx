import * as React from 'react';
import { useIntl } from 'react-intl';

import { RadioBtn } from '../../basic/radioBtn';

import style from './index.module.css';
import { RootState } from 'src/redux/play';
import { LangType, setUserLanguage } from 'src/apis/createra';
import { useSelector } from 'react-redux';
import { setCookies } from 'src/utils/cookie';
import { createExpires } from 'src/utils/date';

type Props = {
  setLocale: (locale: LangType) => void;
};

export function LanguageSettings(props: Props) {
  const userId = useSelector((state: RootState) => state.user.id);
  const intl = useIntl();

  const changeLanguage = async (lang: LangType) => {
    if (userId) {
      // 已登陆用户:后端-修改用户语言环境
      await setUserLanguage(lang);
    } else {
      // 游客:本地-修改cookie
      setCookies('locale', lang, { expires: createExpires(1) });
    }
    props.setLocale(lang);
  };
  return (
    <>
      <div className={style.radioContainer}>
        <RadioBtn
          checked={intl.locale === 'en'}
          onChange={() => changeLanguage('en')}
          text={'English'}
        />
      </div>
      <div className={style.radioContainer}>
        <RadioBtn
          checked={intl.locale === 'zh'}
          onChange={() => changeLanguage('zh')}
          text={'简体中文'}
        />
      </div>
    </>
  );
}
