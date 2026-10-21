/**
 * @param audioContext AudioContext
 * @param buffer AudioBuffer
 * @param begin time in seconds
 * @param end time in seconds
 */

export function sliceAudioBuffer(
  audioContext: AudioContext,
  buffer: AudioBuffer,
  begin: number,
  end: number,
) {
  const duration = buffer.duration;
  const channels = buffer.numberOfChannels;
  const rate = buffer.sampleRate;

  if (begin < 0) {
    return new RangeError('begin time must be greater than 0');
  }

  if (end > duration) {
    return new RangeError('end time must be less than or equal to ' + duration);
  }

  const startOffset = rate * begin;
  const endOffset = rate * end;
  const frameCount = endOffset - startOffset;
  let newBuffer;

  try {
    newBuffer = audioContext.createBuffer(
      channels,
      endOffset - startOffset,
      rate,
    );
    const anotherArray = new Float32Array(frameCount);
    const offset = 0;

    for (var channel = 0; channel < channels; channel++) {
      buffer.copyFromChannel(anotherArray, channel, startOffset);
      newBuffer.copyToChannel(anotherArray, channel, offset);
    }
  } catch (e) {
    return e;
  }

  return newBuffer;
}
