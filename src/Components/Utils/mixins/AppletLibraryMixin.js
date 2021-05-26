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
    checkAppletNameInLibrary(appletId, appletName) {
      return api.checkAppletNameInLibrary(this.apiHost, this.token, appletId, appletName)
        .then(resp => {
          return resp.data;
        })
    },
    changeAppletName(appletId, appletName) {
      return api.changeAppletName(this.apiHost, this.token, appletId, appletName)
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
    updateAppletSearchTerms(appletId, searchTerms) {
      return api.updateAppletSearchTerms(this.apiHost, this.token, appletId, searchTerms)
        .then(resp => {
          return resp.data;
        })
    },
    getAppletSearchTerms(appletId) {
      return api.getAppletSearchTerms(this.apiHost, this.token, appletId)
        .then(resp => {
          return resp.data;
        })
    },
    getAppletLibraryUrl(appletId) {
      return api.getAppletLibraryUrl(this.apiHost, this.token, appletId)
        .then(resp => {
          return resp.data;
        })
    },
  }
}
