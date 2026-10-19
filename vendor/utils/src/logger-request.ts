import * as http from 'http';
import { getRealIP } from './ip';

export function requestToLog(req: http.IncomingMessage, uuid: string) {
  let ip = '';
  try {
    ip = getRealIP(req) || '';
  } catch (e) {}
  return {
    uuid: uuid,
    httpVersion: req.httpVersion,
    method: req.method,
    rawHeaders: req.rawHeaders || [],
    url: req.url || '',
    ip,
  };
}
