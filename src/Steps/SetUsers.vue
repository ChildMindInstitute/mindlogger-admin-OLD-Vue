<template>
  <div>
    <user-table :groups="groups" :items="items"
     v-on:addUser="addUser">
      <template slot="header" v-slot:header>
        <h1>Users</h1>
        <p>
          Send invitations to your users to participate in 
          <b>{{$store.state.currentApplet.applet['skos:prefLabel']}}</b>
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
    groups() {
      return _.map(this.$store.state.currentApplet.groups, (g) => ({text: g.name}));
    }
  },
  data: () => ({

    // groups: [{
    //   text: 'all',
    // },
    // {
    //   text: 'anisha',
    // },
    // {
    //   text: 'testers'
    // }],
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
  }
}
</script>
