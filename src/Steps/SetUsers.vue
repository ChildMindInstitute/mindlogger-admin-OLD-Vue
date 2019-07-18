<template>
  <div>
    <user-table :groups="groups" :items="items"
     v-on:addUser="addUser"
     v-on:addGroupToSelected="addGroupToSelected"
     v-on:sendInvitationEmail="sendInvitationEmail"
     v-on:removeFromGroup="removeFromGroup"
     >
      <template slot="header" v-slot:header>
        <h1>Users</h1>
        <p>
          Send invitations to your users to participate in 
          <b v-if="currentAppletReady">{{$store.state.currentApplet.applet['skos:prefLabel']}}</b>
        </p>
      </template>
      <template slot="add">
        <p>Add a new user by their email address</p>
      </template>
    </user-table>
  </div>
</template>

<script>
import _ from 'lodash';
// this is a table that renders users and groups.
import UserTable from '../Custom/UserTable';
import adminApi from '../Custom/Utils/api';


export default {
  name: 'users',
  components: {
    UserTable,
  },
  computed: {
    /**
     * shortcut to currentApplet in the store
     */
    currentApplet( ) {
      return this.$store.state.currentApplet;
    },
    /**
     * make sure the currentApplet isn't empty
     */
    currentAppletReady() {
      return !_.isEmpty(this.currentApplet);
    },
    /**
     * parse the groups and get it in the format for 
     * the component.
     */
    groups() {
      if (this.currentApplet) {
        return _.map(this.currentApplet.groups, (g) => ({text: g.name}));
      }
    },
    /**
     * items for the user table. Get it from the store
     * or initialize it to empty.
     */
    items() {
       if (this.currentApplet) {
         const groupedUsers = _.groupBy(this.currentApplet.users, 'email');
         const newUsers = [];
         _.map(groupedUsers, (val, key) => {
           const groups = [];
           _.map(val, v => {
             groups.push(v.groups[0]);
           });
           const entry = { email: key, id: val[0]._id, groups }
           newUsers.push(entry);
         });
         return newUsers; // this.currentApplet.users || [];
       }
       return [];
    }
  },
  data: () => ({

  }),
  watch: {
    currentApplet() {

    },
  },
  mounted() {

  },
  methods: {
    /**
     * add a user to the table
     */
    addUser(email, group) {
      const itemsCopy = [...this.items];
      itemsCopy.push({
        email,
        groups: [{name: group, active: true}],
        status: 'pending',
      });

      this.$store.commit('setUsers', itemsCopy);
      /**
       * TODO: tell the server the new users, and in the response
       * we should get the new user list that we should then set
       * in the store (take the above line and put it in the 'then' of
       * the axios call)
       */

      this.sendServerInvite(email, group);

    },
    /**
     * send an invite to the server
     */
    sendServerInvite(email, group) {
      console.log(email, group, this.$store.state.currentApplet);
      const groupObj = _.filter(this.$store.state.currentApplet.groups, g => g.name === group)[0];
      const groupId = groupObj.id;
      console.log(groupId);
      return adminApi.inviteToRoleByEmail({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        email: email,
        groupId,
      }).then((resp) => {
        console.log('response from inviteToRole', resp);
      });
    },
    /**
     * add groups to the selected users
     */
    addGroupToSelected(group, selected) {
      // console.log(group, selected);
      // const itemsCopy = [...this.items];
      // const emails = _.map(selected, s => s.email);
      // _.map(itemsCopy, (item) => {
      //   if (emails.indexOf(item.email) > -1) {
      //     // remove any inactive groups
      //     // item.groups = _.filter(item.groups, i => i.active);
      //     // its selected, append to this item's group
      //     // if its not already there
      //     const existingGroups = _.map(item.groups, ii => ii.name);
      //     if (existingGroups.indexOf(group) < 0) {
      //       item.groups.push({
      //         role: group,
      //         // active: true,
      //       });
      //     }
      //   }
      // });
      // commit to the store
      // this.$store.commit('setUsers', itemsCopy);

      // TODO: tell the server the new user groups
      // and then commit to the store only after
      // a successful axios call.
      _.map(selected, user => {
        const email = user.email;
        this.sendServerInvite(email, group).then(() => {
          // TODO: get the updated user table and setUsers
          this.getGroupTable();
        });
      });
    },
    /**
     * send an invitation email to a user
     */
    sendInvitationEmail(email, group) {
      this.sendServerInvite(email, group);
    },
    /**
     * update the group table
     */
    getGroupTable() {
      adminApi.getGroupTable({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        appletId: this.currentApplet.applet._id.split('applet/')[1],
      }).then((resp) => {
        this.$store.commit('setUsers', resp.data);
      });
    },
    /**
     * remove a user from a group
     */
    removeFromGroup(groupInfo, userInfo) {
      console.log('need to remove', groupInfo, 'from', userInfo);
      // TODO: connect to this function
      adminApi.deleteUserFromRole({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        groupId: groupInfo._id,
        userId: userInfo.id,
      }).then((resp) => {
        console.log('resp', resp);
        this.getGroupTable();
      });
    },
  }
}
</script>
