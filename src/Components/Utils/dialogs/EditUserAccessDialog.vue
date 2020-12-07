<template>
  <v-dialog
    :value="value"
    max-width="500px"
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-title>
        {{$t('editAppletAccess')}}
      </v-card-title>

      <v-card-text>
        <v-expansion-panels
          v-model="panel"
          focusable
        >
          <v-expansion-panel
            v-for="profile in profileList"
            :key="profile.appletId"
          >
            <v-expansion-panel-header>
              {{ profile.appletName }}
            </v-expansion-panel-header>

            <v-expansion-panel-content>
              <div class="manage">
                <button
                  class="manage-button"
                  @click="onRemoveUser(profile)"
                >
                  {{$t('removeAccessToApplet', { user: (profile.MRN || profile.email) })}}
                </button>

                <button
                  v-show="profile.manageable"
                  class="manage-button"
                  @click="onRemoveUserAndData(profile)"
                >
                  {{ $t('removeAccessToAppletAndData', { user:  profile.MRN || profile.email }) }}
                </button>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>

    <AppletPassword
      ref="appletPasswordDialog"
      v-model="dialog"
      :hasConfirmPassword="false"
      :defaultTitle="$t('areYouSure')"
      @set-password="onAppletPassword"
    />
  </v-dialog>
</template>

<style scoped>
  .text-transform-none {
    text-transform: none;
  }

  .manage {
    display: flex;
    justify-content: space-between;
  }
  .manage-button {
    margin: 10px 5px;
    box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
    color: rgb(0,0,0,0.87);
    background-color: #f5f5f5;
    text-align: center;
    border-radius: 5%;
  }
</style>

<script>
  import api from "../api/api";
  import AppletPassword from "./AppletPassword";
  import encryption from '../encryption/encryption.vue';

  export default {
    name: 'EditUserAccessDialog',
    components: {
      AppletPassword,
    },
    props: {
      user: {
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
        panel: 0,
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
      for (let appletId in this.user) {
        const applet = this.currentAccount.applets.find(applet => applet.id === appletId);
        const profile = this.user[appletId];

        this.profileList.push({
          ...profile,
          appletId,
          MRN: profile.MRN.match(/None \(.*\)/) ? null : profile.MRN,
          appletName: applet.name,
          manageable: applet.roles.includes('manager')
        });
      }
    },
    methods: {
      async onRemoveUser(profile) {
        const response = await this.$dialog.warning({
          title: '',
          color: '#1976d2',
          text: this.$i18n.t("areYouSureRemoveUser"),
          persistent: false,
          actions: {
            No: this.$i18n.t("no"),
            Yes: {
              color: '#1976d2',
              text: this.$i18n.t("yes"),
            },
          },
        });

        if (response === 'Yes') {
          this.deleteAppletUser(profile.appletId, profile['_id']);
        }
      },
      onRemoveUserAndData(profile) {
        const applet = this.currentAccount.applets.find(applet => applet.id === profile.appletId);

        if (applet.encryption) {
          this.dialog = true;
          this.selectedProfile = profile;
        } else {
          this.deleteAppletUser(profile.appletId, profile['_id'], true);
        }
      },

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
          this.deleteAppletUser(applet.id, this.selectedProfile['_id'], true);
        } else {
          this.$refs.appletPasswordDialog.defaultErrorMsg =
            'Incorrect applet password';
        }
      },

      deleteAppletUser(appletId, profileId, deleteResponse = false) {
        return api.revokeAppletUser({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          appletId,
          profileId,
          deleteResponse,
        }).then(() => {
          this.profileList = this.profileList.filter(profile => profile['_id'] != profileId);
          this.panel = -1;

          this.$emit('refreshUserList');

          if (!this.profileList.length) {
            this.$emit('input', false);
          }
        })
      }
    }
  }
</script>
