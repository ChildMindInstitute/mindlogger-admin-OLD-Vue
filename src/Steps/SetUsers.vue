<template>
  <div>
    <div v-if="status === 'loading'" class="loading">
      <v-progress-circular color="primary" indeterminate />
    </div>
    <div v-else>
      <h1>Active Users</h1>
      <active-user-table
        ref="userTableRef"
        key="componentKey"
        :users="activeUserList"
        :appletId="$route.params.appletId"
      />

      <div v-if="hasRoles('manager', 'coordinator')">
        <h1>Pending Invitations</h1>
        <pending-invite-table :users="pendingInviteList" />
        <create-invitation-form @createInvitation="createInvitation" />
        <div style="height: 58px;" />
      </div>
    </div>

    <div class="tools">
      <!-- EXPORT BUTTON -->
      <v-tooltip
        v-if="hasRoles('owner', 'manager', 'coordinator', 'reviewer')"
        top
      >
        <template v-slot:activator="{ on }">
          <v-btn fab color="primary" @click="openPasswordModal" v-on="on">
            <v-icon>mdi-export-variant</v-icon>
          </v-btn>
        </template>
        <span>Export user's data</span>
      </v-tooltip>

      <!-- CALENDAR BUTTON -->
      <v-tooltip v-if="hasRoles('owner', 'manager', 'coordinator')" top>
        <template v-slot:activator="{ on }">
          <v-btn fab color="primary" @click="viewCalendar" v-on="on">
            <v-icon>mdi-calendar</v-icon>
          </v-btn>
        </template>
        <span>View schedule for the selected users</span>
      </v-tooltip>

      <!-- DASHBOARD BUTTON -->
      <v-tooltip v-if="dashboardEnabled" top>
        <template v-slot:activator="{ on }">
          <v-btn fab color="primary" @click="viewDashboard" v-on="on">
            <v-icon>mdi-chart-bar</v-icon>
          </v-btn>
        </template>
        <span>View the applet dashboard for the selected users</span>
      </v-tooltip>
    </div>

    <UserPassword
      v-model="userPasswordDialog"
      :error="exportError"
      @set-password="exportUsersData"
      @remove-error="exportRemoveError"
    />

    <footer class="footer">
      <!-- BACK BUTTON -->
      <v-btn color="primary" @click="$router.go(-1)">
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
import ActiveUserTable from "../Components/Users/ActiveUserTable.vue";
import PendingInviteTable from "../Components/Users/PendingInviteTable.vue";
import CreateInvitationForm from "../Components/Users/CreateInvitationForm.vue";
import UserPassword from "../Components/Users/UserPassword.vue";
import api from "../Components/Utils/api/api.vue";

export default {
  name: "SetUsers",
  components: {
    ActiveUserTable,
    PendingInviteTable,
    CreateInvitationForm,
    UserPassword,
  },
  data: () => ({
    status: "loading",
    componentKey: 0,
    userPasswordDialog: false,
    exportError: "",
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

    console.log("this.currentApplet.roles: ", this.currentApplet.roles);
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
    openPasswordModal() {
      this.userPasswordDialog = true;
      this.$refs.userTableRef.getSelectedNodes();
    },
    exportRemoveError() {
      this.exportError = "";
      this.userPasswordDialog = false;
    },
    exportUsersData(appletPassword) {
      this.userPasswordDialog = false;

      const appletId = this.currentApplet.applet["_id"].replace("applet/", "");
      const payload = {
        users: this.currentUsers.join(","),
        password: appletPassword,
        format: "CSV",
      };

      api
        .getUsersData({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          appletId: appletId,
          options: payload,
        })
        .then((resp) => {
          let anchor = document.createElement("a");
          anchor.href =
            "data:text/csv;charset=utf-8," + encodeURIComponent(resp.data);
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

    /**
     * Fetches the listing of users for the current applet.
     *
     * @return {void}
     */
    getAppletUsers() {
      api
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

    /**
     * Navigates to the token dashboard page.
     *
     * @return {void}
     */
    viewDashboard() {
      const { appletId } = this.$route.params;

      // Update the app state with the selected users.
      this.$refs.userTableRef.getSelectedNodes();
      this.$router.push({
        path: `/applet/${appletId}/dashboard`,
        query: { users: this.$store.state.currentUsers },
      });
    },
  },
};
</script>
