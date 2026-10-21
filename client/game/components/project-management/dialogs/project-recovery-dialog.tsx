import { History, RotateCcw } from 'lucide-react';

import styles from '../../../pages/projects/projects.module.css';
import { snapshotReasonLabels } from '../project-fixtures';
import { formatBytes } from '../project-presentation';
import type { LocalProject, ProjectSnapshot } from '../project-types';

type Props = {
  project: LocalProject | null;
  snapshots: ProjectSnapshot[];
  selectedSnapshot: string;
  loading: boolean;
  error: string;
  close: () => void;
  select: (name: string) => void;
  restore: () => void;
};

export function ProjectRecoveryDialog(props: Props) {
  if (!props.project) return null;
  return (
    <div className={styles.dialogBackdrop} role="presentation" onMouseDown={() => { if (!props.loading) props.close(); }}>
      <section className={`${styles.dialog} ${styles.recoveryDialog}`} role="dialog" aria-modal="true" aria-labelledby="recovery-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className={styles.dialogIcon}><History size={22} /></div>
        <h2 id="recovery-title">恢复历史版本</h2>
        <p>{props.project.name} · 最多保留最近 5 个有效快照。恢复前会保留当前版本。</p>
        {props.loading && !props.snapshots.length ? <div className={styles.recoveryEmpty}>正在读取恢复记录…</div> : props.snapshots.length ? (
          <div className={styles.snapshotList} role="radiogroup" aria-label="可恢复版本">
            {props.snapshots.map((snapshot) => (
              <button key={snapshot.name} type="button" role="radio" aria-checked={props.selectedSnapshot === snapshot.name} className={props.selectedSnapshot === snapshot.name ? styles.snapshotSelected : undefined} onClick={() => props.select(snapshot.name)}>
                <span><strong>{snapshotReasonLabels[snapshot.reason] || snapshot.reason}</strong><small>{new Date(snapshot.createdAt).toLocaleString()} · {formatBytes(snapshot.size)}</small></span>
                <code>{snapshot.signature.slice(0, 8)}</code>
              </button>
            ))}
          </div>
        ) : !props.error ? <div className={styles.recoveryEmpty}>该工程还没有可恢复的历史版本。打开、导出或发布后会自动生成快照。</div> : null}
        {props.error ? <p className={styles.dialogError} role="alert">{props.error}</p> : null}
        <div className={styles.dialogActions}>
          <button type="button" className={styles.cancelButton} disabled={props.loading} onClick={props.close}>取消</button>
          <button type="button" className={styles.confirmButton} disabled={!props.selectedSnapshot || props.loading} onClick={props.restore}><RotateCcw size={15} /> {props.loading ? '正在恢复…' : '恢复所选版本'}</button>
        </div>
      </section>
    </div>
  );
}
