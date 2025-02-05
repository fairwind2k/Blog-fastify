// import crypto from 'crypto';
import CryptoJS from 'crypto-js';

// export default (text) => {
//   const hash = crypto.createHmac('sha512', 'salt');
//   hash.update(text);
//   return hash.digest('hex');
// };

const key = 'secret phrase';

export const encrypt = (password) => CryptoJS.AES.encrypt(password, key).toString();

export const decrypt = (hash) => CryptoJS.AES.decrypt(hash, key).toString(CryptoJS.enc.Utf8);