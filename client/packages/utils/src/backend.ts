import http from 'http';

export function bodyParse(
  req: http.IncomingMessage,
  maxSizeBytes = 1000 * 1000,
): Promise<{ [name: string]: any }> {
  return new Promise<{ [name: string]: any }>((resolve, reject) => {
    let nBytesReceived = 0;
    let data = '';
    req.on('data', (chunk) => {
      nBytesReceived += chunk.length;
      if (nBytesReceived > maxSizeBytes) {
        reject(new Error(`Body size too big. Max bytes: ${maxSizeBytes}`));
        return;
      }
      data += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', (err) => {
      reject(err);
    });
  });
}
