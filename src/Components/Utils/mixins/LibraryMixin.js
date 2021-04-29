import api from "../api/api.vue";

export const LibraryMixin = {
  computed: {
    apiHost() {
      return this.$store.state.backend;
    },
    token() {
      return this.$store.state.auth.authToken.token;
    },
  },
  methods: {
    async loadBasketApplets() {
      const { data: basketApplets } = await api.getBasketContent({
        apiHost: this.apiHost,
        token: this.token
      });

      this.$store.commit('setBasketApplets', basketApplets);
    },
  }
}
