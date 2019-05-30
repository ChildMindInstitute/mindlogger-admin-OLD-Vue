<template>
  <div>
    <user-table :groups="groups" :items="items">
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
import UserTable from '../Custom/UserTable';

export default {
  name: 'users',
  components: {
    UserTable,
  },
  data: () => ({

    groups: [{
      text: 'all',
    },
    {
      text: 'anisha',
    },
    {
      text: 'testers'
    }],
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
}
</script>
