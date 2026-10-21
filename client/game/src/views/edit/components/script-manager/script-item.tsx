import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconMore } from '@box/icons';
import { Button } from '@box/box-design';
import { FileState } from '@box/schema/code-editor/code-editor-common-state';

import { RootState } from 'src/redux/edit';
import { setScriptMenuInfo } from 'src/redux/edit/script-manager';
import { checkIndexFile } from './utils';
import { ScriptIcon } from './script-icon';
import { CodeEditorStateContext } from '../script-container/hooks';

import style from './index.module.scss';

export const ScriptItem = (props: {
  fileInfo: FileState;
  onSelect: (fileId: string) => void;
  onBeforeSelect: (fileId: string) => void;
  readOnly: boolean;
}) => {
  const {
    fileInfo: { name: fileName, isShare, isUploading, lockedMapTitle, fileId },
    onSelect,
    onBeforeSelect,
    readOnly,
  } = props;
  const dispatch = useDispatch();
  const [moreBtnHover, setMoreBtnHover] = useState(false);
  const [moreBtnActive, setMoreBtnActive] = useState(false);
  const { codeEditorState } = useContext(CodeEditorStateContext);

  const { scriptMenuInfo } = useSelector(
    (state: RootState) => state.scriptManager,
  );

  const currMenuShow = useMemo(() => {
    return scriptMenuInfo && fileId === scriptMenuInfo.menuScriptId;
  }, [scriptMenuInfo, fileId]);

  const onPointerDown = useCallback(() => {
    onBeforeSelect(fileId);
  }, [fileId, onBeforeSelect]);

  const onClick = useCallback(() => {
    // 单击时应选中当前脚本
    onSelect(fileId);
  }, [fileId, onSelect]);

  const onContextMenu = useCallback(
    (evt: React.MouseEvent) => {
      evt.stopPropagation();
      evt.preventDefault();

      // 右键时应选中当前脚本
      onSelect(fileId);
      dispatch(
        setScriptMenuInfo({
          menuPos: [evt.clientX, evt.clientY],
          menuScriptId: fileId,
        }),
      );

      // 经右键唤起菜单时：more按钮失活
      setMoreBtnActive(false);
    },
    [dispatch, fileId, onSelect],
  );

  const onClickMoreBtn = useCallback(
    (evt: React.MouseEvent) => {
      evt.stopPropagation();
      // 仅 more按钮 可通过单击唤起菜单
      dispatch(
        setScriptMenuInfo({
          menuPos: [evt.clientX, evt.clientY],
          menuScriptId: fileId,
        }),
      );
      // 经more按钮唤起菜单时：激活more按钮
      setMoreBtnActive(true);
    },
    [dispatch, fileId],
  );

  const prefixIcon = useMemo(() => {
    const isIndex = checkIndexFile(fileName);
    return (
      <ScriptIcon
        isIndex={isIndex}
        isShare={isShare}
        lockedMapTitle={lockedMapTitle}
        isUploading={isUploading}
      />
    );
  }, [fileName, isShare, isUploading, lockedMapTitle]);

  const className = useMemo(() => {
    const list = [style.scriptItem];

    if (codeEditorState.selectedFileId === fileId) {
      list.push(style.selected);
    }
    if (currMenuShow) {
      list.push(style.hoverStyle);
    }
    return list.join(' ');
  }, [codeEditorState.selectedFileId, fileId, currMenuShow]);

  const btnClassName = useMemo(() => {
    const isSafari = 'ontouchstart' in document;
    const list = [style.moreBtn];
    if (
      !readOnly &&
      (moreBtnHover || (currMenuShow && moreBtnActive) || isSafari)
    ) {
      list.push(style.visible);
    }
    return list.join(' ');
  }, [currMenuShow, moreBtnActive, moreBtnHover, readOnly]);

  return (
    <div
      className={className}
      onPointerEnter={() => setMoreBtnHover(true)}
      onPointerLeave={() => setMoreBtnHover(false)}
      onContextMenu={onContextMenu}
      onPointerDown={onPointerDown}
      onClick={onClick}
      id={`script-item-${fileId}`}
    >
      <div className={style.head}>
        {prefixIcon}
        <p>{fileName}</p>
        {
          <Button
            type={'icon'}
            size={'custom'}
            icon={<IconMore />}
            className={btnClassName}
            activated={currMenuShow && moreBtnActive}
            onPointerDown={(evt) => evt.stopPropagation()}
            onClick={onClickMoreBtn}
            onContextMenu={(evt) => {
              evt.preventDefault();
              evt.stopPropagation();
            }}
          />
        }
      </div>
    </div>
  );
};
