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
              :multiSelectionEnabled="false"
              :currentRole="tabNameToRole[tab]"
              :reloading="tabData[tab].loading"
              @userDataReloaded="tabData[tab].loading = false"
            />
          </v-card>
          <v-card
            v-else
            flat
          >
            <UserList
              :getUserList="getUserList"
              :multiSelectionEnabled="false"
              :currentRole="tabNameToRole[tab]"
              :reloading="tabData[tab].loading"
              @userDataReloaded="tabData[tab].loading = false"
              @onEditRoleSuccessfull="onEditRoleSuccessfull"
            />
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
import config from "../config";
import AppletList from "../Components/Applets/AppletList";
import UserList from "../Components/Users/UserList";
import AppletUpload from "../Components/Utils/dialogs/AppletUpload.vue";
import AppletPassword from "../Components/Utils/dialogs/AppletPassword.vue";
import encryption from "../Components/Utils/encryption/encryption.vue";
import AppletDirectoryManager from "@/Components/Applets/AppletDirectoryManager.js";

window.Parse = Parse;
window.Day = Day;
export default {
  name: "Dashboard",
  mixins: [AppletDirectoryManager],
  components: {
    Loading,
    Information,
    AppletList,
    AppletUpload,
    AppletPassword,
    UserList,
  },
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
    },
  },
  watch: {
    $route(to, from) {
      this.status = 'loading';
      this.getAccountData();
    },
    accountApplets(newApplets, oldApplets) {
      this.appletUploadEnabled = false;

      for (let applet of newApplets) {
        /** manager and editors can view applets */
        if (applet.roles.includes('editor') || applet.roles.includes('manager')) {
          this.appletUploadEnabled = true;
        }
      }

      if (newApplets.length !== oldApplets.length) {
        this.setVisibleTabs();
      }

      if (newApplets.length < oldApplets.length) {
        this.onSwitchTab('applets');
      }
    }
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
    setVisibleTabs() {
      this.tabs = [];

      if (this.accountApplets.length && !this.tabs.find(tab => tab === 'applets')) {
        this.tabs.push('applets');
      }
      for (let tab of ['users', 'reviewers', 'editors', 'coordinators', 'managers']) {
        const role = this.tabNameToRole[tab];

        this.getUserList(role).then(resp => {
          if (resp.data.total > 0) {
            this.tabs.push(tab);
          }
        });
      }
    },
    onSwitchTab(tab) {
      if (tab == 'applets') {
        this.getAccountData();
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
    onEditRoleSuccessfull() {
      this.onSwitchTab(this.tabs[this.selectedTab]).then((resp) => {
        this.dialog = true;
        this.dialogText = this.$t('organizerRoleUpdateSuccess');
        this.dialogTitle = this.$t('organizerRoleUpdate');
      })
    },
    reloadTabData()
    {
      this.onSwitchTab(this.tabs[this.selectedTab])
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
    async getAccountData() {
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
        .then(async (resp) => {
          this.$store.commit("switchAccount", resp.data.account);
          this.$set(this.tabData, 'applets', {
            list: resp.data.account.applets,
            loading: false
          });
          await this.setupApplets();
          this.status = "ready";
        })
        .catch((err) => {
          console.warn(err);
        });
    },


    async setupApplets() {
      const { fullDirectory, appletsOnly } = await this.getOrganisedAppletsDirectory();
      this.$store.commit("setFullDirectory", fullDirectory);
      this.$store.commit("setCurrentAccountApplets", appletsOnly);
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
    }
  },
};
</script>