export enum DeviceType {
  Desktop = 'Desktop',
  Mobile = 'Mobile',
}

export type DeviceInfo = {
  deviceType: DeviceType;
  screen: {
    width: number;
    height: number;
  };
};

export class ClientNavigator {
  /**
   * @ignore
   * @param getDeviceInfo
   * @param userAgent
   */
  constructor(
    public getDeviceInfo: () => {
      deviceType: DeviceType;
      screen: { width: number; height: number };
    },

    public userAgent: string,
    public language: string,
  ) {}
}

export declare const navigator: ClientNavigator;
