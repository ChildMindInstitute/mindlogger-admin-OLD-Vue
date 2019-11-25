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
        key="componentKey"
        :users="activeUserList"
      />
      <h1>Pending Invitations</h1>
      <pending-invite-table
        key="componentKey"
        :users="pendingInviteList"
      />
      <create-invitation
        @createInvitation="createInvitation"
      />
    </div>
  </div>
</template>

<style scoped>
  .loading {
    text-align: center;
  }
</style>

<script>
import _ from 'lodash';
import ActiveUserTable from '../Components/Users/ActiveUserTable.vue';
import PendingInviteTable from '../Components/Users/PendingInviteTable.vue';
import CreateInvitation from '../Components/Users/CreateInvitation.vue'
import api from '../Components/Utils/api/api.vue';

export default {
  name: 'Users',
  components: {
    ActiveUserTable,
    PendingInviteTable,
    CreateInvitation,
  },
  data: () => ({
    status: 'loading',
    componentKey: 0,
  }),
  computed: {
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
        this.status = 'ready';
      } else {
        this.status = 'loading';
      }
    }
  },
  methods: {
    continueAction() {
      return true;
    },
    updateTables() {
      this.componentKey += 1;
    },
    createInvitation() {
      this.status = 'loading';
      api.getAppletInvitation({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        appletId: this.currentApplet.applet._id.split('applet/')[1],
      }).then((resp) => {
        this.updateTables();
        this.status = 'ready';
      }).catch((e) => {
        this.error = e;
        this.status = 'error';
      });
    }
  }
}
</script>
