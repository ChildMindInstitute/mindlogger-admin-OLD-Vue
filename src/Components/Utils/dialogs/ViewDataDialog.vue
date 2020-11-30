<template>
  <v-dialog
    :value="value"
    max-width="500px"
    @input="$emit('input', $event)"
  >
    <v-card class="pa-4">
      <div class="title">
        {{ $t('viewData') }}
      </div>

      <div class="sub-title"> {{ $t('selectAppletToViewData') }} </div>

      <v-card-text>
        <v-btn
          v-for="profile in profileList"
          :key="profile.appletId"
          class="view-btn"
          @click="onViewData(profile)"
        >
          {{ profile.appletName }}
        </v-btn>
      </v-card-text>
    </v-card>

    <AppletPassword
      ref="appletPasswordDialog"
      v-model="dialog"
      :hasConfirmPassword="false"
      @set-password="onAppletPassword"
    />
  </v-dialog>
</template>

<style scoped>
  .view-btn {
    width: 100%;
    text-transform: none;
    text-align: left;
    margin: 5px 0px;
  }

  .title, .sub-title {
    text-align: center;
  }
  .sub-title {
    font-size: smaller;
  }
</style>

<script>
  import api from "../api/api";
  import AppletPassword from "./AppletPassword";
  import encryption from '../encryption/encryption.vue';

  export default {
    name: 'ViewDataDialog',
    components: {
      AppletPassword,
    },
    props: {
      employer: {
        type: Object,
        required: true,
      },
      value: {
        type: Boolean,
        required: true,
      },
    },
    data() {
      return {
        profileList: [],
        dialog: false,
        selectedProfile: null,
      }
    },
    computed: {
      currentAccount() {
        return this.$store.state.currentAccount;
      }
    },
    beforeMount() {
      this.profileList = [];
      for (let appletId in this.employer) {
        const applet = this.currentAccount.applets.find(applet => applet.id === appletId);
        const profile = this.employer[appletId];

        this.profileList.push({
          ...profile,
          appletId,
          MRN: profile.MRN.match(/None \(.*\)/) ? null : profile.MRN,
          appletName: applet.name
        });
      }
    },
    methods: {
      onAppletPassword(appletPassword) {
        const applet = this.currentAccount.applets.find(applet => applet.id === this.selectedProfile.appletId);
        const encryptionInfo = encryption.getAppletEncryptionInfo({
          appletPassword,
          accountId: this.currentAccount.accountId,
          prime: applet.encryption.appletPrime,
          baseNumber: applet.encryption.base,
        });

        if (
          encryptionInfo
            .getPublicKey()
            .equals(Buffer.from(applet.encryption.appletPublicKey))
        ) {
          this.dialog = false;

          this.$store.commit('setCurrentApplet', applet);
          this.$router.push({
            path: `/applet/${this.selectedProfile.appletId}/dashboard`,
            query: { users: [this.selectedProfile['_id']] },
          }).catch(err => {});
        } else {
          this.$refs.appletPasswordDialog.defaultErrorMsg =
            'Incorrect applet password';
        }
      },

      onViewData(profile) {
        this.selectedProfile = profile;
        this.dialog = true;
      }
    }
  }
</script>
