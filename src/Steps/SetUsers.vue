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
import UserTable from '../Custom/UserTable';

export default {
  name: 'users',
  components: {
    UserTable,
  },
  computed: {
    currentApplet( ) {
      return this.$store.state.currentApplet;
    },
    currentAppletReady() {
      return !_.isEmpty(this.currentApplet);
    },
    groups() {
      if (this.currentApplet) {
        return _.map(this.currentApplet.groups, (g) => ({text: g.name}));
      }
      
    }
  },
  data: () => ({

    items: [
      {
        email: 'anishakeshavan@gmail.com',
        groups: [{name: 'all', active: true}],
        status: 'accepted',
      },
      {
        email: 'someuser@test.com',
        groups: [{name: 'all', active: true}, {name: 'anisha', active: true}],
        status: 'pending',
      }
    ],
  }),
  methods: {
    addUser(email, group) {
      this.items.push({
        email,
        groups: [{name: group, active: true}],
        status: 'pending',
      });
    },
    addGroupToSelected(group, selected) {
      const emails = _.map(selected, s => s.email);
      _.map(this.items, (item) => {
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
    }
  }
}
</script>
