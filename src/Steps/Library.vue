<template>
  <div />
</template>

<style scoped>
.error {
  color: "red";
}
</style>

<script>
import { mapGetters } from 'vuex';
import { AccountMixin } from '../Components/Utils/mixins/AccountMixin';

export default {
  name: "Library",
  mixins: [AccountMixin],
  computed: {
    ...mapGetters([
      'isLoggedIn',
    ]),
  },
  async created() {
    let nextUrl = "/dashboard";
    if (this.$route.query.from == 'library' && this.$route.query.token) {
      if (isLoggedIn) {
        nextUrl = "/build";
      } else {
        const { token } = to.query;
        if (token) {
          try {
            const resp = await api.getUserDetails({
              apiHost: this.$store.state.backend,
              token,
            })
            if (resp.data) {
              this.setAuth({
                auth: {
                  authToken: {
                    token
                  }
                }
              });
              this.$store.commit("setFromBuilder", true);
              nextUrl = "/build";
            }
          } catch (e) {
            console.log('token error', e.response.data.message)
          }
        }
      }
    }
    this.$router.push(nextUrl).catch(err => {});
  },
};
</script>
