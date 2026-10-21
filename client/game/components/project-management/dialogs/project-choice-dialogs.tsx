import { Download, Grid2X2, Play, Upload } from 'lucide-react';

import styles from '../../../pages/projects/projects.module.css';
import type { ImportMode, LocalProject, ProjectExportScope } from '../project-types';

type ImportChoiceProps = {
  file: File | null;
  mode: ImportMode;
  targetMainId: string;
  mainProjects: LocalProject[];
  close: () => void;
  setMode: (mode: ImportMode) => void;
  setTargetMainId: (id: string) => void;
  confirm: () => void;
};

export function ProjectImportChoiceDialog(props: ImportChoiceProps) {
  if (!props.file) return null;
  return (
    <div className={styles.dialogBackdrop} role="presentation" onMouseDown={props.close}>
      <section className={`${styles.dialog} ${styles.importChoiceDialog}`} role="dialog" aria-modal="true" aria-labelledby="import-choice-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className={styles.dialogIcon}><Upload size={22} /></div>
        <h2 id="import-choice-title">选择工程归属</h2>
        <p className={styles.importFilename}>{props.file.name}</p>
        <div className={styles.importModeList} role="radiogroup" aria-label="工程导入方式">
          <button type="button" role="radio" aria-checked={props.mode === 'independent'} className={props.mode === 'independent' ? styles.importModeSelected : undefined} onClick={() => props.setMode('independent')}>
            <span className={styles.importModeRadio} aria-hidden="true" />
            <span><strong>作为独立地图组</strong><small>导入工程包中的全部地图，并完整保留原来的主地图和副地图关系。</small></span>
          </button>
          <button type="button" role="radio" aria-checked={props.mode === 'submap'} aria-disabled={!props.mainProjects.length} disabled={!props.mainProjects.length} className={props.mode === 'submap' ? styles.importModeSelected : undefined} onClick={() => props.setMode('submap')}>
            <span className={styles.importModeRadio} aria-hidden="true" />
            <span><strong>成为现有地图的副地图</strong><small>导入当初点击导出的那张地图，并使用目标地图组的共享资源库。</small></span>
          </button>
        </div>
        {props.mode === 'submap' ? (
          <label className={styles.importTargetLabel} htmlFor="import-target-main">
            所属主地图
            <select id="import-target-main" value={props.targetMainId} onChange={(event) => props.setTargetMainId(event.target.value)}>
              {props.mainProjects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
          </label>
        ) : null}
        {!props.mainProjects.length ? <p className={styles.importHint}>当前还没有可接收副地图的主地图，请先作为独立地图组导入。</p> : null}
        <div className={styles.dialogActions}>
          <button type="button" className={styles.cancelButton} onClick={props.close}>取消</button>
          <button type="button" className={styles.confirmButton} disabled={props.mode === 'submap' && !props.targetMainId} onClick={props.confirm}>开始导入</button>
        </div>
      </section>
    </div>
  );
}

type ExportChoiceProps = {
  project: LocalProject | null;
  close: () => void;
  exportProject: (project: LocalProject, scope: ProjectExportScope) => void;
  publishProject: (project: LocalProject) => void;
};

export function ProjectExportChoiceDialog(props: ExportChoiceProps) {
  if (!props.project) return null;
  const project = props.project;
  return (
    <div className={styles.dialogBackdrop} role="presentation" onMouseDown={props.close}>
      <section className={`${styles.dialog} ${styles.importChoiceDialog}`} role="dialog" aria-modal="true" aria-labelledby="export-choice-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className={styles.dialogIcon}><Download size={22} /></div>
        <h2 id="export-choice-title">导出</h2>
        <p className={styles.importFilename}>{project.name}</p>
        <div className={`${styles.importModeList} ${styles.exportChoiceList}`}>
          <button type="button" onClick={() => props.exportProject(project, 'map')}><Download size={18} aria-hidden="true" /><span><strong>导出本地图工程</strong><small>只包含当前地图，导出为可重新导入创作端的 .boxproject 文件。</small></span></button>
          {project.mapRole === 'main' ? (
            <>
              <button type="button" onClick={() => props.exportProject(project, 'group')}><Grid2X2 size={18} aria-hidden="true" /><span><strong>导出地图组工程</strong><small>包含主地图、全部副地图及地图组共享资源，导出为一个 .boxproject 文件。</small></span></button>
              <button type="button" onClick={() => props.publishProject(project)}><Play size={18} aria-hidden="true" /><span><strong>导出游戏包</strong><small>生成供游玩端导入的 .boxplay 文件，包含主地图和全部副地图。</small></span></button>
            </>
          ) : null}
        </div>
        <div className={styles.dialogActions}><button type="button" className={styles.cancelButton} onClick={props.close}>取消</button></div>
      </section>
    </div>
  );
}
