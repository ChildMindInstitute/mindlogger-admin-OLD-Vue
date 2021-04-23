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
    currentApplet: {
      get() {
        return this.$store.state.currentAppletMeta;
      },
      set(applet) {
        this.$store.commit('setCurrentApplet', applet);
      }
    }
  },
  async created() {
    const { from, sync, cache, token } = this.$route.query;
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

    if (fromLibrary) {
      let isEditing = false;
      if (cache == "true") {
        if (sync == "true") {
          await this.loadBasketApplets();
        } else {
          this.$store.commit('setBasketApplets', {});
        }
      } else {
        this.$store.commit('cacheAppletBuilderData', null);
        const { account: accountId, applet: appletId } = this.$route.query;
        await this.switchAccount(accountId);
        const applet = state.currentAccount[appletId];
        this.$store.commit('setCurrentApplet', applet);
        isEditing = true;
        await this.loadBasketApplets();
      }
      this.$router.push({
        name: 'Builder',
        params: {
          isEditing,
          isLibrary: true,
        },
      }).catch(err => {
      });
    } else {
      this.$router.push({
        name: 'Dashboard',
      }).catch(err => {
      });
    }
  },
};
</script>
