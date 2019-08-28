<template>
  <v-container>
    <v-layout row wrap>
        <v-flex v-if="notLoggedIn">
          <h1 style="text-align: center">Login</h1>
                    <v-card>
            <v-card-text>

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
            </v-card-text>
                    </v-card>
        </v-flex>
        <v-flex v-else>
                    <v-card>
            <v-card-text>
          <h1 style="text-align: center">Hello, {{auth.user.login}}</h1>
          <p>Click "continue" or <v-btn @click="logout" color="primary">Logout</v-btn></p>
            </v-card-text></v-card>
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
// load our api bit component from mindlogger-web
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
    /**
     * only let the user continue if they are authenticated
     */
    readyToContinue() {
      if (!_.isEmpty(this.auth)) {
        return true;
      }
      return false;
    },
    /**
     * a boolean value for whether or not the user is logged in
     */
    notLoggedIn() {
      return _.isEmpty(this.auth);
    },
    /**
     * return the auth value from the store.
     */
    auth() {
      return this.$store.state.auth;
    }
  },

  mounted() {
  },

  methods: {
    /**
     * nothing to do when continue is pressed
     */
    continueAction() {

    },
    /**
     * the login method: sign in and then
     * save the response to the store
     */
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
    /**
     * clear the store on logout.
     */
    logout() {
      this.$store.commit('setAuth', {});
    }
  },

};
</script>


