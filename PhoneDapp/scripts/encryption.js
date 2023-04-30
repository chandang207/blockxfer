const crypto = require('crypto');

function encrypt(plainText, keyHex) {
    const key = Buffer.from(keyHex, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const enc = cipher.update(plainText, 'utf8', 'hex') + cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return iv.toString('hex') + ':' + authTag + ':' + enc;
}

function decrypt(cipherText, keyHex) {
    const key = Buffer.from(keyHex, 'hex');
    const parts = cipherText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const enc = parts[2];
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv).setAuthTag(authTag);
    return decipher.update(enc, 'hex', 'utf8') + decipher.final('utf8');
}

const plainText = '+919176029790';
const keyHex = '76a268962eb3c051250de7739a6d381599a5f5176b4928eb34ff7e4d57b72244';

const encrypted = encrypt(plainText, keyHex);
//console.log('Encrypted:', encrypted);

const decrypted = decrypt(encrypted, keyHex);
//console.log('Decrypted:', decrypted);

/*
function generateRandomHexKey(length) {
    return crypto.randomBytes(length).toString('hex');
}

const keyLength = 32; // 32 bytes (256 bits)
const keyHexS = generateRandomHexKey(keyLength);
console.log('Random key (hex):', keyHexS);
*/


module.exports = {encrypt, decrypt};