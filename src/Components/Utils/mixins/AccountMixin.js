import api from "../api/api.vue";

export const AccountMixin = {
  computed: {
    apiHost() {
      return this.$store.state.backend;
    },
    token() {
      return this.$store.state.auth.authToken.token;
    },
  },
  methods: {
    setAuth(authData) {
      this.$store.commit("setAuth", authData);
      this.setAccounts();
      this.setUserDetails();
    },
    setAccounts() {
      api
        .getAccounts({
          apiHost: this.apiHost,
          token: this.token,
        })
        .then((resp) => {
          this.$store.commit("setAccounts", resp.data);
        })
        .catch((err) => {
          console.warn(err);
        });
    },
    setUserDetails() {
      api
        .getUserDetails({
          apiHost: this.apiHost,
          token: this.token,
        })
        .then((resp) => {
          this.$store.commit("setUserDetails", resp.data);
        })
        .catch((err) => {
          console.warn(err);
        });
    },
    async switchAccount(accountId) {
      try {
        const resp = await api.switchAccount({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          accountId,
        });
        this.$store.commit('switchAccount', resp.data.account);
      } catch (err) {
        console.warn(err);
      };
    },
  }
}
