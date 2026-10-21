import { Download, Play, Upload } from 'lucide-react';

import styles from '../../../pages/projects/projects.module.css';
import { formatBytes } from '../project-presentation';
import type { ExportProgress, ImportProgress, PublishProgress } from '../project-types';

type Props = {
  exportProgress: ExportProgress | null;
  importProgress: ImportProgress | null;
  publishProgress: PublishProgress | null;
  closeExport: () => void;
  closeImport: () => void;
  closePublish: () => void;
};

const terminal = (phase: string) => phase === 'done' || phase === 'error';

export function ProjectProgressDialogs(props: Props) {
  const exported = props.exportProgress;
  const imported = props.importProgress;
  const published = props.publishProgress;
  return (
    <>
      {exported ? (
        <div className={styles.exportBackdrop} role="presentation">
          <section className={styles.exportDialog} role="dialog" aria-modal="true" aria-labelledby="export-title">
            <div className={`${styles.exportIcon} ${exported.phase === 'done' ? styles.exportIconDone : exported.phase === 'error' ? styles.exportIconError : ''}`}><Download size={22} /></div>
            <h2 id="export-title">{exported.phase === 'packing' ? '正在生成工程包' : exported.phase === 'downloading' ? '正在下载工程包' : exported.phase === 'done' ? '导出完成' : '导出失败'}</h2>
            <p className={styles.exportProjectName}>{exported.projectName}</p>
            <div className={styles.exportProgressTrack} aria-label="导出进度"><span style={{ width: `${exported.percent}%` }} /></div>
            <div className={styles.exportProgressMeta}>
              <strong>{Math.round(exported.percent)}%</strong>
              <span>{exported.phase === 'packing'
                ? `正在整理、校验并压缩工程文件 · ${exported.elapsedSeconds}s`
                : exported.phase === 'downloading'
                  ? `${formatBytes(exported.received)} / ${exported.total ? formatBytes(exported.total) : '计算中'} · ${exported.elapsedSeconds}s`
                  : exported.phase === 'done'
                    ? `${exported.filename} · ${formatBytes(exported.total)}`
                    : exported.message}</span>
            </div>
            {terminal(exported.phase) ? <button className={styles.exportCloseButton} type="button" onClick={props.closeExport}>{exported.phase === 'done' ? '完成' : '关闭'}</button> : null}
          </section>
        </div>
      ) : null}
      {imported ? (
        <div className={styles.exportBackdrop} role="presentation">
          <section className={styles.exportDialog} role="dialog" aria-modal="true" aria-labelledby="import-title">
            <div className={`${styles.exportIcon} ${imported.phase === 'done' ? styles.exportIconDone : imported.phase === 'error' ? styles.exportIconError : ''}`}><Upload size={22} /></div>
            <h2 id="import-title">{imported.phase === 'uploading' ? '正在上传工程包' : imported.phase === 'processing' ? '正在导入工程' : imported.phase === 'done' ? '导入完成' : '导入失败'}</h2>
            <p className={styles.exportProjectName}>{imported.projectName || imported.filename}</p>
            <div className={styles.exportProgressTrack} aria-label="导入进度"><span style={{ width: `${imported.percent}%` }} /></div>
            <div className={styles.exportProgressMeta}>
              <strong>{Math.round(imported.percent)}%</strong>
              <span>{imported.phase === 'uploading'
                ? `${formatBytes(imported.sent)} / ${formatBytes(imported.total)} · ${imported.elapsedSeconds}s`
                : imported.phase === 'processing'
                  ? `正在解压、校验并写入本地工程 · ${imported.elapsedSeconds}s`
                  : imported.phase === 'done'
                    ? `${formatBytes(imported.total)} · 用时 ${imported.elapsedSeconds}s`
                    : imported.message}</span>
            </div>
            {imported.details?.length ? (
              <div className={styles.importDiagnostics} role="log" aria-label="导入检查详情">
                <div className={styles.importDiagnosticsHeader}>
                  <strong>检查详情</strong>
                  <span>{imported.details.filter((detail) => detail.level === 'error').length} 个错误 · {imported.details.filter((detail) => detail.level === 'warning').length} 个提醒</span>
                </div>
                <ul>{imported.details.map((detail, index) => (
                  <li key={`${detail.level}-${detail.code || 'detail'}-${index}`} data-level={detail.level}>
                    <span>{detail.level === 'error' ? '错误' : '提醒'}</span>
                    <p>{detail.message}</p>
                    {detail.code ? <code>{detail.code}</code> : null}
                  </li>
                ))}</ul>
              </div>
            ) : null}
            {terminal(imported.phase) ? <button className={styles.exportCloseButton} type="button" onClick={props.closeImport}>{imported.phase === 'done' ? '完成' : '关闭'}</button> : null}
          </section>
        </div>
      ) : null}
      {published ? (
        <div className={styles.exportBackdrop} role="presentation">
          <section className={styles.exportDialog} role="dialog" aria-modal="true" aria-labelledby="publish-progress-title">
            <div className={`${styles.exportIcon} ${published.phase === 'done' ? styles.exportIconDone : published.phase === 'error' ? styles.exportIconError : ''}`}><Play size={22} fill={published.phase === 'done' ? 'currentColor' : 'none'} /></div>
            <h2 id="publish-progress-title">{published.phase === 'saving'
              ? '正在保存工程'
              : published.phase === 'publishing'
                ? '正在创建整组只读版本'
                : published.phase === 'packing'
                  ? '正在生成地图组游玩包'
                  : published.phase === 'downloading'
                    ? '正在下载地图组游玩包'
                    : published.phase === 'done' ? '地图组游玩包导出完成' : '地图组游玩包导出失败'}</h2>
            <p className={styles.exportProjectName}>{published.projectName} · {published.version}</p>
            <div className={styles.exportProgressTrack} aria-label="游玩包导出进度"><span style={{ width: `${published.percent}%` }} /></div>
            <div className={styles.exportProgressMeta}>
              <strong>{Math.round(published.percent)}%</strong>
              <span>{published.phase === 'saving'
                ? `正在同步编辑器中的最新修改 · ${published.elapsedSeconds}s`
                : published.phase === 'publishing'
                  ? `正在为主地图和全部副地图生成不可变快照 · ${published.elapsedSeconds}s`
                  : published.phase === 'packing'
                    ? `正在收集运行资源并压缩 · ${published.elapsedSeconds}s`
                    : published.phase === 'downloading'
                      ? `${formatBytes(published.received)} / ${published.total ? formatBytes(published.total) : '计算中'} · ${published.elapsedSeconds}s`
                      : published.phase === 'done'
                        ? `${published.filename} · ${formatBytes(published.total)}`
                        : published.message}</span>
            </div>
            {terminal(published.phase) ? <button className={styles.exportCloseButton} type="button" onClick={props.closePublish}>{published.phase === 'done' ? '完成' : '关闭'}</button> : null}
          </section>
        </div>
      ) : null}
    </>
  );
}
