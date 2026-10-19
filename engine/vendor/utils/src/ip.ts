import http from 'http';

export function getRealIP(req: http.IncomingMessage, trustProxy = false) {
  if (trustProxy) {
    const forwardedIP = req.headers['x-forwarded-for'];
    const firstForwardedIP = Array.isArray(forwardedIP)
      ? forwardedIP[0]
      : forwardedIP?.split(',')[0];
    if (firstForwardedIP?.trim()) {
      return firstForwardedIP.trim();
    }
    const realIP = req.headers['x-real-ip'];
    if (typeof realIP === 'string' && realIP.trim()) {
      return realIP.trim();
    }
  }
  return req.socket.remoteAddress;
}
