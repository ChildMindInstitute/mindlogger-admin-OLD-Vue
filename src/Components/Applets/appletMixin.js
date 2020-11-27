import api from "../Utils/api/api.vue";

export const AppletMixin = { 
  computed: {
    currentAppletMeta() {
      return this.$store.state.currentAppletMeta;
    },
    currentAppletData() { 
      return this.$store.state.currentAppletData;
    },
    apiHost() {
      return this.$store.state.backend;
    },
    token() {
      return this.$store.state.auth.authToken.token;
    },
  },
  methods: {
    loadApplet(appletId) {
      return api.getApplet({
        apiHost: this.apiHost,
        token: this.token,
        allEvent: this.currentAppletMeta.roles.includes('coordinator') || this.currentAppletMeta.roles.includes('manager'),
        id: appletId
      }).then(resp => {
        if (this.currentAppletData && this.currentAppletData.applet.encryption) {
          resp.data.applet.encryption = this.currentAppletData.applet.encryption;
        }

        this.$store.commit("updateAppletData", resp.data);

        return resp.data;
      })
    },
    isLatestApplet(appletMeta) {
      const applet = this.$store.state.allApplets[appletMeta.id];

      return applet && applet.updated === appletMeta.updated;
    }
  }
}
