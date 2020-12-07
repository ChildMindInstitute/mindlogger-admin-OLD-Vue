<template>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <v-btn color="primary" class="toolbar-btn" @click="onDashboard">
        {{ $t('mindloggerDashboard') }}
      </v-btn>

      <v-btn color="primary" class="toolbar-btn" v-if="currentApplet">
        {{ currentApplet.name }} 
      </v-btn>

      <v-btn
        v-if="currentApplet && hasRoles('reviewer', 'manager', 'coordinator')"
        :color="routeName == 'SetUsers' ? 'black' : 'primary'"
        class="toolbar-btn"
        @click="viewUsers"
      >
        <v-icon>mdi-account-multiple</v-icon>
      </v-btn>

      <v-btn
        v-if="currentApplet && hasRoles('manager', 'coordinator')"
        :color="routeName == 'SetSchedule' ? 'black' : 'primary'"
        class="toolbar-btn"
        @click="viewCalendar"
      >
        <v-icon>mdi-calendar-month</v-icon>
      </v-btn>

      <v-btn
        v-if="currentApplet && hasRoles('editor', 'manager')"
        :color="routeName == 'Builder' ? 'black' : 'primary'"
        class="toolbar-btn"
        @click="onEditApplet"
      >
        <v-icon>mdi-square-edit-outline</v-icon>
      </v-btn>

      <v-btn
        v-if="currentApplet && hasRoles('reviewer', 'manager')"
        class="toolbar-btn primary"
        @click="onExportData"
      >
        <v-icon class="export-icon">mdi-export</v-icon>
      </v-btn>

      <v-spacer />

      <v-menu
        v-if="isLoggedIn"
        :offset-y="true"
        :nudge-width="150"
        bottom
        right
      >
        <template v-slot:activator="{ on }">
          <v-btn
            icon
            v-on="on"
          >
            <v-icon>mdi-account-switch</v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-list>
            <v-list-item>
              <v-list-item-title @click="switchAccount(ownerAccountId)">
                {{ ownerAccountName }}
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              v-for="(account, index) in accounts"
              :key="index"
              @click="switchAccount(account.accountId)"
            >
              <v-list-item-title>{{ account.accountName }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>

      <v-btn
        v-if="isLoggedIn"
        @click="logout"
        class="toolbar-btn logout"
        color="primary"
      >
        {{ $t('logout') }}
      </v-btn>

      <ConfirmationDialog
        v-model="appletEditDialog"
        :dialogText="$t('appletEditAlert')"
        :title="$t('appletEdit')"
        @onOK="editApplet"
      />

      <AppletPassword
        v-model="appletPasswordDialog"
        :hasConfirmPassword="false"
        @set-password="onAppletPassword"
        ref="appletPasswordDialog"
      />
    </v-app-bar>
</template>

<style scoped>
.toolbar-btn {
  box-shadow: unset;
  text-transform: none;
  font-size: 18px !important;
}

.logout {
  font-size: 15px !important;
}
</style>

<script>

import api from '../api/api.vue';
import ConfirmationDialog from '../dialogs/ConfirmationDialog';
import AppletPassword from '../dialogs/AppletPassword';
import { AppletMixin } from '../mixins/AppletMixin';
import encryption from '../encryption/encryption.vue';

export default {
  name: "Header",
  mixins: [AppletMixin],
  components: {
    ConfirmationDialog,
    AppletPassword,
  },
  data() {
    return {
      appletEditDialog: false,
      appletPasswordDialog: false,
    }
  },
  /**
   * Define here all computed properties.
   */
  computed: {
    isLoggedIn() {
      return !_.isEmpty(this.$store.state.auth);
    },
    showEnvironment() {
      return process.env.VUE_APP_TITLE_ENV;
    },
    ownerAccountName() {
      return this.$store.state.ownerAccount.accountName;
    },
    ownerAccountId() {
      return this.$store.state.ownerAccount.accountId;
    },
    accounts() {
      const accounts = [];
      this.$store.state.allAccounts.forEach((account) => {
        if (!account.owned) {
          accounts.push(account);
        }
      });
      return accounts;
    },
    currentAccount() {
      return this.$store.state.currentAccount;
    },

    currentApplet() {
      return this.$store.state.currentAppletMeta; 
    },
    routeName() {
      return this.$route.name;
    }
  },
  /**
   * Define here all methods that will be available in the scope of the template.
   */
  methods: {
    hasRoles() {
      return [].some.call(arguments, (role) =>
        this.currentApplet.roles.includes(role)
      );
    },
    logout() {
      this.$store.commit('resetState');
      this.$router.push('/login').catch(err => {});
    },

    switchAccount(accountId) {
      api
        .switchAccount({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          accountId,
        })
        .then((resp) => {
          this.$store.commit('setCurrentApplet', null);
          this.$store.commit('setCurrentUsers', {});
          this.$store.commit('switchAccount', resp.data.account);
          this.$router.push('/build').catch(err => {});
          this.$router.push('/dashboard').catch(err => {});
        })
        .catch((err) => {
          console.warn(err);
        });
    },

    onDashboard() {
      if (this.isLoggedIn) {
        this.$router.push('/dashboard').catch(err => {});
        this.$store.commit('setCurrentApplet', null);
      }
    },

    viewUsers() {
      this.$router.push(`/applet/${this.currentApplet.id}/users`).catch(err => {});
    },

    viewCalendar() {
      this.$router.push(`/applet/${this.currentApplet.id}/schedule`).catch(err => {});
    },

    onEditApplet() {
      if (this.currentApplet.hasUrl) {
        this.appletEditDialog = true;
      } else {
        this.editApplet();
      }
    },

    editApplet() {
      this.$router.push({
        name: 'Builder',
        params: { isEditing: true },
      }).catch(err => {});
    },

    onAppletPassword(appletPassword) {
      let applet = this.currentAppletMeta;
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

        this.exportUserData(applet, Array.from(encryptionInfo.getPrivateKey()));
      } else {
        this.$refs.appletPasswordDialog.defaultErrorMsg = this.$t('incorrectAppletPassword');
      }
    },

    onExportData() {
      const encryptionInfo = this.currentAppletData.applet.encryption;

      if (
        !encryptionInfo ||
        !encryptionInfo.appletPrime ||
        encryptionInfo.appletPrivateKey
      ) {
        this.exportUserData(this.currentApplet, encryptionInfo && encryptionInfo.appletPrivateKey);
      } else {
        this.appletPasswordDialog = true;
      }
    },
  },
};
</script>
