import type { Dispatch, SetStateAction } from 'react';

import styles from '../../../pages/projects/projects.module.css';
import type { AssetDistributionConfiguration } from '../project-types';

type Props = {
  configuration: AssetDistributionConfiguration;
  saving: boolean;
  submitting: boolean;
  setConfiguration: Dispatch<SetStateAction<AssetDistributionConfiguration>>;
  save: () => Promise<void>;
};

export function AssetDistributionFields(props: Props) {
  const update = (changes: Partial<AssetDistributionConfiguration>) =>
    props.setConfiguration((value) => ({ ...value, ...changes }));
  const config = props.configuration;
  return (
    <div className={styles.assetConfigFields}>
      <small className={styles.fieldHint}>凭证只保存到本机 Creator，不会写进游玩包或发送给服主。</small>
      <div className={styles.fieldGroup}>
        <label htmlFor="asset-cdn">资源公开地址</label>
        <input id="asset-cdn" value={config.cdnBaseUrl} placeholder="https://cdn.example.com" onChange={(event) => update({ cdnBaseUrl: event.target.value })} />
      </div>
      <div className={styles.fieldGroup}>
        <label htmlFor="asset-endpoint">S3 Endpoint</label>
        <input id="asset-endpoint" value={config.endpoint} placeholder="https://s3.example.com" onChange={(event) => update({ endpoint: event.target.value })} />
      </div>
      <div className={styles.assetConfigGrid}>
        <div className={styles.fieldGroup}>
          <label htmlFor="asset-bucket">Bucket</label>
          <input id="asset-bucket" value={config.bucket} onChange={(event) => update({ bucket: event.target.value })} />
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="asset-region">Region</label>
          <input id="asset-region" value={config.region} placeholder="auto" onChange={(event) => update({ region: event.target.value })} />
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <label htmlFor="asset-key">Access Key</label>
        <input id="asset-key" value={config.accessKeyId} onChange={(event) => update({ accessKeyId: event.target.value })} />
      </div>
      <div className={styles.fieldGroup}>
        <label htmlFor="asset-secret">Secret Key</label>
        <input id="asset-secret" type="password" autoComplete="new-password" placeholder={config.hasSecretAccessKey ? '留空则沿用已保存的密钥' : ''} value={config.secretAccessKey} onChange={(event) => update({ secretAccessKey: event.target.value })} />
      </div>
      <div className={styles.assetConfigActions}>
        <small>保存配置不会上传资源；只有“开始导出”才会上传本次游戏包需要的缺失资源。</small>
        <button type="button" className={styles.assetConfigSaveButton} disabled={props.saving || props.submitting} onClick={() => void props.save()}>
          {props.saving ? '正在保存…' : '保存配置'}
        </button>
      </div>
    </div>
  );
}
