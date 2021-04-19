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
    setUserDetails()
    {
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
  }
}
