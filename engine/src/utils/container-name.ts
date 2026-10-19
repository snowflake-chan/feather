/**
 * 从容器名中解析出哈希
 * @param containerName 从环境变量中获取到的容器名
 */
export function getHashFromContainerName(containerName: string) {
  return containerName.replace(
    /^(?:(?:development|staging|preprod)-)?(?:edit|play)-(.*)-\d$/,
    '$1',
  );
}
