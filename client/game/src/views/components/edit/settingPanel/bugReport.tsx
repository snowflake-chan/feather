import React, { useState } from 'react';
import { intlMessage } from 'src/utils/i18n';
import { Input } from '../input';
import { notice } from '../../common/notice';
import { Modal } from '../modal';
import { isMobile, isTablet } from 'src/utils/mobile';
import { ContentResolver } from '@box/content-server/content-fetch';

type BugReportProps = {
  bugReportSubject: string;
  bugReportDetail: string;
  screenshots: File[];
  screenshotUrls: string[];
  isSubmitting: boolean;
  setBugReportSubject: (value) => void;
  setBugReportDetail: (value) => void;
  setScreenShots: (value) => void;
  setScreenshotUrls: (value) => void;
};

import style from './index.module.css';

const _isOnlyMobile = () => {
  return isMobile() && !isTablet();
};

/**
 * @deprecated
 */
export function BugReport(props: BugReportProps) {
  const _handleUploadImg = (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (!ev.target.files) {
      ev.target.value = '';
      return;
    }
    const file = ev.target.files[0];
    if (!file) {
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      // should smaller than 2MB
      notice.error({
        title: intlMessage('uploadFailed'),
        detail: intlMessage('fileTooLarge') + ' 2MB',
      });
      return;
    }
    const newScreenshots: File[] = [...props.screenshots];
    const newScreenshotUrls: string[] = [...props.screenshotUrls];
    const url = window.URL.createObjectURL(file);
    newScreenshots.push(file);
    newScreenshotUrls.push(url);
    props.setScreenShots(newScreenshots);
    props.setScreenshotUrls(newScreenshotUrls);
    ev.target.value = '';
  };

  const _removeScreenshot = (index: number) => {
    const newScreenshots = [...props.screenshots];
    const newScreenshotUrls: string[] = [...props.screenshotUrls];
    newScreenshots.splice(index, 1);
    newScreenshotUrls.splice(index, 1);
    props.setScreenShots(newScreenshots);
    props.setScreenshotUrls(newScreenshotUrls);
  };

  return (
    <div className={style.bugReportWrapper}>
      <div className={style.bugReportItem}>
        <div className={style.bugReportTitle}>{intlMessage('subject')}</div>
        <Input
          immediatelyChange
          value={props.bugReportSubject}
          onChange={(text) => props.setBugReportSubject(text)}
          maxBytes={60}
        />
      </div>
      <div className={style.bugReportItem}>
        <div className={style.bugReportTitle}>{intlMessage('description')}</div>
        <Input
          className={style.textareaContainer}
          value={props.bugReportDetail}
          onChange={(text) => props.setBugReportDetail(text)}
          textarea
          maxBytes={600}
        />
      </div>
      <div className={style.bugReportItem}>
        <div className={style.bugReportTitle}>{intlMessage('screenshot')}</div>
        <div className={style.screenshotPreviewWrapper}>
          {props.screenshotUrls.map((url, index) => {
            return (
              <div key={url} className={style.screenshotPreview}>
                <img className={style.screenshotImg} src={url} />
                <div
                  className={style.deleteScreenshotIcon}
                  onClick={() => _removeScreenshot(index)}
                >
                  x
                </div>
              </div>
            );
          })}
          {props.screenshotUrls.length < 3 && (
            <div className={style.screenshotAddContainer}>
              <input
                type="file"
                accept=".jpeg, .png, .jpg"
                onChange={_handleUploadImg}
              />
              <div className={style.screenIcon}></div>
            </div>
          )}
        </div>
      </div>
      {props.isSubmitting ? <div className={style.bugReportCover}></div> : null}
    </div>
  );
}
