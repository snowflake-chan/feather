// 将audio blob 转换成16khz，16bit，mono
export async function convertAudioBlob(
  blob: Blob,
  sampleRate = 16000,
  numberOfChannels = 1,
): Promise<Blob> {
  // 空的blob直接返回，否则 decodeAudioData 会报错
  if (blob.size === 0) {
    return blob;
  }

  // 创建一个 AudioContext 实例
  const audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();

  const arrayBuffer = await blob.arrayBuffer();

  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const length = Math.floor(audioBuffer.duration * sampleRate);
  const newAudioBuffer = audioContext.createBuffer(
    numberOfChannels,
    length,
    sampleRate,
  );

  // 处理音频数据，将其转换为目标格式
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const oldData = audioBuffer.getChannelData(channel);
    const newData = newAudioBuffer.getChannelData(channel);
    const rate = audioBuffer.sampleRate / sampleRate;

    for (let i = 0; i < newData.length; i++) {
      const oldIndex = i * rate;
      const beforeIndex = Math.floor(oldIndex);
      const afterIndex = Math.min(beforeIndex + 1, oldData.length - 1);
      const weight = oldIndex - beforeIndex;

      // 线性插值
      newData[i] =
        oldData[beforeIndex] * (1 - weight) + oldData[afterIndex] * weight;
    }
  }

  // 将 AudioBuffer 转换为 WAV 格式
  const wavData = audioBufferToWav(newAudioBuffer);

  // 创建 Blob 对象并返回
  return new Blob([wavData], { type: 'audio/wav' });
}

// 辅助函数：将 AudioBuffer 转换为 WAV 格式
function audioBufferToWav(buffer: AudioBuffer): Uint8Array {
  const numOfChan = buffer.numberOfChannels,
    length = buffer.length * numOfChan * 2 + 44,
    view = new DataView(new ArrayBuffer(length)),
    sampleRate = buffer.sampleRate;

  function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  function floatTo16BitPCM(
    output: DataView,
    offset: number,
    input: Float32Array,
  ) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
  }

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, length - 8, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk length
  view.setUint16(20, 1, true); // audio format (1 = PCM)
  view.setUint16(22, numOfChan, true); // number of channels
  view.setUint32(24, sampleRate, true); // sample rate
  view.setUint32(28, sampleRate * 2 * numOfChan, true); // byte rate
  view.setUint16(32, numOfChan * 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, length - 44, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numOfChan; channel++) {
      floatTo16BitPCM(
        view,
        offset,
        buffer.getChannelData(channel).slice(i, i + 1),
      );
      offset += 2;
    }
  }

  return new Uint8Array(view.buffer);
}

/**
 * 获取wav文件的sampleRate，channelCount，sampleSize
 * @param blob
 */
export async function getWavFileInfo(blob: Blob): Promise<{
  sampleRate: number;
  sampleSize: number;
  channelCount: number;
}> {
  const arrayBuffer = await getArrayBufferFromBlob(blob);
  const view = new DataView(arrayBuffer);

  // Verify this is a RIFF file
  const riffHeader = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3),
  );

  if (riffHeader !== 'RIFF') {
    throw new Error('Invalid WAV file: Missing RIFF header');
  }

  // Verify this is a WAVE file
  const waveHeader = String.fromCharCode(
    view.getUint8(8),
    view.getUint8(9),
    view.getUint8(10),
    view.getUint8(11),
  );
  if (waveHeader !== 'WAVE') {
    throw new Error('Invalid WAV file: Missing WAVE header');
  }

  // Read `fmt ` chunk (starts at byte 12)
  const fmtChunkOffset = 12;
  const fmtHeader = String.fromCharCode(
    view.getUint8(fmtChunkOffset),
    view.getUint8(fmtChunkOffset + 1),
    view.getUint8(fmtChunkOffset + 2),
    view.getUint8(fmtChunkOffset + 3),
  );
  if (fmtHeader !== 'fmt ') {
    throw new Error('Invalid WAV file: Missing fmt header');
  }

  // Sample rate (offset 24, 4 bytes, little-endian)
  const sampleRate = view.getUint32(fmtChunkOffset + 12, true);

  // Channel count (offset 22, 2 bytes, little-endian)
  const channelCount = view.getUint16(fmtChunkOffset + 10, true);

  // Sample size (offset 34, 2 bytes, little-endian)
  const sampleSize = view.getUint16(fmtChunkOffset + 22, true);

  return {
    sampleRate,
    channelCount,
    sampleSize,
  };
}

/**
 * 从blob中得到arrayBuffer，blob.arrayBuffer在ios14.5开始支持，所以用FileReader兼容
 * @param blob: Blob
 * @return ArrayBuffer
 */
export async function getArrayBufferFromBlob(blob: Blob): Promise<ArrayBuffer> {
  if (blob.arrayBuffer) {
    return blob.arrayBuffer();
  }

  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(blob);

    reader.onloadend = () => {
      const arrayBuffer = reader.result;
      if (!(arrayBuffer instanceof ArrayBuffer)) {
        rej('except a arrayBuffer');
        return;
      }
      res(arrayBuffer);
    };
  });
}
