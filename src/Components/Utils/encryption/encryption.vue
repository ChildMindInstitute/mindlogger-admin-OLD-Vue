<script>
import crypto from 'crypto'
import config from '../../../config'

const primeLength = 1024;
const hash = crypto.createHash('sha512');
const base = 2;

const getPrivateKey = ({ appletPassword, accountId }) => {
    const key1 = hash.update(appletPassword).digest();
    const key2 = hash.update(accountId).digest();

    return key1 + key2;
}

const getAppletEncryptionInfo = ({ appletPassword, accountId }) => {
    const key = crypto.createDiffieHellman(Buffer.from(config.primes[Math.floor(Math.random() * 10)]));

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
