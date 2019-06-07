<template>
  <div>
    <user-table :groups="groups" :items="items"
     v-on:addUser="addUser"
     v-on:addGroupToSelected="addGroupToSelected"
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
         return this.currentApplet.users || [];
       }
       return [];
    }
  },
  data: () => ({
    /**
     * TODO: read the table items from the store
     */
    // items: [
    //   {
    //     email: 'anishakeshavan@gmail.com',
    //     groups: [{name: 'all', active: true}],
    //     status: 'accepted',
    //   },
    //   {
    //     email: 'someuser@test.com',
    //     groups: [{name: 'all', active: true}, {name: 'anisha', active: true}],
    //     status: 'pending',
    //   }
    // ],
  }),
  methods: {
    /**
     * add a user to the table
     * TODO: push to the store
     */
    addUser(email, group) {
      const itemsCopy = [...this.items];
      itemsCopy.push({
        email,
        groups: [{name: group, active: true}],
        status: 'pending',
      });
      this.$store.commit('setUsers', itemsCopy);
    },
    /**
     * add groups to the selected users
     * TODO: save to store!
     */
    addGroupToSelected(group, selected) {
      const itemsCopy = [...this.items];
      const emails = _.map(selected, s => s.email);
      _.map(itemsCopy, (item) => {
        if (emails.indexOf(item.email) > -1) {
          // remove any inactive groups
          item.groups = _.filter(item.groups, i => i.active);
          // its selected, append to this item's group
          // if its not already there
          const existingGroups = _.map(item.groups, ii => ii.name);
          if (existingGroups.indexOf(group) < 0) {
            item.groups.push({
              name: group,
              active: true,
            });
          }
        }
      });
      // commit to the store
      this.$store.commit('setUsers', itemsCopy);
    }
  }
}
</script>
