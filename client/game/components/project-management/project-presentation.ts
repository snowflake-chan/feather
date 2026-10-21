/** Presentation rules shared by the project list, dialogs, and transfer status. */
export function customMapSizeMessage(dimensions: [number, number, number]) {
  const [width, height, length] = dimensions
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    !Number.isInteger(length) ||
    width < 16 || width > 1024 ||
    height < 16 || height > 128 ||
    length < 16 || length > 1024 ||
    dimensions.some((axis) => axis % 16 !== 0)
  ) {
    return { level: 'error' as const, text: '宽、长为 16–1024，高为 16–128，且均需是 16 的倍数。' }
  }
  const voxels = width * height * length
  if (voxels > 1024 * 128 * 1024) {
    return { level: 'error' as const, text: '地图尺寸超过支持上限。请缩小地图尺寸。' }
  }
  if (voxels > 64 * 1024 * 1024) {
    return { level: 'warning' as const, text: '超大地图：首次创建和打开会很慢，建议使用 16 GB 以上内存。' }
  }
  if (voxels > 16 * 1024 * 1024) {
    return { level: 'warning' as const, text: '此地图较大，加载和编辑会占用更多内存，建议使用 8 GB 以上内存。' }
  }
  return {
    level: 'normal' as const,
    text: `约 ${(voxels / 1024 / 1024).toFixed(voxels >= 1024 * 1024 ? 1 : 2)} M 体素，适合常规本地编辑。`,
  }
}

export function nextReleaseVersion(version?: string) {
  const match = String(version || '').match(/^v(\d+)\.(\d+)\.(\d+)$/)
  if (!match) return 'v1.0.0'
  return `v${match[1]}.${match[2]}.${Number(match[3]) + 1}`
}

export function formatBytes(value: number) {
  if (!value) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const unit = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1)
  return `${(value / 1024 ** unit).toFixed(unit ? 1 : 0)} ${units[unit]}`
}

export function formatProjectUpdatedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '时间未知'
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date)
}
