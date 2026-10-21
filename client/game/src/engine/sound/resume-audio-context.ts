const silentAudio =
  'data:audio/mp3;base64,//MkxAAHiAICWABElBeKPL/RANb2w+yiT1g/gTok//lP/W/l3h8QO/OCdCqCW2Cw//MkxAQHkAIWUAhEmAQXWUOFW2dxPu//9mr60ElY5sseQ+xxesmHKtZr7bsqqX2L//MkxAgFwAYiQAhEAC2hq22d3///9FTV6tA36JdgBJoOGgc+7qvqej5Zu7/7uI9l//MkxBQHAAYi8AhEAO193vt9KGOq+6qcT7hhfN5FTInmwk8RkqKImTM55pRQHQSq//MkxBsGkgoIAABHhTACIJLf99nVI///yuW1uBqWfEu7CgNPWGpUadBmZ////4sL//MkxCMHMAH9iABEmAsKioqKigsLCwtVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVV//MkxCkECAUYCAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

/**
 * Start the audio context if it's not already
 * must be called from a click event
 */
export async function resumeAudioContext(audioContext: AudioContext) {
  if (audioContext.state !== 'suspended') {
    return;
  }

  const resume = audioContext.resume();

  try {
    await canPlayAudio(audioContext);
  } catch (err) {
    console.log('did not start audio');
  }

  return resume;
}

/**
 * 检测是否能够播放音频
 * - audioContext.resume()检测不出“用户未与页面交互无法播放音频”。此时resume()不会reject，而是挂起。
 * - 无document环境无法检测，也无需检测（大概），直接resolve
 * - 详见：https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide#the_play_method
 */
export async function canPlayAudio(audioContext: AudioContext) {
  /**
   * - document不存在无法检测，也不用抛错
   * - context.state已经在运行中也没有问题
   */
  if (typeof document === 'undefined' || audioContext.state === 'running') {
    return;
  }

  const audioElement = document.createElement('audio');
  audioElement.controls = false;
  audioElement.preload = 'auto';
  audioElement.loop = false;
  audioElement.src = silentAudio;

  return audioElement.play();
}
