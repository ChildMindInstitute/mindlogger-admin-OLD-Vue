import encryption from "../encryption/encryption";
import { AppletMixin } from "./AppletMixin";

export const CaseMixin = {
  mixins: [AppletMixin],
  computed: {
    accountApplets () {
      return this.$store.state.currentAccount.applets;
    },

    currentAccount() {
      return this.$store.state.currentAccount;
    },

    currentCase () {
      return this.$store.state.currentCase || {};
    },

    entries () {
      return this.currentCase.entries || [];
    },

    linkedUsers () {
      return this.currentCase.users || [];
    },
  },

  methods: {
    setAppletPrivateKey (appletId, appletPassword) {
      const applet = this.accountApplets.find(applet => applet.id === appletId);

      const preprocess = this.isLatestApplet(applet) ? Promise.resolve() : this.loadApplet(appletId);

      return preprocess.then(() => {
        const encryptionInfo = encryption.getAppletEncryptionInfo({
          appletPassword,
          accountId: this.currentAccount.accountId,
          prime: applet.encryption.appletPrime,
          baseNumber: applet.encryption.base,
        });

        if (
          encryptionInfo
            .getPublicKey()
            .equals(Buffer.from(applet.encryption.appletPublicKey))
        ) {
          this.$store.commit('setAppletPrivateKey', {
            appletId,
            key: Array.from(encryptionInfo.getPrivateKey()),
          });
        }
      })
    },
  }
}
