import api from "../api/api.vue";
import { version } from "../../../../package.json";

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

export const getVersion = () => {
  return version;
}
