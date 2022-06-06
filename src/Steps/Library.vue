<template>
  <div />
</template>

<style scoped>
.error {
  color: "red";
}
</style>

<script>
import { mapGetters, mapState } from 'vuex';
import { AccountMixin } from '../Components/Utils/mixins/AccountMixin';
import { LibraryMixin } from '../Components/Utils/mixins/LibraryMixin';
import api from '../Components/Utils/api/api.vue';

export default {
  name: "Library",
  mixins: [AccountMixin, LibraryMixin],
  computed: {
    ...mapGetters([
      'isLoggedIn',
    ]),
    ...mapState([
      "currentAppletBuilderData"
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
  async beforeMount() {
    const { from, sync, cache, token } = this.$route.query;
    let fromLibrary = false;
    if (from == 'library') {
      if (token) {
        try {
          const resp = await api.signInWithToken({
            apiHost: this.apiHost,
            token,
          });

          if (resp.data) {
            this.setAuth({
              auth: resp.data
            });
            fromLibrary = true;
          }
        } catch (e) {
          console.log('token error', e.response.data.message);
        }
      } else if (this.isLoggedIn) {
        fromLibrary = true;
      }
    }

    if (fromLibrary) {
      let isEditing = false;
      if (cache == "true") {
        if (
          this.currentApplet &&
          this.currentAppletBuilderData &&
          this.currentAppletBuilderData.protocol &&
          this.currentAppletBuilderData.protocol.appletId == this.currentApplet.id
        ) {
          isEditing = true;
        }

        if (sync == "true") {
          await this.loadBasketApplets();
        } else {
          this.$store.commit('setBasketApplets', {});
        }
      } else {
        this.$store.commit('cacheAppletBuilderData', null);
        const { account: accountId, applet: appletId } = this.$route.query;
        await this.switchAccount(accountId);
        if (appletId) {
          const applet = this.$store.state.currentAccount.applets.find(applet => applet.id == appletId);
          this.$store.commit('setCurrentApplet', applet);
          isEditing = true;
        } else {
          isEditing = false;
        }
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
