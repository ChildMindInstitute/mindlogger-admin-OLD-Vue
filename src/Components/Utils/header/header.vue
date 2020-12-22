<template>
  <v-app-bar
    app
    color="primary"
    dark
  >
    <v-btn
      color="primary"
      class="toolbar-btn"
      @click="onDashboard"
    >
      {{ $t('mindloggerDashboard') }}
    </v-btn>

    <v-btn
      v-if="currentApplet"
      color="primary"
      class="toolbar-btn"
    >
      {{ currentApplet.name }} 
    </v-btn>

    <v-btn
      v-if="routeName == 'ReviewerDashboard'"
      color="primary"
      class="toolbar-btn"
    >
      {{ currentUsers }}'s Overview
    </v-btn>

    <v-tooltip
      v-if="currentApplet && hasRoles('reviewer', 'manager', 'coordinator')"
      bottom
    >
      <template v-slot:activator="{ on }">
        <v-btn
          :color="routeName == 'SetUsers' ? 'black' : 'primary'"
          class="toolbar-btn"
          v-on="on"
          @click="viewUsers"
        >
          <v-icon>mdi-account-multiple</v-icon>
        </v-btn>
      </template>
      <span>{{ $t('viewUsers') }}</span>
    </v-tooltip>

    <v-tooltip
      v-if="currentApplet && hasRoles('manager', 'coordinator')"
      bottom
    >
      <template v-slot:activator="{ on }">
        <v-btn
          :color="routeName == 'SetSchedule' ? 'black' : 'primary'"
          class="toolbar-btn"
          v-on="on"
          @click="viewCalendar"
        >
          <v-icon>mdi-calendar-month</v-icon>
        </v-btn>
      </template>
      <span>{{ $t('viewCalendar') }}</span>
    </v-tooltip>

    <v-tooltip
      v-if="currentApplet && hasRoles('editor', 'manager')"
      bottom
    >
      <template v-slot:activator="{ on }">
        <v-btn
          :color="routeName == 'Builder' ? 'black' : 'primary'"
          class="toolbar-btn"
          v-on="on"
          @click="onEditApplet"
        >
          <v-icon>mdi-square-edit-outline</v-icon>
        </v-btn>
      </template>
      <span>{{ $t('editApplet') }}</span>
    </v-tooltip>

    <v-tooltip
      v-if="currentApplet && hasRoles('reviewer', 'manager')"
      bottom
    >
      <template v-slot:activator="{ on }">
        <v-btn
          class="toolbar-btn primary"
          v-on="on"
          @click="onExportData"
        >
          <v-icon class="export-icon">
            mdi-export
          </v-icon>
        </v-btn>
      </template>
      <span>{{ $t('exportData') }}</span>
    </v-tooltip>

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
      class="toolbar-btn logout"
      color="primary"
      @click="logout"
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
      ref="appletPasswordDialog"
      v-model="appletPasswordDialog"
      :hasConfirmPassword="false"
      @set-password="onAppletPassword"
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
  components: {
    ConfirmationDialog,
    AppletPassword,
  },
  mixins: [AppletMixin],
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
    },
    currentUsers() {
      return Object.values(this.$store.state.currentUsers).map(user => user.MRN || user.email).join(', ');
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
        this.appletPasswordDialog = false;
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
