import style from './index.module.css';
import * as React from 'react';

type ArenaBgProps = {
  progress?: number;
  message?: string;
  error?: boolean;
  actions?: React.ReactNode;
};

export const ArenaBg = ({ progress, message, error = false, actions }: ArenaBgProps = {}) => {
  const normalizedProgress = typeof progress === 'number'
    ? Math.min(100, Math.max(0, progress))
    : undefined;

  return (
    <div className={style.loading} aria-live="polite">
      <div className={`${style.loadingWrapper} ${error ? style.loadingError : ''}`}>
        <div className={style['loading-arena']}></div>
        <div className={style.progressBar}>
          <div
            className={normalizedProgress === undefined ? style.progressIndeterminate : style.progress}
            style={normalizedProgress === undefined ? undefined : { width: `${normalizedProgress}%` }}
          />
        </div>
        {message && (
          <p className={style.loadingMessage} title={message}>
            {message}
            {normalizedProgress !== undefined && !error ? ` · ${Math.round(normalizedProgress)}%` : ''}
          </p>
        )}
        {actions && <div className={style.loadingActions}>{actions}</div>}
      </div>
    </div>
  );
};
