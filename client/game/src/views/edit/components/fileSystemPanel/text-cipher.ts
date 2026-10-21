import crypto from 'crypto-browserify';

const cipher = 'aes-128-ctr';
const password = '7919'; // the 1000th prime number;

export function encrypt(data: string) {
  const crypter = crypto.createCipher(cipher, password);
  let crypted = crypter.update(data, 'utf8', 'hex');
  crypted += crypter.final('hex');
  return crypted;
}

export function decrypt(data: string) {
  const decipher = crypto.createDecipher(cipher, password);
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
