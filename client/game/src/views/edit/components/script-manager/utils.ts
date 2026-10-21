import { editor } from 'src/client/edit/edit-client';

export const INDEX_FILE_NAME = {
  Server: 'index.js',
  Client: 'clientIndex.js',
};
export const transformName = (key: string, keepExtension: boolean) => {
  const path = key.split('/');
  if (keepExtension) {
    return path[path.length - 1];
  } else {
    const tempArr = path[path.length - 1].split('.');
    tempArr.pop();
    return tempArr.join('.');
  }
};

export const isInvalidFileName = (name: string) => {
  return /['<>:"/\\|?*`']/.test(name);
};

export const checkIndexFile = (name: string) => {
  return [INDEX_FILE_NAME.Client, INDEX_FILE_NAME.Server].includes(name);
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 确保fileDict里有fileId这个文件
 * 如果没有则每100ms确认一次，5s超时
 * @param fileId
 * @param startTime
 */
export const ensureFileInFileList = async (
  fileId: string,
  startTime?: number,
) => {
  if (!startTime) {
    startTime = Date.now();
  }
  if (Date.now() - startTime > 5000) {
    return false;
  }
  if (editor.codeEditorController.isFileExist(fileId)) {
    return true;
  } else {
    await sleep(100);
    return await ensureFileInFileList(fileId, startTime);
  }
};
