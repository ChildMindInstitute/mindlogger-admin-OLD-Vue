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
          outlined
          color="primary"
          @click="onCreateAccount"
        >
          Create Account
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
  .error {
    color: 'red';
  }

  .v-btn {
    margin: 6px 8px;
  }
</style>

<script>
import api from '../Utils/api/api.vue';
import _ from 'lodash';

export default {
  data: () => ({
    username: '',
    password: '',
    error: '',
  }),

  methods: {
    login() {
      this.error = '';
      api.signIn({
        apiHost: this.$store.state.backend,
        user: this.username,
        password: this.password
      }).then((resp) => {
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
