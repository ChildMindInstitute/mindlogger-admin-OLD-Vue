<template>
  <div>
    <active-user-table
      :users="activeUserList"
    />
  </div>
</template>

<script>
import _ from 'lodash';
// this is a table that renders users and groups.
import ActiveUserTable from '../Components/UserTables/ActiveUserTable.vue';
import api from '../Components/Utils/api/api.vue';
import sampleUsers from './sampleData';


export default {
  name: 'Users',
  components: {
    ActiveUserTable,
  },
  data: () => ({
    status: 'loading',
    activeUserList: sampleUsers.active,
  }),
  computed: {
    readyToContinue() {
      return true;
    },
    currentApplet( ) {
      return this.$store.state.currentApplet;
    },
    currentAppletReady() {
      return !_.isEmpty(this.currentApplet);
    },
    items() {
      if (this.currentApplet) {
        const users = sampleUsers;
        console.log('----');
        console.log(users);
        return [];
      }
      return [];
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
