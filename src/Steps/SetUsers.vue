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
        :users="activeUserList"
      />
      <h1>Pending Users</h1>
      <pending-user-table
        :users="pendingUserList"
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
import ActiveUserTable from '../Components/UserTables/ActiveUserTable.vue';
import PendingUserTable from '../Components/UserTables/PendingUserTable.vue';
import api from '../Components/Utils/api/api.vue';

export default {
  name: 'Users',
  components: {
    ActiveUserTable,
    PendingUserTable,
  },
  data: () => ({
    status: 'loading',
  }),
  computed: {
    readyToContinue() {
      return true;
    },
    currentApplet( ) {
      return this.$store.state.currentApplet;
    },
    activeUserList() {
      return this.$store.state.currentApplet.users.active;
    },
    pendingUserList() {
      return this.$store.state.currentApplet.users.pending;
    },
    currentAppletReady() {
      return !_.isEmpty(this.currentApplet);
    },
  },
  mounted() {
    this.getAppletUsers();
  },
  methods: {
    getAppletUsers() {
      console.log('getting applet users');
      api.getAppletUsers({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        appletId: this.currentApplet.applet._id.split('applet/')[1],
      }).then((resp) => {
        console.log('got applet users', resp.data);
        this.$store.commit('setUsers', resp.data);
        this.status = 'ready'
      });
    },
    continueAction() {
      return true;
    },
  }
}
</script>
