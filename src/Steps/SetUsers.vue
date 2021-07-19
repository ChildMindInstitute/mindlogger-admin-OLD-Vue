<template>
  <v-container fluid>
    <v-card class="users">
      <div class="tabs">
        <v-tabs
          v-model="selectedTab"
          background-color="white"
          color="black"
          light
          left
        >
          <template v-for="tab in tabs">
            <v-tab
              :key="tab"
              @click="onSwitchTab(tab)"
            >
              {{ $t(tab) }}
            </v-tab>
          </template>
        </v-tabs>

        <v-tooltip
          v-if="retentionSettings && retentionSettings.enabled && isManager"
          top
        >
          <template v-slot:activator="{ on }">
            <v-btn
              color="primary"
              small
              style="margin: auto;"
              @click="dataRetentionSettingsDialog = true"
              v-on="on"
            >
              <span>{{ $t('dataRetentionSettings') }}</span>
            </v-btn>
          </template>
          <span>{{ $t('dataRetentionSettings') }}</span>
        </v-tooltip>
      </div>

      <v-tabs-items v-model="selectedTab">
        <v-tab-item
          v-for="tab in tabs"
          :key="tab"
        >
          <v-card
            v-if="tab == 'users'"
            flat
          >
            <UserList
              :getUserList="getAppletUsers"
              :multiSelectionEnabled="true"
              :reloading="tabData[tab].loading"
              @onReuploadResponse="responseReUploadEvent"
              @userDataReloaded="tabData[tab].loading = false"
            />
          </v-card>
          <v-card
            v-else-if="tab == 'invitation'"
            class="pa-4"
          >
            <h1>{{ $t('pendingInvitations') }}</h1>
            <pending-invite-table
              :users="tabData[tab].list"
              :loading="tabData[tab].loading"
            />
            <create-invitation-form
              :key="invitationFormKey"
              @createInvitation="createInvitation"
            />
            <invite-link></invite-link>
            <div style="height: 58px;" />
          </v-card>
          <v-card
            v-else
            flat
          >
            <UserList
              :getUserList="getAppletUsers"
              :multiSelectionEnabled="true"
              :currentRole="tabNameToRole[tab]"
              :reloading="tabData[tab].loading"
              @userDataReloaded="tabData[tab].loading = false"
              @onReuploadResponse="responseReUploadEvent"
              @onEditRoleSuccessfull="onEditRoleSuccessfull"
            />
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-card>

    <DataRetentionSettings
      v-if="retentionSettings && retentionSettings.enabled && dataRetentionSettingsDialog"
      v-model="dataRetentionSettingsDialog"
      :retentionSettings="retentionSettings"
      :error="errorMsg"
      @set-settings="onSaveRetentionSettings"
      @settings-close="onRetentionSettingsClose()"
    />

    <Information
      v-model="informationDialog"
      :dialogText="informationText"
      :title="informationTitle"
    />

    <AppletPassword
      ref="appletPasswordRef"
      v-model="appletPasswordDialog"
      :hasConfirmPassword="false"
      @set-password="onClickSubmitPassword"
    />

    <ResponseUpdateDialog
      :key="responseUpdateDialog.key"
      v-model="responseUpdateDialog.visible"
      :userData="responseUpdateDialog.userData"
      @onReuploadResponse="onReuploadResponse"
      @onDeclineReuploading="onDeclineReuploading"
    />
  </v-container>
</template>

<style scoped>
.users {
  background-color: white !important;
}
.loading {
  text-align: center;
}

.tabs {
  display: flex;
  padding-right: 20px;
}
</style>

<script>
import _ from 'lodash';

import UserList from "../Components/Users/UserList";

import PendingInviteTable from '../Components/Users/PendingInviteTable.vue';
import InviteLink from '../Components/Users/InviteLink.vue';
import CreateInvitationForm from '../Components/Users/CreateInvitationForm.vue';
import api from '../Components/Utils/api/api.vue';
import AppletPassword from '../Components/Utils/dialogs/AppletPassword';
import encryption from '../Components/Utils/encryption/encryption.vue';
import Applet from '../models/Applet';
import Information from '../Components/Utils/dialogs/InformationDialog.vue';
import ResponseUpdateDialog from '../Components/Utils/dialogs/ResponseUpdateDialog.vue';
import DataRetentionSettings from '../Components/Utils/dialogs/DataRetentionSettings';
import Item from '../models/Item';
import { AppletMixin } from '../Components/Utils/mixins/AppletMixin';

export default {
  name: 'SetUsers',
  components: {
    PendingInviteTable,
    InviteLink,
    CreateInvitationForm,
    AppletPassword,
    Information,
    UserList,
    ResponseUpdateDialog,
    DataRetentionSettings,
  },
  mixins: [AppletMixin],
  data: () => ({
    status: 'loading',
    componentKey: 0,
    userPasswordDialog: false,
    exportError: '',
    appletPasswordDialog: false,
    requestedAction: null,
    responseUpdateDialog: {
      visible: false,
      userData: {},
      key: 0,
    },

    informationDialog: false,
    informationText: '',
    informationTitle: '',

    tabs: [],
    tabNameToRole: {
      users: 'user',
      reviewers: 'reviewer',
      editors: 'editor',
      coordinators: 'coordinator',
      managers: 'manager'
    },
    tabData: {},
    selectedTab: null,
    invitationFormKey: 0,
    dataRetentionSettingsDialog: false,
    retentionSettingsInitial: null,
    errorMsg: '',
  }),
  computed: {
    dashboardEnabled() {
      if (this.status !== 'ready') {
        return false;
      }

      const hasPermission = this.hasRoles('owner', 'reviewer', 'manager');
      const currentApplet = this.$store.state.currentAppletData;

      const items = Object.values(currentApplet.items);

      return hasPermission &&
              items.length === 1 &&
              new Item(items[0]).inputType == 'radio';
    },
    activeUserList() {
      return this.$store.state.users.active;
    },
    pendingInviteList() {
      return this.$store.state.users.pending;
    },

    currentUsers() {
      return this.$store.state.currentUsers;
    },

    retentionSettings() {
      return this.$store.state.currentRetentions;
    },

    isManager() {
      if (this.status !== 'ready') {
        return false;
      }

      return this.hasRoles('owner', 'manager');
    }
  },
  watch: {
    $route(to, from) {
      this.status = 'loading';

      Promise.resolve().then(() => {
        if (!this.isLatestApplet(this.currentAppletMeta)) {
          return this.loadApplet(this.currentAppletMeta.id)
        }
        return Promise.resolve();
      }).then( () => {
        this.status = 'ready'
      })
    },
  },
  mounted() {
    for (let tab of ['users', 'reviewers', 'editors', 'coordinators', 'managers', 'invitation']) {
      this.$set(this.tabData, tab, {
        loading: false,
        list: [],
        total: 0,
      });
    }

    Promise.resolve().then(() => {
      if (!this.isLatestApplet(this.currentAppletMeta)) {
        return this.loadApplet(this.currentAppletMeta.id);
      }

      return Promise.resolve();
    }).then( () => {
      this.status = 'ready';

      this.$store.commit('setCurrentRetentionSettings', this.$store.state.currentAppletData.applet.retentionSettings);
    });

    for (let tab of ['managers', 'coordinators', 'editors', 'reviewers', 'users']) {
      const role = this.tabNameToRole[tab];

      this.getAppletUsers(role).then(resp => {
        if (resp.data.total > 0) {
          this.tabs.unshift(tab);
        }
      });
    }

    if (
      this.currentAppletMeta.roles.includes('coordinator') ||
      this.currentAppletMeta.roles.includes('manager') ||
      this.currentAppletMeta.roles.includes('owner')
    ) {
      if (!this.tabs.includes('invitation')) {
        this.onSwitchTab('invitation').then(() => this.tabs.push('invitation'));
      }
    }
  },
  methods: {
    onRetentionSettingsClose() {
      this.dataRetentionSettingsDialog = false;
    },
    onSaveRetentionSettings(settings) {
      this.dataRetentionSettingsDialog = false;

      const { period, retention } = settings;

      api.updateRetainingSettings({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        appletId: this.currentAppletMeta.id,
        options: {
          id: this.currentAppletMeta.id,
          period,
          retention,
        },
      })
      .then((resp) => {
        this.$store.commit('setCurrentRetentionSettings', settings);

        this.informationTitle = this.$i18n.t('dataRetentionSettingUpdate');
        this.informationText  = this.$i18n.t('dataRetentionSettingUpdateSuccess');
        this.informationDialog =true;

        this.errorMsg = '';
      })
      .catch(err => {
        this.dataRetentionSettingsDialog = true;
        this.errorMsg = err.response.data.message;
      });
    },
    onSwitchTab(tab) {
      this.tabData[tab].loading = true;

      if (tab === 'invitation') {
        return this.getInvitations().then(resp => {
          this.$set(this.tabData, tab, {
            loading: false,
            list: resp.data,
            total: resp.data.length
          })
        });
      } else {
        this.tabData[tab].loading = true;
        return Promise.resolve();
      }
    },
    /**
     * Fetches the listing of users for the current applet.
     *
     * @return {void}
     */
    getAppletUsers(role, filter='', pagination={ allow: false }, sort={ allow: false }) {
      return api.getAccountUserList({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        appletId: this.currentAppletMeta.id,
        role,
        MRN: filter,
        pagination,
        sort
      });
    },

    getInvitations() {
      return api.getInvitations({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        appletId: this.currentAppletMeta.id,
      });
    },

    hasRoles() {
      return [].some.call(arguments, (role) =>
        this.currentAppletMeta.roles.includes(role)
      );
    },

    onEditRoleSuccessfull() {
      this.onSwitchTab(this.tabs[this.selectedTab]).then((resp) => {
        this.informationDialog = true;
        this.informationText = this.$t('organizerRoleUpdate');
        this.informationTitle = this.$t('organizerRoleUpdateSuccess');
      })
    },

    createInvitation(invitationOptions) {
      this.status = 'loading';

      api
        .getAppletInvitation({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          appletId: this.currentAppletMeta.id,
          options: invitationOptions,
        })
        .then((resp) => {
          if (
            invitationOptions.role !== 'user' &&
            invitationOptions.accountName
          ) {
            this.setAccountName(invitationOptions.accountName);
          }

          return this.onSwitchTab('invitation');
        })
        .then(() => {
          this.status = 'ready';
          this.invitationFormKey++;
        })
        .catch((e) => {
          this.error = e.response.data.message;
          this.status = 'error';
          this.$dialog.error({
            title: "Try again",
            text: this.error,
          });
        });
    },

    responseReUploadEvent(user) {
      this.$set(this, 'responseUpdateDialog', {
        userData: user,
        visible: true,
        key: this.responseUpdateDialog.key + 1
      });
    },

    onReuploadResponse() {
      const encryptionInfo = this.currentAppletData.applet.encryption;

      this.responseUpdateDialog.visible = false;

      if (encryptionInfo && encryptionInfo.appletPrivateKey) {
        this.updateUserResponse(this.responseUpdateDialog.userData);
      } else {
        this.appletPasswordDialog = true;
        this.requestedAction = this.updateUserResponse.bind(
          this,
          this.responseUpdateDialog.userData
        );
      }
    },

    onDeclineReuploading() {
      this.responseUpdateDialog.visible = false;
      this.informationDialog = true;
      this.informationText = this.$i18n.t('refreshDeclined');
      this.informationTitle = this.$i18n.t('refreshResponse');
    },

    updateUserResponse(userData) {
      let to = new Date();
      let from = new Date();

      to.setDate(to.getDate() + 1);
      from.setDate(from.getDate() - 8);

      const apiHost = this.$store.state.backend;
      const token = this.$store.state.auth.authToken.token;
      const appletId = this.$route.params.appletId;
      api
        .getUserResponses({
          apiHost,
          token,
          appletId,
          users: [userData._id],
          fromDate: from.toISOString(),
          toDate: to.toISOString(),
        })
        .then(({ data }) => {
          Applet.replaceItemValues(
            Applet.decryptResponses(data, this.currentAppletData.applet.encryption)
          );
          Applet.encryptResponses(
            data,
            this.currentAppletData.applet.encryption,
            userData.refreshRequest.userPublicKey
          );

          const form = new FormData();

          form.set(
            'responses',
            JSON.stringify({
              dataSources: Object.keys(data.dataSources).reduce(
                (accumulator, responseId) => {
                  accumulator[responseId] = data.dataSources[responseId].data;
                  return accumulator;
                },
                {}
              ),
              userPublicKey: userData.refreshRequest.userPublicKey,
              tokenUpdates: (data.tokens && data.tokens.tokenUpdates || []).reduce(
                (accumulator, update) => {
                  accumulator[update.id] = update.data;
                  return accumulator;
                },
                {}
              )
            })
          );

          api
            .replaceResponseData({
              apiHost,
              token,
              appletId,
              user: userData._id,
              data: form,
            })
            .then(({ message }) => {
              this.onSwitchTab(this.tabs[this.selectedTab]).then(() => {
                this.informationDialog = true;
                this.informationText = this.$i18n.t('refreshComplete');
                this.informationTitle = this.$i18n.t('refreshResponse');
              });
            });
        });
    },

    /**
     * Updates the account name in the API.
     *
     * @param {string} accountName the new account name.
     * @return {void}
     */
    setAccountName(accountName) {
      api
        .setAccountName({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          accountName,
        })
        .then((resp) => {
          this.$store.commit('setAccountName', accountName);
        })
        .catch((err) => {
          console.warn(err);
        });
    },

    /** check applet password */
    onClickSubmitPassword(appletPassword) {
      const currentApplet = this.currentAppletData;

      const encryptionInfo = encryption.getAppletEncryptionInfo({
        appletPassword,
        accountId: this.$store.state.currentAccount.accountId,
        prime: currentApplet.applet.encryption.appletPrime,
        baseNumber: currentApplet.applet.encryption.base,
      });

      if (
        encryptionInfo
          .getPublicKey()
          .equals(Buffer.from(currentApplet.applet.encryption.appletPublicKey))
      ) {
        this.appletPasswordDialog = false;

        this.$store.commit('setAppletPrivateKey', {
          appletId: currentApplet.applet._id.split("/")[1],
          key: Array.from(encryptionInfo.getPrivateKey()),
        });

        this.requestedAction();
      } else {
        this.$refs.appletPasswordRef.defaultErrorMsg =
          'Incorrect applet password';
      }
    },
  },
};
</script>
