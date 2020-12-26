<template>
  <v-container fluid>
    <Loading v-if="status === 'loading'" />
    <div
      v-else-if="status === 'error'"
      class="error"
    >
      {{ error.message }}
    </div>
    <v-card v-else-if="tabs.length">
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
          v-if="appletUploadEnabled"
          top
        >
          <template v-slot:activator="{ on }">
            <v-btn
              color="primary"
              rounded
              small
              style="margin: auto;"
              v-on="on"
              @click="appletUploadDialog = true"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("createUploadApplet") }}</span>
        </v-tooltip>
      </div>

      <v-tabs-items v-model="selectedTab">
        <v-tab-item
          v-for="tab in tabs"
          :key="tab"
        >
          <v-card
            v-if="tab == 'applets'"
            flat
          >
            <AppletList
              :loading="tabData[tab].loading"
              :applets="tabData[tab].list"
              @refreshAppletList="getAccountData"
              @onAppletPasswordChanged="onAppletPasswordChanged"
              @onOwnerShipInviteSuccessful="onOwnerShipInviteSuccessful"
              @onOwnerShipInviteError="onOwnerShipInviteError"
              @onDuplicateRequestReceived="onDuplicateRequestReceived"
              @onRefreshAppletRequestReceived="onRefreshAppletRequestReceived"
            />
          </v-card>
          <v-card
            v-else-if="tab == 'users'"
            flat
          >
            <UserList
              :getUserList="getUserList"
              :multiSelectionEnabled="true"
              :reloading="tabData[tab].loading"
              @userDataReloaded="tabData[tab].loading = false"
            />
          </v-card>
          <v-card
            v-else
            flat
          > 
            <DashboardRoleViewer
              :loading="tabData[tab].loading"
              :employees="tabData[tab].list"
              @onEditRoleSuccessfull="onRefreshUserList"
              @refreshUserList="onRefreshUserList"
              :roleType="roleTypeMapping[tab]" />
          </v-card> 
        </v-tab-item>
      </v-tabs-items>
    </v-card>
    <v-card
      v-else
      class="welcome"
    >
      <h2> {{ $t("welcomeMindLogger") }} </h2>
      <p>
        {{ $t("getStarted") }}
      </p><p>
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn
              color="primary"
              x-large
              elevation="11"
              light
              v-on="on"
              @click="appletUploadDialog = true"
            >
              {{ $t("clickHere") }}
            </v-btn>
          </template>
          <span>{{ $t("createUploadApplet") }}</span>
        </v-tooltip>
      </p><p>
        {{ $t("navigateSpaceText") }}
      </p>

      <p>
        {{ $t("ownSpaceDescription") }}
      </p>
    </v-card>

    <Information
      v-model="dialog"
      :dialogText="dialogText"
      :title="dialogTitle"
    />

    <AppletUpload
      v-model="appletUploadDialog"
      @add-applet="onAddApplet"
    />

    <AppletPassword
      v-model="appletPasswordDialog"
      :hasConfirmPassword="true"
      @set-password="addNewApplet"
    />
  </v-container>
</template>

<style scoped>
  .tabs {
    display: flex;
    padding-right: 20px;
  }

  @media only screen and (min-width: 768px) {
    .welcome {
      width: 80%;
      margin: auto;
      min-height: calc(70vh - 60px);
    }
  }

  .welcome {
    text-align: center;
    padding: 20px;
    font-size: 25px;
  }
  .welcome h2, .welcome p {
    margin: 20px 0px;
  }
</style>

<script>
import api from "../Components/Utils/api/api.vue";
import _ from "lodash";
import Loading from "../Components/Utils/Loading";
import { Parse, Day } from "dayspan";
import Information from "../Components/Utils/dialogs/InformationDialog.vue";
import DashboardRoleViewer from "@/Components/Dashboard/DashboardRoleViewer.vue";
import config from "../config";
import AppletList from "../Components/Applets/AppletList";
import UserList from "../Components/Users/UserList";
import AppletUpload from "../Components/Utils/dialogs/AppletUpload.vue";
import AppletPassword from "../Components/Utils/dialogs/AppletPassword.vue";
import encryption from "../Components/Utils/encryption/encryption.vue";
import { AppletMixin } from '@/Components/Utils/mixins/AppletMixin';
window.Parse = Parse;
window.Day = Day;

export default {
  name: "Dashboard",
  components: {
    Loading,
    Information,
    AppletList,
    AppletUpload,
    AppletPassword,
    UserList,
    DashboardRoleViewer
  },
  mixins: [AppletMixin],
  data: () => ({
    sampleProtocols: config.protocols,
    status: "loading",
    error: {},
    dialog: false,
    dialogText: "",
    dialogTitle: "",
    selectedTab: null,
    tabs: [],
    appletUploadEnabled: false,
    tabNameToRole: {
      users: 'user',
      reviewers: 'reviewer',
      editors: 'editor',
      coordinators: 'coordinator',
      managers: 'manager'
    },
    tabData: {},
    appletUploadDialog: false,
    appletPasswordDialog: false,
    newProtocolURL: "",
  }),
  computed: {
    currentAccount() {
      return this.$store.state.currentAccount.accountId;
    },
    currentApplet() {
      return this.$store.state.currentAppletMeta;
    },
    accountApplets() {
      return this.$store.state.currentAccount.applets;
    }
  },
  watch: {
    accountApplets(newApplets, oldApplets) {
      const availableTabs = [];

      this.appletUploadEnabled = false;

      if (newApplets.length) {
        availableTabs.push('applets');
      }

      for (let applet of newApplets) {
        /** managers can view others */
        if (applet.roles.includes('manager')) {
          availableTabs.push('users', 'reviewers', 'editors', 'coordinators', 'managers');
        }

        /** reviewers can view users */
        if (applet.roles.includes('reviewer') || applet.roles.includes('coordinator')) {
          availableTabs.push('users');
        }

        /** manager and editors can view applets */
        if (applet.roles.includes('editor') || applet.roles.includes('manager')) {
          this.appletUploadEnabled = true;
        }
      }

      this.tabs = [];
      for (let tab of ['applets', 'users', 'reviewers', 'editors', 'coordinators', 'managers']) {
        if (availableTabs.indexOf(tab) >= 0) {
          this.tabs.push(tab);
        }
      }
    },
    $route(to, from) {
      this.status = 'loading';
      this.getAccountData();
    },
  },
  mounted() {
    for (let tab of ['applets', 'users', 'reviewers', 'editors', 'coordinators', 'managers']) {
      this.$set(this.tabData, tab, {
        loading: false,
        list: [],
        total: 0,
      });
    }
    this.getAccountData();
  },
  methods: {
    onSwitchTab(tab) {
      if (tab == 'applets') {
        this.getAccountData();
      } else if (tab == 'users') {
        this.tabData[tab].loading = true;
      } else {
        const role = this.tabNameToRole[tab];

        this.tabData[tab].loading = true;

        return this.getUserList(role).then(resp => {
          this.$set(this.tabData, tab, {
            loading: false,
            list: resp.data.items,
            total: resp.data.total
          });
        });
      }
    },
    onRefreshUserList() {
      this.onSwitchTab(this.tabs[this.selectedTab]).then((resp) => {
        this.dialog = true;
        this.dialogText = this.$t('organizerRoleUpdateSuccess');
        this.dialogTitle = this.$t('organizerRoleUpdate');
      })
    },
    getUserList(role, filter='', pagination={ allow: false }, sort={ allow: false }) {
      return api.getAccountUserList({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        role,
        MRN: filter,
        pagination,
        sort
      });
    },
    getAccountData() {
      const accountId = this.$store.state.currentAccount.accountId;

      this.tabData['applets'].loading = true;

      if (!accountId) {
        this.status = "ready";
        return;
      }

      return api
        .switchAccount({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          accountId,
        })
        .then((resp) => {
          this.$store.commit("switchAccount", resp.data.account);
          this.status = "ready";

          this.$set(this.tabData, 'applets', {
            list: resp.data.account.applets,
            loading: false
          });
        })
        .catch((err) => {
          console.warn(err);
        });
    },

    onAddApplet(protocolUrl) {
      this.appletUploadDialog = false;
      this.appletPasswordDialog = true;
      this.newProtocolURL = protocolUrl;
    },

    addNewApplet(appletPassword) {
      this.appletPasswordDialog = false;

      const encryptionInfo = encryption.getAppletEncryptionInfo({
        appletPassword: appletPassword,
        accountId: this.$store.state.currentAccount.accountId,
      });

      const encryptionForm = new FormData();
      encryptionForm.set(
        "encryption",
        JSON.stringify({
          appletPublicKey: Array.from(encryptionInfo.getPublicKey()),
          appletPrime: Array.from(encryptionInfo.getPrime()),
          base: Array.from(encryptionInfo.getGenerator()),
        })
      );

      api
        .addNewApplet({
          protocolUrl: this.newProtocolURL,
          email: this.$store.state.userEmail,
          token: this.$store.state.auth.authToken.token,
          apiHost: this.$store.state.backend,
          data: encryptionForm,
        })
        .then((resp) => {
          this.newProtocolURL = "";
          this.onAppletUploadSuccessful(resp.data.message);
        })
        .catch((e) => {
          this.onAppletUploadError();
        });
    },
    
    onAppletUploadSuccessful(message) {
      this.dialogTitle = this.$t('uploadReceived');
      this.dialogText = message;
      this.dialog = true;
    },
    onAppletUploadError() {
      this.dialogTitle = this.$t('uploadError');
      this.dialogText = this.$t('appletUploadError');
      this.dialog = true;
    },
    onAppletPasswordChanged() {
      this.getAccountData().then(() => {
        this.dialogText = this.$t('appletPasswordUpdated');
        this.dialogTitle = this.$t('appletEncryptionUpdate');
        this.dialog = true;
      })
    },
    onOwnerShipInviteSuccessful(email) {
      this.dialogText = this.$t('requestSuccess', { email });
      this.dialogTitle = this.$t('requestSent');
      this.dialog = true;
    },
    onOwnerShipInviteError() {
      this.dialogText = this.$t('requestTransferFailed',);
      this.dialogTitle = this.$t('requestFailed');
      this.dialog = true;
    },
    onDuplicateRequestReceived(message) {
      this.dialogText = message;
      this.dialogTitle = this.$t('appletDuplication');
      this.dialog = true;
    },
    onRefreshAppletRequestReceived(message) {
      this.dialogText = message;
      this.dialogTitle = this.$t('refreshing');
      this.dialog = true;
    },
  },
};
</script>
