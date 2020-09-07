<script>
import crypto from 'crypto'
import config from '../../../config'

const primeLength = 1024;
const base = [2];

const getPrivateKey = ({ appletPassword, accountId }) => {
    const key1 = crypto.createHash('sha512').update(appletPassword).digest();
    const key2 = crypto.createHash('sha512').update(accountId).digest();

    return key1 + key2;
}

const getAppletEncryptionInfo = ({ appletPassword, accountId, prime, baseNumber }) => {
    const key = crypto.createDiffieHellman(
        Buffer.from(prime ? prime : config.primes[Math.floor(Math.random() * 10)]),
        Buffer.from(baseNumber ? baseNumber : base)
    );

    key.setPrivateKey(getPrivateKey({
        appletPassword,
        accountId
    }));
    key.generateKeys();

    return key;
}

const getAESKey = ( appletPrivateKey, userPublicKey, appletPrime, base ) => {
    const key = crypto.createDiffieHellman(Buffer.from(appletPrime), Buffer.from(base));
    key.setPrivateKey(Buffer.from(appletPrivateKey));

    const secretKey = key.computeSecret(Buffer.from(userPublicKey));

    return crypto.createHash('sha256').update(secretKey).digest();
}

/** decrypt */
const decryptData = ({ text, key }) => {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}


export default {
    getAppletEncryptionInfo,
    getAESKey,
    decryptData
}
</script>
