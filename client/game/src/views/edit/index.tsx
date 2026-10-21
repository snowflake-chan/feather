import React, { useState } from 'react';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Provider, useDispatch } from 'react-redux';

import { setHtmlFont } from 'src/utils/mobile';
import { resolve_intl } from 'src/utils/i18n';
import { MainPage } from './container';
import { store } from 'src/redux/edit';
import { setUserInfo } from 'src/redux/slices/user';
import { messenger } from 'src/messenger';
import { LangType } from 'src/apis/createra';
import { UserState } from 'src/utils/user';
import { EditClient } from 'src/client/edit/edit-client';
import { EditProvider } from 'src/client/edit/edit-context';
import style from './index.module.scss';

type EditUiProps = {
  removeLoading: () => void;
  setLocale: (locale: LangType) => void;
  userInfo: UserState | null;
};

const EditUi = (props: EditUiProps) => {
  const dispatch = useDispatch();
  const intl = useIntl();

  // editor
  const [editor, setEditor] = useState<EditClient>();
  useEffect(() => {
    // 初始化iframe和editor
    messenger.connect().then(() => {
      setEditor(new EditClient());
      messenger.emitEvent('status', 'ready');
    });
  }, []);

  setHtmlFont();

  // 依赖于服务端提供的locale更新intl对象
  useEffect(() => {
    resolve_intl(intl);
  }, [intl.locale]);

  // 用户信息
  useEffect(() => {
    const userInfo = props.userInfo;
    if (userInfo) {
      dispatch(setUserInfo(userInfo));
    }
  }, [props.userInfo]);

  return editor ? (
    <EditProvider value={editor}>
      <MainPage
        setLocale={props.setLocale}
        removeLoading={props.removeLoading}
      />
    </EditProvider>
  ) : (
    <></>
  );
};

export default (props: EditUiProps) => {
  return (
    <div className={style.editWrapper}>
      <Provider store={store}>
        <EditUi
          userInfo={props.userInfo}
          removeLoading={props.removeLoading}
          setLocale={props.setLocale}
        />
      </Provider>
    </div>
  );
};
