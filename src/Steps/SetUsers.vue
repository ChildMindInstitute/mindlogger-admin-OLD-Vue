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
        key="componentKey"
        :users="activeUserList"
      />

      <div v-if="hasRoles('manager', 'coordinator')">
        <h1>Pending Invitations</h1>
        <pending-invite-table :users="pendingInviteList" />
        <create-invitation-form @createInvitation="createInvitation" />
        <div style="height: 58px;" />
      </div>

    </div>
    <v-btn
      color="primary"
      fixed
      bottom
      left
      @click="$router.go(-1)"
    >
      Back
    </v-btn>
    <v-tooltip top v-if="['owner', 'manager', 'coordinator'].includes(currentApplet.role)">
      <template v-slot:activator="{ on }">
        <v-btn
          color="primary"
          fixed
          bottom
          right
          fab
          style="bottom: 70px; right: 40px;"
          @click="viewCalendar"
          v-on="on"
        >
          <v-icon>mdi-calendar</v-icon>
        </v-btn>
      </template>
      <span>View schedule for the selected users</span>
    </v-tooltip>

    <v-tooltip top v-if="dashboardEnabled">
      <template v-slot:activator="{ on }">
        <v-btn
          color="primary"
          fixed
          bottom
          right
          fab
          style="bottom: 70px; right: 110px;"
          @click="viewDashboard"
          v-on="on"
        >
          <v-icon>mdi-chart-line</v-icon>
        </v-btn>
      </template>
      <span>View the applet dashboard for the selected users</span>
    </v-tooltip>
  </div>
</template>

<style scoped>
.loading {
  text-align: center;
}
</style>

<script>
import _ from "lodash";
import ActiveUserTable from "../Components/Users/ActiveUserTable.vue";
import PendingInviteTable from "../Components/Users/PendingInviteTable.vue";
import CreateInvitationForm from "../Components/Users/CreateInvitationForm.vue";
import api from "../Components/Utils/api/api.vue";

export default {
  name: "SetUsers",
  components: {
    ActiveUserTable,
    PendingInviteTable,
    CreateInvitationForm
  },
  data: () => ({
    status: "loading",
    componentKey: 0
  }),
  computed: {
    dashboardEnabled() {
      const hasPermission = this.currentApplet.roles.some(role => 
        ['owner', 'reviewer', 'manager'].includes(role)
      );
      const id = this.currentApplet.applet['@id'];
      const isTokenLogger = id.includes('TokenLogger') || id.includes('TokenCollector');

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
      this.getAppletUsers()
    },
  },
  mounted() {
    this.$store.commit('setUsers', []);
    this.getAppletUsers();
  },
  methods: {
    hasRoles() {
      return [].some.call(
        arguments, 
        role => this.currentApplet.roles.includes(role),
      );
    },
    updateTables() {
      this.componentKey += 1;
    },
    createInvitation(invitationOptions) {
      this.status = "loading";

      api
        .getAppletInvitation({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          appletId: this.currentApplet.applet._id.split("applet/")[1],
          options: invitationOptions
        })
        .then(resp => {
          if (invitationOptions.role !== "user" && invitationOptions.accountName) {
            this.setAccountName(invitationOptions.accountName);
          }
          this.getAppletUsers();
        })
        .catch(e => {
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
          appletId: this.$route.params.appletId
        })
        .then(resp => {
          this.$store.commit("setUsers", resp.data);
          this.updateTables();
          this.status = "ready";
        })
        .catch(e => {
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
          accountName
        })
        .then(resp => {
          this.$store.commit('setAccountName', accountName);
          console.log(resp);
        })
        .catch(err => {
          console.warn(err);
        })
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
