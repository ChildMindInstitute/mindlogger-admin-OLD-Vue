import api from "@/Components/Utils/api/api.vue";

export const AppletLibraryMixin = { 
  computed: {
    apiHost() {
      return this.$store.state.backend;
    },
    token() {
      return this.$store.state.auth.authToken.token;
    },
  },
  methods: {
    checkAppletNameInLibrary(applet) {
      return api.checkAppletNameInLibrary(this.apiHost, this.token, applet)
        .then(resp => {
          return resp.data;
        })
    },
    changeAppletName(applet, appletName) {
      return api.changeAppletName(this.apiHost, this.token, applet.id, appletName)
        .then(resp => {
          return resp.data;
        })
    },
    getLibraryCategories() {
      return api.getLibraryCategories(this.apiHost, this.token)
        .then(resp => {
          return resp.data;
        })
    },
    publishAppletToLibrary(appletId, publish) {
      return api.publishAppletToLibrary(this.apiHost, this.token, appletId, publish)
        .then(resp => {
          return resp.data;
        })
    },
    updateAppletSearchTerms(appletId, category, subCategory, keywords) {
      return api.updateAppletSearchTerms(this.apiHost, this.token, appletId, {
        category,
        subCategory,
        keywords
      })
        .then(resp => {
          return resp.data;
        })
    },
  }
}
