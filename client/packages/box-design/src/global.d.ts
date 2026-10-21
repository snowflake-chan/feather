declare module '*.scss';
declare module '*.svg';

interface Navigator {
  /**
   * Only available in secure context (https)
   * see: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgentData
   */
  userAgentData?: {
    platform: string;
  };
}
