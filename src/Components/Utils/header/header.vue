<template>
  <v-app-bar
    app
    color="primary"
    dark
  >
    <v-img
      class="logo"
      @click="onDashboard"
      src="/images/logo.png"
      max-width="130"
      contain
    />

    <v-btn
      color="primary"
      class="toolbar-btn"
      @click="onDashboard"
      :x-small="isTablet"
    >
      {{ $t('mindloggerDashboard') }}
    </v-btn>

    <v-icon 
      v-if="currentApplet" 
      medium
    >
      mdi-chevron-right
    </v-icon>
    
    <v-btn
      v-if="currentApplet"
      color="primary"
      class="toolbar-btn"
      @click="viewUsers"
      :x-small="isTablet"
    >
      {{ currentApplet.name }} 
    </v-btn>

    <v-icon 
      v-if="routeName == 'ReviewerDashboard'" 
      medium
    >
      mdi-chevron-right
    </v-icon>

    <v-btn
      v-if="routeName == 'ReviewerDashboard'"
      color="primary"
      class="toolbar-btn"
      :x-small="isTablet"
    >
      {{ currentUsers }}'s Overview
    </v-btn>

    <v-tooltip
      v-if="currentApplet && hasRoles(currentApplet, 'reviewer', 'manager', 'coordinator')"
      bottom
    >
      <template v-slot:activator="{ on }">
        <v-btn
          :color="routeName == 'SetUsers' ? 'black' : 'primary'"
          :x-small="isTablet"
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
      v-if="currentApplet && hasRoles(currentApplet, 'manager', 'coordinator')"
      bottom
    >
      <template v-slot:activator="{ on }">
        <v-btn
          :color="routeName == 'SetSchedule' ? 'black' : 'primary'"
          :x-small="isTablet"
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
      v-if="currentApplet && hasRoles(currentApplet, 'editor', 'manager')"
      bottom
    >
      <template v-slot:activator="{ on }">
        <v-btn
          :color="routeName == 'Builder' ? 'black' : 'primary'"
          :x-small="isTablet"
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
      v-if="currentApplet && hasRoles(currentApplet, 'reviewer', 'manager')"
      bottom
    >
      <template v-slot:activator="{ on }">
        <v-btn
          :x-small="isTablet"
          class="toolbar-btn primary"
          v-on="on"
          @click="onExportData"
        >
          <v-icon class="export-icon">mdi-export</v-icon>
        </v-btn>
      </template>
      <span>{{ $t('exportData') }}</span>
    </v-tooltip>

    <v-tooltip
      v-if="currentApplet && hasRoles(currentApplet, 'editor', 'manager')"
      bottom
    >
      <template v-slot:activator="{ on }">
        <v-btn
          :x-small="isTablet"
          class="toolbar-btn primary"
          v-on="on"
          @click="onDuplicateApplet"
        >
          <img height="24" alt='' v-bind:src="require(`@/assets/copy-clipart-white.png`)"/>
        </v-btn>
      </template>
      <span>{{ $t('duplicateApplet') }}</span>
    </v-tooltip>

    <v-tooltip
      v-if="currentApplet && hasRoles(currentApplet, 'editor', 'manager')"
      bottom
    >
      <template v-slot:activator="{ on }">
        <v-btn
          :x-small="isTablet"
          class="toolbar-btn primary"
          v-on="on"
          @click="onDeleteApplet"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
      <span>{{ $t('deleteApplet') }}</span>
    </v-tooltip>

    <v-tooltip
      v-if="currentApplet && hasRoles(currentApplet, 'editor', 'manager')"
      bottom
    >
      <template v-slot:activator="{ on }">
        <v-btn
          :x-small="isTablet"
          class="toolbar-btn primary"
          v-on="on"
          @click="onTransferOwnership"
        >
          <img height="24" alt='' v-bind:src="require(`@/assets/transfer-ownership-white.png`)"/>
        </v-btn>
      </template>
      <span>{{ $t('transferOwnership') }}</span>
    </v-tooltip>

    <v-spacer />

    <v-menu
      v-if="isLoggedIn"
      :offset-y="true"
      :nudge-width="240"
      bottom
      right
    >
      <template v-slot:activator="{ on }">
        <v-btn
          icon
          v-on="on"
          @click="onOpenAlertList"
        >
					<img height="24" alt='' v-bind:src="require(`@/assets/response-alert.png`)"/>

          <span
            v-if="newAlertCount"
            class="new-alert-count"
          >
            {{ newAlertCount }}
          </span>
        </v-btn>
      </template>
      <v-card class="alert-list">
        <v-list>
          <template
            v-if="alertList.length"
          >
            <v-list-item
              v-for="(alert, index) in alertList"
              :key="index"
              @click="onViewAlert(alert)"
              class="alert-item"
            >
              <div
                class="alert-message"
              >
                {{ alert.compressedMessage }}
              </div>
              <div
                v-if="!alert.viewed"
                class="new-alert"
              >
                {{ $t('new') }}
              </div>
              <div
                class="alert-time"
              >
                {{ alert.timeAgo }}
              </div>
              <div
                class="alert-user"
              >
                {{ alert.email && `${$t('email')}: ${alert.email}` || alert.MRN && `MRN: ${alert.MRN}` }}
              </div>
            </v-list-item>
          </template>
          <template
            v-else
          >
            <v-list-item>
              No Alerts
            </v-list-item>
          </template>
        </v-list>
      </v-card>
    </v-menu>

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
      :x-small="isTablet"
    >
      {{ $t('logout') }}
    </v-btn>

    <ConfirmationDialog
      v-model="appletDeleteDialog"
      :dialogText="$t('deleteAppletConfirmation')"
      :title="$t('deleteApplet')"
      @onOK="deleteApplet"
    />
    <ConfirmationDialog
      v-model="appletEditDialog"
      :dialogText="$t('appletEditAlert')"
      :title="$t('appletEdit')"
      @onOK="editApplet"
    />

    <AppletPassword
      ref="appletPasswordDialog"
      v-model="appletPasswordDialog.visible"
      :hasConfirmPassword="false"
      @set-password="onAppletPassword"
    />

    <ResponseAlertDialog
      v-model="responseAlertDialog.visible"
      :user="responseAlertDialog.user"
      :alert="responseAlertDialog.alert"
      @view-data="viewAlert"
    />

    <Information
      v-model="dialog"
      :dialogText="dialogText"
      :title="dialogTitle"
    />

    <AppletName
      ref="appletNameDialog"
      v-model="appletDuplicateDialog"
      @set-value="onSetAppletDuplicateName"
    />

    <TransferOwnershipDialog
      v-model="ownershipDialog"
      @submit="transferOwnership"
      @close="ownershipDialog = false"
    />
  </v-app-bar>
</template>

<style scoped>
.toolbar-btn {
  box-shadow: unset;
  text-transform: none;
  font-size: 18px !important;
}

.logo {
  margin-right: 12px;
  cursor: pointer;
}

.logout {
  font-size: 15px !important;
}

.alert-time {
  position: absolute;
  right: 2px;
  font-size: 12px;
  bottom: 2px;
  width: 28%;
  text-align: right;
}

.alert-user {
  position: absolute;
  left: 5px;
  font-size: 12px;
  bottom: 2px;
  width: 70%;
}

.alert-list {
  max-height: 260px;
}

.new-alert {
  position: absolute;
  right: 5px;
  font-size: 12px;
  top: 2px;
  color: red;
}

.alert-item {
  padding: 2px 5px 20px 5px;
}

.alert-item:not(:last-child) {
  border-bottom: 1px solid grey;
}

.new-alert-count {
  position: absolute;
  z-index: 10;
  color: white;
  top: -11px;
  right: 0px;
  background: red;
  border-radius: 50%;
  width: 24px;
  line-height: 12px;
}
</style>

<script>

import api from '../api/api.vue';
import ConfirmationDialog from '../dialogs/ConfirmationDialog';
import AppletPassword from '../dialogs/AppletPassword';
import ResponseAlertDialog from '../dialogs/ResponseAlertDialog';
import Information from "../dialogs/InformationDialog.vue";
import AppletName from "../dialogs/AppletName";
import { AppletMixin } from '../mixins/AppletMixin';
import { RolesMixin } from '../mixins/RolesMixin';
import encryption from '../encryption/encryption.vue';

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import fr from 'javascript-time-ago/locale/fr';
import TransferOwnershipDialog from '../dialogs/TransferOwnershipDialog.vue';

TimeAgo.addLocale(en);
TimeAgo.addLocale(fr);

export default {
  name: "Header",
  components: {
    ConfirmationDialog,
    AppletPassword,
    ResponseAlertDialog,
    Information,
    AppletName,
    TransferOwnershipDialog,
  },
  mixins: [AppletMixin, RolesMixin],
  data() {
    return {
      appletEditDialog: false,
      appletPasswordDialog: {
        visible: false,
        applet: {},
        requestedAction: null
      },
      windowWidth: window.innerWidth,
      timeAgo: new TimeAgo(this.$i18n.locale.replace('_', '-')),
      responseAlertDialog: {
        visible: false,
        alert: {},
        user: {},
      },
      dialog: false,
      dialogText: "",
      dialogTitle: "",
      appletDuplicateDialog: false,
      appletDeleteDialog: false,
      appletPendingDelete: undefined,
      ownershipDialog: false,
    }
  },
  mounted() {
    window.onresize = () => {
      this.windowWidth = window.innerWidth
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
    },

    alertList() {
      if (!this.currentAccount || !this.currentAccount.alerts) {
        return [];
      }

      const profiles = this.currentAccount.alerts.profiles;

      return (this.currentAccount.alerts.list || []).map(
        alert => ({
          ...alert,
          compressedMessage: this.compressedMessage(alert.alertMessage),
          timeAgo: this.timeAgo.format(new Date(alert.created), 'round'),
          email: profiles[alert.profileId].email,
          MRN: profiles[alert.profileId].MRN
        })
      );
    },

    newAlertCount() {
      let newAlerts = 0;

      for (let alert of this.alertList) {
        if (!alert.viewed) {
          newAlerts++;
        }
      }

      return newAlerts;
    },
    userProfiles() {
      return this.$store.state.currentAccount.alerts.profiles || {};
    },
    isDesktop() {
      return this.windowWidth > 1400;
    },
    isTablet() {
      return this.windowWidth <= 1400 && this.windowWidth >= 768; 
    },
    allApplets() {
      return this.$store.state.allApplets;
    },
    accountApplets() {
      return this.$store.state.currentAccount && this.$store.state.currentAccount.applets || [];
    },
  },
  /**
   * Define here all methods that will be available in the scope of the template.
   */
  methods: {
    onOpenAlertList() {
      if (this.newAlertCount) {
        api.updateAlertStatus(
          this.$store.state.backend,
          this.$store.state.auth.authToken.token,
        );
      }
    },
    compressedMessage(message) {
      return message.length > 28
        ? message.slice(0, 25) + ' …'
        : message
    },
    // hasRoles() {
    //   return [].some.call(arguments, (role) =>
    //     this.currentApplet.roles.includes(role)
    //   );
    // },
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
      let applet = this.appletPasswordDialog.applet;
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
        this.appletPasswordDialog.visible = false;
        this.appletPasswordDialog.requestedAction(Array.from(encryptionInfo.getPrivateKey()));
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
        this.$set(this, 'appletPasswordDialog', {
          applet: this.currentApplet,
          visible: true,
          requestedAction: this.exportUserData.bind(this, this.currentApplet)
        });
      }
    },

    onViewAlert(alert) {
      this.$set(this, 'responseAlertDialog', {
        visible: true,
        alert: alert,
        user: this.userProfiles[alert.profileId],
      })
    },

    viewAlert() {
      this.responseAlertDialog.visible = false;

      const appletId = this.responseAlertDialog.alert.appletId;
      const appletMeta = this.accountApplets.find(applet => applet.id === appletId);
      let appletLoader = Promise.resolve();

      if (!appletMeta) {
        return ;
      }

      if (!this.isLatestApplet(appletMeta)) {
        appletLoader = this.loadApplet(appletId);
      }

      appletLoader.then(() => {
        const appletData = this.allApplets[appletId];
        const encryptionInfo = appletData.applet.encryption;

        if (
          !encryptionInfo ||
          !encryptionInfo.appletPrime ||
          encryptionInfo.appletPrivateKey
        ) {
          this.gotoReviewerDashboard();
        } else {
          this.$set(this, 'appletPasswordDialog', {
            applet: appletMeta,
            visible: true,
            requestedAction: this.gotoReviewerDashboard.bind(this)
          });
        }
      })
    },

    gotoReviewerDashboard(appletKey = null) {
      const appletId = this.responseAlertDialog.alert.appletId;
      const appletMeta = this.accountApplets.find(applet => applet.id === appletId);

      if (appletKey) {
        this.$store.commit('setAppletPrivateKey', {
          appletId,
          key: appletKey,
        });
      }
      this.$store.commit('setCurrentApplet', appletMeta);

      const profileId = this.responseAlertDialog.alert.profileId;

      this.$store.commit('setCurrentUsers', {
        [profileId]: this.userProfiles[profileId]
      });

      this.$router.push({
        path: `/applet/${appletId}/dashboard`,
        query: { users: [profileId] },
      }).catch(err => {});
    },
    onDuplicateApplet() {
      api
          .validateAppletName({
            apiHost: this.$store.state.backend,
            token: this.$store.state.auth.authToken.token,
            name: `${this.currentApplet.name} (1)`
          })
          .then(resp => {
            this.appletDuplicateDialog = true;
            this.$refs.appletNameDialog.appletName = resp.data;
          })
    },
    onSetAppletDuplicateName(appletName) {
      api
          .duplicateApplet({
            apiHost: this.$store.state.backend,
            token: this.$store.state.auth.authToken.token,
            appletId: this.currentApplet.id,
            options: {
              name: appletName,
            },
          })
          .then((resp) => {
            this.appletDuplicateDialog = false;

            this.dialogText = resp.data.message;
            this.dialogTitle = this.$t('appletDuplication');
            this.dialog = true;
          });
    },

    onDeleteApplet() {
      this.appletDeleteDialog = true;
      this.appletPendingDelete = this.currentApplet;
    },
    deleteApplet() {
      this.isSyncing = true;
      this.loaderMessage = `Deleting applet ${this.appletPendingDelete.name}`;
      api
          .deleteApplet({
            apiHost: this.$store.state.backend,
            token: this.$store.state.auth.authToken.token,
            appletId: this.currentApplet.id,
          })
          .then((resp) => {
            this.isSyncing = false;
            this.loaderMessage = "";
            const applet = this.appletPendingDelete;
            this.$store.commit('removeDeletedApplet',  applet);
            this.$router.push("/dashboard").catch(err => {});
          });
    },

    onTransferOwnership() {
      this.ownershipDialog = true;
    },
    transferOwnership(ownershipEmail) {
      api
          .transferOwnership({
            apiHost: this.$store.state.backend,
            token: this.$store.state.auth.authToken.token,
            appletId: this.currentApplet.id,
            email: ownershipEmail,
          })
          .then((resp) => {
            this.ownershipDialog = false;

            this.dialogText = this.$t('requestSuccess', { ownershipEmail });
            this.dialogTitle = this.$t('requestSent');
            this.dialog = true;
          })
          .catch((err) => {
            this.dialogText = this.$t('requestTransferFailed',);
            this.dialogTitle = this.$t('requestFailed');
            this.dialog = true;
          });
    },
  },
};
</script>
