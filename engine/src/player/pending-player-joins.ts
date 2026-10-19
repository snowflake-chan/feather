export class PendingPlayerJoins {
  private readonly sessions = new Set<string>();

  request(sessionId: string, connectionReady: boolean) {
    if (connectionReady) return true;
    this.sessions.add(sessionId);
    return false;
  }

  connectionReady(sessionId: string) {
    return this.sessions.delete(sessionId);
  }

  disconnect(sessionId: string) {
    this.sessions.delete(sessionId);
  }
}
