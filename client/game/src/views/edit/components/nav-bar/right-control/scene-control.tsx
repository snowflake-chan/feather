import { useEffect } from 'react';
import { clientConfig } from 'src/config/client';
import { useEdit } from 'src/client/edit/edit-context';
import { connectCreatorScene } from './scene-connection';

function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error('截图编码失败'));
    reader.onload = () => {
      const result = String(reader.result || '');
      const separator = result.indexOf(',');
      if (separator < 0) return reject(new Error('截图编码失败'));
      resolve(result.slice(separator + 1));
    };
    reader.readAsDataURL(blob);
  });
}

export const SceneControl = () => {
  const editor = useEdit();
  const projectId = clientConfig.mapInfo.permanentMapId;
  useEffect(() => {
    if (!projectId) return;
    return connectCreatorScene(projectId, async action => {
      const blob = action.view === '3d' ? await editor.captureScreenshot() :
        action.view === '2d' ? await editor.captureUiScreenshot() : await editor.capturePlayerScreenshot();
      if (!blob) throw new Error('当前场景尚未准备好，无法截图');
      return toBase64(blob);
    });
  }, [editor, projectId]);

  return null;
};
