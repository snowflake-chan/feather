import React, { useMemo } from 'react';
import {
  IconCloudFile,
  IconCloudFileFill,
  IconCode2,
  IconJavascript,
  IconLoading,
} from '@box/icons';
import { clientConfig } from 'src/config/client';
import style from './index.module.scss';

export const ScriptIcon = React.memo(
  (props: {
    isIndex: boolean;
    isShare: boolean;
    lockedMapTitle: string;
    isUploading: boolean;
  }) => {
    const { isIndex, isShare, lockedMapTitle, isUploading } = props;
    const { name: currMapTitle } = clientConfig.mapInfo;
    const icon = useMemo(() => {
      if (isUploading) {
        return <IconLoading />;
      }
      if (isIndex) {
        return <IconJavascript />;
      }
      if (isShare) {
        if (!lockedMapTitle) {
          return <IconCloudFile />;
        } else {
          return <IconCloudFileFill />;
        }
      }
      return <IconCode2 />;
    }, [isIndex, isShare, isUploading, lockedMapTitle]);

    const className = useMemo(() => {
      const list = [style.scriptIcon];
      if (lockedMapTitle === currMapTitle) {
        list.push(style.currMapLocked);
      } else if (lockedMapTitle) {
        list.push(style.otherMapLocked);
      }
      if (isUploading) {
        list.push(style.uploading);
      }
      return list.join(' ');
    }, [currMapTitle, isUploading, lockedMapTitle]);

    return <div className={className}>{icon}</div>;
  },
);
