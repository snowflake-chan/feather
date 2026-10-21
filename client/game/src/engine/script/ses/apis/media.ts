import {
  convertAudioBlob,
  getArrayBufferFromBlob,
  getWavFileInfo,
} from 'src/engine/script/audio-utils';
import { messenger } from 'src/messenger';
import { microphoneUnavailableReason } from './media-support';

export class ClientMedia {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioBlob: Blob | null = null;
  private stream: MediaStream | null = null;
  private audioSource: AudioBufferSourceNode | null = null;
  private audioConfig = { channelCount: 1, sampleRate: 16000, sampleSize: 16 };

  private isStartingRecord = false;
  private isStoppingRecord = false;

  private checkUserMediaSupport() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  private async isAudioCompatible(blob: Blob) {
    try {
      const { sampleRate, channelCount, sampleSize } = await getWavFileInfo(
        blob,
      );
      const audioConfig = this.audioConfig;
      return (
        sampleRate === audioConfig.sampleRate &&
        channelCount === audioConfig.channelCount &&
        sampleSize === audioConfig.sampleSize
      );
    } catch (err) {
      return false;
    }
  }

  // 申请麦克风权限,返回stream
  private async getUserMedia() {
    const unavailable = microphoneUnavailableReason();
    if (unavailable) throw new Error(unavailable);
    //ios和rusty需要先requestUserMedia
    if (messenger.messageTool.isInWebviewOrRusty()) {
      const res = await messenger.callAsync('requestUserMedia', {
        audio: true,
      });
      if (!res) {
        throw new Error('No permission to access microphone.');
      }
    }

    if (!this.checkUserMediaSupport()) {
      throw new Error('Not support UserMedia.');
    }
    return navigator.mediaDevices.getUserMedia({
      audio: this.audioConfig,
    });
  }

  private stopMediaStream() {
    this.stream?.getTracks().forEach((track) => track.stop());
  }

  // 开始录音
  public async startRecording() {
    if (this.isStartingRecord) {
      return;
    }
    this.isStartingRecord = true;

    try {
      // 停止播放
      this.stopPlayAudio();
      // 停止录音
      if (this.mediaRecorder) {
        await this.stopRecording();
      }

      try {
        this.stream = await this.getUserMedia();
      } catch (err) {
        throw err instanceof Error ? err : new Error('浏览器未允许访问麦克风。');
      }

      this.mediaRecorder = new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    } finally {
      this.isStartingRecord = false;
    }
  }
  // 停止录音
  public async stopRecording() {
    if (this.isStoppingRecord) {
      throw new Error('Recording is stopping.');
    }
    this.isStoppingRecord = true;
    try {
      return await new Promise<Blob>((resolve, reject) => {
        if (!this.mediaRecorder) {
          reject('Recording has not started.');
          return;
        }

        this.mediaRecorder.onstop = async () => {
          try {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
            const isCompatible = await this.isAudioCompatible(audioBlob);
            if (isCompatible) {
              this.audioBlob = audioBlob;
            } else {
              this.audioBlob = await convertAudioBlob(audioBlob);
            }

            resolve(this.audioBlob);
          } catch (err) {
            reject('Convert audio blob error');
          }

          this.mediaRecorder = null;
          this.audioChunks = [];
          this.stopMediaStream();
        };

        this.mediaRecorder.stop();
      });
    } finally {
      this.isStoppingRecord = false;
    }
  }

  // 播放录音
  public async playAudio(spec?: { blob?: Blob; gain?: number }) {
    return new Promise<void>(async (res, rej) => {
      this.stopPlayAudio();

      const blob = spec?.blob || this.audioBlob;

      if (!blob) {
        throw new Error('No audio to play. Please recording first.');
      }

      let gainNode: GainNode | null = null;

      const audioContext = new (window.AudioContext ||
        (<any>window).webkitAudioContext)();

      if (spec?.gain !== undefined) {
        gainNode = audioContext.createGain();
        gainNode.gain.value = spec?.gain;
      }

      const arrayBuffer = await getArrayBufferFromBlob(blob);

      audioContext.decodeAudioData(
        arrayBuffer,
        (audioBuffer) => {
          this.audioSource = audioContext.createBufferSource();
          this.audioSource.buffer = audioBuffer;

          if (gainNode) {
            this.audioSource.connect(gainNode);
            gainNode.connect(audioContext.destination);
          } else {
            this.audioSource.connect(audioContext.destination);
          }

          this.audioSource.start(0);
          this.audioSource.onended = () => {
            gainNode?.disconnect();
            this.audioSource?.disconnect();
            this.audioSource = null;
            res();
          };
        },
        (error) => {
          rej(error);
        },
      );
    });
  }
  // 停止播放
  public stopPlayAudio() {
    if (this.audioSource) {
      this.audioSource.stop();
    }
  }

  public destroy() {
    // 停止播放
    this.stopPlayAudio();

    // 停止录音
    if (!this.mediaRecorder) {
      return;
    }
    this.mediaRecorder.stop();
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stopMediaStream();
  }
}
