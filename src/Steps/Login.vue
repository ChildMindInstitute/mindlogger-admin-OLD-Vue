<template>
  <v-container>
    <v-layout row wrap>
        <v-flex v-if="notLoggedIn">
          <h1>Login</h1>
          <p>
            Log into your Mindlogger account hosted at {{$store.state.backend}}
          </p>
          <v-text-field
            label="username"
            v-model="username"
          ></v-text-field>

          <v-text-field
            label="password"
            v-model="password"
            type="password"
          ></v-text-field>


          <div v-if="this.error.message" class="error">
            {{error.message}}
          </div>

          <v-btn @click="login" color="primary">Login</v-btn>

        </v-flex>
        <v-flex v-else>
          <h1>Hello, {{auth.user.login}}</h1>
          <p>Click "continue" or <v-btn @click="logout" color="primary">Logout</v-btn></p>
        </v-flex>
    </v-layout>
  </v-container>
</template>

<style>
  .error {
    color: 'red';
  }
</style>

<script>
import api from '@bit/akeshavan.mindlogger-web.api';
import _ from 'lodash';

export default {
  name: 'Login',

  data: () => ({
    username: '',
    password: '',
    error: {},
  }),

  computed: {
    readyToContinue() {
      if (!_.isEmpty(this.auth)) {
        return true;
      }
      return false;
    },
    notLoggedIn() {
      return _.isEmpty(this.auth);
    },
    auth() {
      return this.$store.state.auth;
    }
  },

  mounted() {
  },

  methods: {
    continueAction() {

    },
    login() {
      this.error = {};
      api.signIn({
        apiHost: this.$store.state.backend,
        user: this.username,
        password: this.password
      }).then((resp) => {
        this.$store.commit('setAuth', resp.data);
      }).catch((e) => {
        this.error = e;
      });
    },
    logout() {
      this.$store.commit('setAuth', {});
    }
  },

};
</script>


