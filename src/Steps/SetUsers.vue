<template>
  <div>
    <user-table :groups="groups" :items="items"
     v-on:addUser="addUser"
     v-on:addGroupToSelected="addGroupToSelected"
     v-on:sendInvitationEmail="sendInvitationEmail"
     v-on:removeFromGroup="removeFromGroup"
     >
      <template slot="header" v-slot:header>
        <h1 style="text-align: center">Users</h1>
        <p style="text-align: center">
          Send invitations to your users to participate in
          <b v-if="currentAppletReady">{{$store.state.currentApplet.applet['skos:prefLabel']}}</b>
        </p>
        <div style="text-align: center;margin: auto;width:13em;">
          <v-switch style="text-align: center;"
            v-model="openRegValue" label="Open registration"
            color="primary" hint="Users can join without an invitation"
            :persistent-hint="true"/>
        </div>
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
     * ready to continue
     */
    readyToContinue() {
      return true;
    },
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
        // const groupObj = _.filter(this.currentApplet.groups, g => g.name === 'user')[0]
        // eslint-disable-next-line
        // console.log(groupObj || false);
        // this.openReg = groupObj.openRegistration || false;
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
    },
    openRegValue: {
      get() {
        if (this.regstatus === 'loading') {
          return this.openReg
        }
        return this.getOpenRegValue();
      },
      set(newValue) {
        this.openReg = newValue;
        this.sendOpenReg(newValue);
      }
    }
  },
  data: () => ({
    openReg: false,
    regstatus: 'ready',
  }),
  watch: {
    currentApplet() {

    },
    currentAppletReady() {
      if (this.currentAppletReady) {
        this.getOpenRegValue();
      }
    }
  },
  mounted() {
  },
  methods: {
    /**
     * add a user to the table
     */
    addUser(email, group) {
      // const itemsCopy = [...this.items];
      // itemsCopy.push({
      //   email,
      //   groups: [{name: group, active: true}],
      //   status: 'pending',
      // });

      // this.$store.commit('setUsers', itemsCopy);
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
      const groupObj = _.filter(this.currentApplet.groups, g => g.name === group)[0];
      const groupId = groupObj.id;
      return adminApi.inviteToRoleByEmail({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        email: email,
        groupId,
      }).then((resp) => {
        // eslint-disable-next-line
        console.log('response from inviteToRole', resp);
        this.getGroupTable();
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
     * update open/closed registration
     */
    openRegistration(groupId, open) {
      this.regstatus = 'loading'
      adminApi.updateRegistration({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        groupId,
        open
      }).then((resp) => {
        // eslint-disable-next-line
        this.regstatus = 'ready';
        this.openReg = resp.data.openRegistration;
        this.setOpenRegValue(resp.data.openRegistration);
      });
    },
    sendOpenReg(regVal) {
      console.log('sending the openReg parameter.');
      const groupObj = _.filter(this.currentApplet.groups, g => g.name === 'user')[0];
      const groupId = groupObj.id;
      this.openRegistration(groupId, regVal);
    },
    getOpenRegValue() {
      if (this.currentApplet) {
        const groupObj = _.filter(this.currentApplet.groups, g => g.name === 'user')[0]
        // eslint-disable-next-line
        if (groupObj) {
          console.log(groupObj || false);
          console.log('setting the openReg value babsed on the current applet', groupObj.openRegistration);
          return groupObj.openRegistration || false;
        }
      }
      return false;
    },
    setOpenRegValue(val) {
      const groupObjIdx = _.findIndex(this.currentApplet.groups, g => g.name === 'user')
      this.currentApplet.groups[groupObjIdx].openRegistration = val;
    },
    /**
     * update the group table
     */
    getGroupTable() {
      // eslint-disable-next-line
      console.log('getting group table');
      adminApi.getGroupTable({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        appletId: this.currentApplet.applet._id.split('applet/')[1],
      }).then((resp) => {
        // eslint-disable-next-line
        console.log('got group table', resp.data);
        this.$store.commit('setUsers', resp.data);
      });
    },
    /**
     * remove a user from a group
     */
    removeFromGroup(groupInfo, userInfo) {
      // eslint-disable-next-line
      console.log('need to remove', groupInfo, 'from', userInfo);
      // TODO: connect to this function
      adminApi.deleteUserFromRole({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        groupId: groupInfo._id,
        userId: userInfo.id,
      }).then((resp) => {
        this.getGroupTable();
      });
    },
    continueAction() {
      return true;
    },
  }
}
</script>
