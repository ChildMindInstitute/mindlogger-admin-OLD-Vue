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
import { LibraryMixin } from '../Components/Utils/mixins/LibraryMixin';

export default {
  name: "Library",
  mixins: [AccountMixin, LibraryMixin],
  computed: {
    ...mapGetters([
      'isLoggedIn',
    ]),
  },
  async created() {
    const { from, sync, token } = this.$route.query;
    let fromLibrary = false;
    if (from == 'library') {
      if (this.isLoggedIn) {
        fromLibrary = true;
      } else if (token) {
        try {
          const resp = await api.getUserDetails({
            apiHost: this.$store.state.backend,
            token,
          });
          if (resp.data) {
            this.setAuth({
              auth: {
                authToken: {
                  token
                }
              }
            });
            fromLibrary = true;
          }
        } catch (e) {
          console.log('token error', e.response.data.message);
        }
      }
    }
    this.$store.commit("setFromLibrary", fromLibrary);
    const doSync = sync == "true";
    this.$store.commit("setSync", doSync);
    if (fromLibrary) {
      if (doSync) {
        await this.loadBasketApplets();
      } else {
        this.$store.commit('setBasketApplets', []);
      }
    }
    const nextUrl = fromLibrary ? "/build" : "/dashboard";
    this.$router.push(nextUrl).catch(err => {});
  },
};
</script>
