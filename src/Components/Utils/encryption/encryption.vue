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

export default {
    getAppletEncryptionInfo
}
</script>
