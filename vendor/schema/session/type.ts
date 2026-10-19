import { GameSessionData, UserDetail } from './schema';

export interface GameSessionInterface {
  bindUserSession(
    userDetail: UserDetail,
    ipAddress: string,
    sessionId: string,
    url: string,
    fingerPrint: string,
    region: string,
    deviceHash?: string,
  ): Promise<GameSessionData>;
  getSessionData(sessionId: string): Promise<GameSessionData | undefined>;
}
