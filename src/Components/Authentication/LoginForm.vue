<template>
  <div>
    <h1 style="text-align: center">
      Login
    </h1>
    <v-card>
      <v-card-text>
        <p>
          Log into your Mindlogger account hosted at {{ $store.state.backend }}
        </p>
        <v-text-field
          v-model="username"
          label="username"
        />

        <v-text-field
          v-model="password"
          label="password"
          type="password"
        />

        <div
          v-if="error"
          class="error"
        >
          {{ error }}
        </div>

        <v-btn
          color="primary"
          @click="login"
        >
          Login
        </v-btn>
        <v-btn
          outline
          color="primary"
          @click="onCreateAccount"
        >
          Create Account
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<style>
  .error {
    color: 'red';
  }
</style>

<script>
// load our api bit component from mindlogger-web
import api from '../Utils/api/api.vue';
import _ from 'lodash';

export default {
  name: 'Login',

  data: () => ({
    username: '',
    password: '',
    error: '',
  }),

  methods: {
    /**
     * the login method: sign in and then
     * save the response to the store
     */
    login() {
      this.error = '';
      api.signIn({
        apiHost: this.$store.state.backend,
        user: this.username,
        password: this.password
      }).then((resp) => {
        console.log(resp);
        this.$store.commit('setAuth', resp.data);
      }).catch((e) => {
        this.error = e.message === 'Request failed with status code 401' ? 'Invalid credentials' : e.message;
      });
    },
    onCreateAccount() {
      this.$emit('createAccount', null);
    }
  }

};
</script>