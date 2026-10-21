export interface ClientMedia {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob>;
  /**
   * @param spec.blob 音频blob
   * @param spec.gain 音频增益量，同gainNode.gain.value
   */
  playAudio: (spec?: { blob?: Blob; gain?: number }) => Promise<void>;
  stopPlayAudio: () => void;
}

export declare const media: ClientMedia;
