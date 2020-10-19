<template>
  <div>
    <div
      v-if="status === 'loading'"
      class="loading"
    >
      <v-progress-circular
        color="primary"
        indeterminate
      />
    </div>
    <div v-else>
      <h1>Active Users</h1>
      <active-user-table
        ref="userTableRef"
        :key="componentKey"
        :users="activeUserList"
        :appletId="$route.params.appletId"
        @reUploadResponse="responseReUploadEvent"
      />

      <div v-if="hasRoles('manager', 'coordinator')">
        <h1>Pending Invitations</h1>
        <pending-invite-table :users="pendingInviteList" />
        <create-invitation-form @createInvitation="createInvitation" />
        <div style="height: 58px;" />
      </div>
    </div>

    <AppletPassword
      ref="appletPasswordRef"
      v-model="appletPasswordDialog"
      :hasConfirmPassword="false"
      @set-password="onClickSubmitPassword"
    />

    <v-dialog
      v-model="responseUpdateDialog.visible"
      max-width="500px"
    >
      <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >
          Refresh response
        </v-card-title>
        <v-card-text> 
          Do you want to refresh {{ responseUpdateDialog.userData.displayName }}'s data on device?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="onReuploadResponse"
          >
            Yes
          </v-btn>
          <v-btn
            color="primary"
            text
            @click="onDeclineReuploading"
          >
            No
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <Information
      v-model="informationDialog"
      :dialogText="informationText"
      :title="'Refresh Response'"
    />

    <div class="tools">
      <!-- EXPORT BUTTON -->
      <v-tooltip
        v-if="hasRoles('owner', 'manager', 'reviewer')"
        top
      >
        <template v-slot:activator="{ on }">
          <v-btn
            fab
            color="primary"
            @click="onUserDataExport"
            v-on="on"
          >
            <v-icon>mdi-export-variant</v-icon>
          </v-btn>
        </template>
        <span>Export user's data</span>
      </v-tooltip>

      <!-- CALENDAR BUTTON -->
      <v-tooltip
        v-if="hasRoles('owner', 'manager', 'coordinator')"
        top
      >
        <template v-slot:activator="{ on }">
          <v-btn
            fab
            color="primary"
            @click="viewCalendar"
            v-on="on"
          >
            <v-icon>mdi-calendar</v-icon>
          </v-btn>
        </template>
        <span>View schedule for the selected users</span>
      </v-tooltip>

      <!-- DASHBOARD BUTTON -->
      <v-tooltip
        v-if="dashboardEnabled"
        top
      >
        <template v-slot:activator="{ on }">
          <v-btn
            fab
            color="primary"
            @click="onReviewerDashboard"
            v-on="on"
          >
            <v-icon>mdi-chart-bar</v-icon>
          </v-btn>
        </template>
        <span>View the applet dashboard for the selected users</span>
      </v-tooltip>
    </div>

    <footer class="footer">
      <!-- BACK BUTTON -->
      <v-btn
        color="primary"
        @click="$router.go(-1)"
      >
        Back
      </v-btn>
    </footer>
  </div>
</template>

<style scoped>
.loading {
  text-align: center;
}

.tools {
  position: fixed;
  bottom: 70px;
  right: 70px;
  left: auto;

  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.tools > *:not(:last-of-type) {
  margin-right: 0.5rem;
}

.footer {
  position: fixed;
  bottom: 16px;
  left: 16px;
  right: auto;
}
</style>

<script>
import _ from "lodash";
import ObjectToCSV from "object-to-csv";

import ActiveUserTable from "../Components/Users/ActiveUserTable.vue";
import PendingInviteTable from "../Components/Users/PendingInviteTable.vue";
import CreateInvitationForm from "../Components/Users/CreateInvitationForm.vue";
import api from "../Components/Utils/api/api.vue";
import AppletPassword from '../Components/Utils/dialogs/AppletPassword'
import encryption from '../Components/Utils/encryption/encryption.vue';
import Applet from '../models/Applet';
import Information from '../Components/Utils/dialogs/information.vue';
import Item from '../models/Item';

export default {
  name: "SetUsers",
  components: {
    ActiveUserTable,
    PendingInviteTable,
    CreateInvitationForm,
    AppletPassword,
    Information,
  },
  data: () => ({
    status: "loading",
    componentKey: 0,
    userPasswordDialog: false,
    exportError: "",
    appletPasswordDialog: false,
    requestedAction: null,
    responseUpdateDialog: {
      visible: false,
      userData: {}
    },
    informationDialog: false,
    informationText: '',
  }),
  computed: {
    dashboardEnabled() {
      const hasPermission = this.hasRoles("owner", "reviewer", "manager");
      const id = this.currentApplet.applet["@id"] || "";
      const isTokenLogger =
        id.includes("TokenLogger") || id.includes("TokenCollector");

      return isTokenLogger && hasPermission;
    },
    isUsersLoaded() {
      return !_.isEmpty(this.$store.state.users);
    },
    activeUserList() {
      return this.$store.state.users.active;
    },
    pendingInviteList() {
      return this.$store.state.users.pending;
    },
    currentApplet() {
      return this.$store.state.currentApplet;
    },
    currentUsers() {
      return this.$store.state.currentUsers;
    },
  },
  watch: {
    isUsersLoaded() {
      if (this.isUsersLoaded) {
        this.status = "ready";
      } else {
        this.status = "loading";
      }
    },
    $route(to, from) {
      this.status = "loading";
      this.getAppletUsers();
    },
  },
  mounted() {
    this.$store.commit("setUsers", []);
    this.getAppletUsers();
  },
  methods: {
    hasRoles() {
      return [].some.call(arguments, (role) =>
        this.currentApplet.roles.includes(role)
      );
    },
    updateTables() {
      this.componentKey += 1;
    },
    onUserDataExport() {
      const encryptionInfo = this.currentApplet.applet.encryption;

      if (!encryptionInfo || !encryptionInfo.appletPrime || encryptionInfo.appletPrivateKey) {
        this.exportUsersData();
      } else {
        this.appletPasswordDialog = true;
        this.requestedAction = this.exportUsersData.bind(this);
      }
    },

    /**
     * export user data for selected users
     */
    exportUsersData() {
      this.$refs.userTableRef.getSelectedNodes();

      this.appletPasswordDialog = false;

      const appletId = this.currentApplet.applet["_id"].replace("applet/", "");
      const payload = {
        users: this.currentUsers.join(",")
      };

      api
        .getUsersData({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          appletId: appletId,
          options: payload,
        })
        .then((resp) => {
          const { data } = resp;
          const activeUsers = this.$store.state.users.active, userIdToData = {};
          for (let user of activeUsers) {
            userIdToData[user['_id']] = user;
          }

          Applet.decryptResponses(data, this.currentApplet.applet.encryption);

          const result = [];

          const currentItems = {};
          for (let itemUrl in this.currentApplet.items) {
            currentItems[itemUrl] = new Item(this.currentApplet.items[itemUrl]);
          }

          for (let itemId in data.items) {
            data.items[itemId] = new Item(data.items[itemId])
          }

          for (let version in data.itemReferences) {
            for (let key in data.itemReferences[version]) {
              if (!data.itemReferences[version][key]) {
                continue;
              }

              const itemId = data.itemReferences[version][key];
              data.itemReferences[version][key] = data.items[itemId];
            }
          }

          for (let response of data.responses) {
            const { MRN, displayName, _id } = userIdToData[response.userId];

            for (let itemUrl in response.data) {
              let itemData = response.data[itemUrl];

              if (itemData.ptr !== undefined && itemData.src !== undefined) {
                response.data[itemUrl] = data.dataSources[itemData.src].data[itemData.ptr];
              }

              let item = (data.itemReferences[response.version] && data.itemReferences[response.version][itemUrl])
                             || currentItems[itemUrl];
              if (!item) {
                continue;
              }

              let options = [];
              let responseData = [];
              if (item.inputType === 'radio') {
                options = item.responseOptions.map(option => `${Object.values(option.name)[0]}: ${option.value}`);
                if (!Array.isArray(response.data[itemUrl])) {
                  response.data[itemUrl] = [response.data[itemUrl]]
                }

                response.data[itemUrl].forEach(val => {
                  if (typeof val === 'string') {
                    let option = item.responseOptions.find(option => Object.values(option.name)[0] === val);
                    if (option) {
                      responseData.push(option.value);
                    }
                  } else {
                    responseData.push(val);
                  }
                });
              } else {
                if (typeof response.data[itemUrl] == 'object' && response.data[itemUrl]) {
                  responseData = Object.keys(response.data[itemUrl]).map(key => `${key}: ${response.data[itemUrl][key]}`);
                } else {
                  responseData = [response.data[itemUrl]];
                }
              }

              result.push({
                id: response._id,
                created: response.created,
                MRN: (MRN || null),
                displayName,
                userId: _id,
                activity: response.activity.name,
                item: itemUrl,
                response: responseData,
                options: options.join(', '),
                version: response.version
              });
            }
          }

          let otc = new ObjectToCSV({ 
            keys: ['id', 'created', 'MRN', 'displayName', 'userId', 'activity', 'item', 'response', 'options', 'version'].map(value => ({ key: value, as: value })),
            data: result, 
          });

          let anchor = document.createElement("a");
          anchor.href =
            "data:text/csv;charset=utf-8," + encodeURIComponent(otc.getCSV());
          anchor.target = "_blank";
          anchor.download = "report.csv";
          anchor.click();
        })
        .catch((e) => {
          this.exportError = e.message;
          this.userPasswordDialog = true;
        });
    },
    createInvitation(invitationOptions) {
      this.status = "loading";

      api
        .getAppletInvitation({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          appletId: this.currentApplet.applet._id.split("applet/")[1],
          options: invitationOptions,
        })
        .then((resp) => {
          if (
            invitationOptions.role !== "user" &&
            invitationOptions.accountName
          ) {
            this.setAccountName(invitationOptions.accountName);
          }
          this.getAppletUsers();
        })
        .catch((e) => {
          this.error = e;
          this.status = "error";
        });
    },

    responseReUploadEvent(user) {
      this.responseUpdateDialog.userData = user;
      this.responseUpdateDialog.visible = true;
    },

    onReuploadResponse() {
      const encryptionInfo = this.currentApplet.applet.encryption;

      this.responseUpdateDialog.visible = false;

      if (encryptionInfo && encryptionInfo.appletPrivateKey) {
        this.updateUserResponse(this.responseUpdateDialog.userData);
      } else {
        this.appletPasswordDialog = true;
        this.requestedAction = this.updateUserResponse.bind(this, this.responseUpdateDialog.userData);
      }
    },

    onDeclineReuploading() {
      this.responseUpdateDialog.visible = false;
      this.informationDialog = true;
      this.informationText = 'Refresh Declined';
    },

    updateUserResponse(userData) {
      let to = new Date();
      let from = new Date();

      to.setDate(to.getDate() + 1);
      from.setDate(from.getDate() - 8);

      const apiHost = this.$store.state.backend;
      const token = this.$store.state.auth.authToken.token;
      const appletId = this.$route.params.appletId;

      api.getUserResponses({
        apiHost, token, appletId,
        users: [userData._id],
        fromDate: from.toISOString(),
        toDate: to.toISOString()
      }).then(({ data }) => {
        Applet.replaceItemValues(Applet.decryptResponses(data, this.currentApplet.applet.encryption));
        Applet.encryptResponses(data, this.currentApplet.applet.encryption, userData.refreshRequest.userPublicKey)

        const form = new FormData();

        form.set('responses', JSON.stringify({ 
          dataSources: Object.keys(data.dataSources).reduce((accumulator, responseId) => {
            accumulator[responseId] = data.dataSources[responseId].data;
            return accumulator;
          }, {}), 
          userPublicKey: userData.refreshRequest.userPublicKey
        }));

        api.replaceResponseData({
          apiHost, token, appletId, data: form
        }).then((msg) => {
          this.getAppletUsers().then(() => {
            this.informationDialog = true;
            this.informationText = 'Refresh Complete';
          });
        })
      })
    },

    /**
     * Fetches the listing of users for the current applet.
     *
     * @return {void}
     */
    getAppletUsers() {
      return api
        .getAppletUsers({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          appletId: this.$route.params.appletId,
        })
        .then((resp) => {
          this.$store.commit("setUsers", resp.data);
          this.updateTables();
          this.status = "ready";
        })
        .catch((e) => {
          this.error = e;
          this.status = "error";
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
          this.$store.commit("setAccountName", accountName);
          console.log(resp);
        })
        .catch((err) => {
          console.warn(err);
        });
    },

    /**
     * Navigates to the applet schedule calendar.
     *
     * @return {void}
     */
    viewCalendar() {
      const { appletId } = this.$route.params;

      this.$refs.userTableRef.getSelectedNodes();
      this.$router.push(`/applet/${appletId}/schedule`);
    },

    onReviewerDashboard() {
      const encryptionInfo = this.currentApplet.applet.encryption;

      if (!encryptionInfo || !encryptionInfo.appletPrime || encryptionInfo.appletPrivateKey) {
        this.gotoDashboard();
      } else {
        this.appletPasswordDialog = true;
        this.requestedAction = this.gotoDashboard.bind(this);
      }
    },

    /** check applet password */
    onClickSubmitPassword(appletPassword) {
      const currentApplet = this.currentApplet;

      const encryptionInfo = encryption.getAppletEncryptionInfo({
        appletPassword,
        accountId: this.$store.state.currentAccount.accountId,
        prime: currentApplet.applet.encryption.appletPrime,
        baseNumber: currentApplet.applet.encryption.base
      });

      if (encryptionInfo.getPublicKey().equals(Buffer.from(currentApplet.applet.encryption.appletPublicKey))) {
        this.appletPasswordDialog = false;

        this.$store.commit("setAppletPrivateKey", {
          appletId: currentApplet.applet._id, 
          key: Array.from(encryptionInfo.getPrivateKey())
        });

        this.requestedAction();
      } else {
        this.$refs.appletPasswordRef.defaultErrorMsg = 'Incorrect applet password';
      }
    },

    /**
     * Navigates to the token dashboard page.
     *
     * @return {void}
     */
    gotoDashboard() {
      const { appletId } = this.$route.params;

      // Update the app state with the selected users.
      this.$refs.userTableRef.getSelectedNodes();
      this.$router.push({
        path: `/applet/${appletId}/dashboard`,
        query: { users: this.$store.state.currentUsers },
      });
    }
  },
};
</script>
