import React, { ReactNode, useContext, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { FileDictSchema } from '@box/schema/code-editor/code-editor-common-state';

import { CodeEditorStateContext } from '../script-container/hooks';
import { checkIndexFile } from '../script-manager/utils';
import { ScriptIcon } from '../script-manager/script-icon';
import { clientConfig } from 'src/config/client';

import style from './index.module.scss';

export const ScriptHeader = React.memo(() => {
  const intl = useIntl();
  const { codeEditorState } = useContext(CodeEditorStateContext);
  const { combType, name: currMapTitle } = clientConfig.mapInfo;

  const selectedFile = useMemo(() => {
    return (
      codeEditorState.fileDict[codeEditorState.selectedFileId] ||
      FileDictSchema.identity
    );
  }, [codeEditorState.fileDict, codeEditorState.selectedFileId]);

  const icon = useMemo(() => {
    const { name, isShare, isUploading, lockedMapTitle } = selectedFile;
    const isIndex = checkIndexFile(name);
    return (
      <ScriptIcon
        isIndex={isIndex}
        isShare={isShare}
        lockedMapTitle={lockedMapTitle}
        isUploading={isUploading}
      />
    );
  }, [selectedFile]);

  const fileState = useMemo(() => {
    // 非扩展地图无需展示脚本锁状态
    if (!combType) {
      return;
    }
    const { isShare, isUploading, lockedMapTitle } = selectedFile;
    const list = [style.right];
    let tips: ReactNode;
    if (isShare) {
      if (currMapTitle === lockedMapTitle) {
        // 本图持有锁
        tips = intl.formatMessage({ id: 'fileLockedByCurrMap' });
      } else if (lockedMapTitle) {
        // 他图持有锁
        tips = (
          <>
            {intl.formatMessage({ id: 'fileLockedByOtherMapPrefix' })}
            <p className={style.mapName}>{lockedMapTitle}</p>
            {intl.formatMessage({ id: 'fileLockedByOtherMapSuffix' })}
          </>
        );
        list.push(style.lockedByOther);
      }
    } else if (isUploading) {
      // 非共享脚本 默认情况下无需展示锁状态, 如果正在开启共享，则需要展示“上传中”
      tips = intl.formatMessage({ id: 'fileUploading' });
    }
    return <div className={list.join(' ')}>{tips}</div>;
  }, [combType, currMapTitle, intl, selectedFile]);

  return (
    <div className={style.headerWrapper}>
      <div className={style.header}>
        <div className={style.left}>
          <div className={style.icon}>{icon}</div>
          <p>{selectedFile.name}</p>
        </div>
        {fileState}
      </div>
    </div>
  );
});
