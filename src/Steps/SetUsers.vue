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
    status: 'loading'
  }),
  computed: {
    isUsersLoaded() {
      return !_.isEmpty(this.$store.state.users);
    },
    activeUserList() {
      return this.$store.state.users.active;
    },
    pendingUserList() {
      return this.$store.state.users.pending;
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
  }
}
</script>
