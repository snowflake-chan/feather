/** HTTP pages can upload/play audio, but browsers prohibit microphone capture. */
export function microphoneUnavailableReason(): string | undefined {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return '当前运行环境不支持录音。';
  }
  if (window.isSecureContext === false) {
    return '浏览器不允许在此 HTTP 地址录音，请使用 HTTPS；音频文件上传和播放不受影响。';
  }
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    return '当前浏览器不支持录音，请使用支持麦克风采集的浏览器。';
  }
  return undefined;
}
