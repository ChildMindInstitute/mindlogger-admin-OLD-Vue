<template>
  <div>
    <h1 style="text-align: center">
      Create Account
    </h1>
    <v-card>
      <v-card-text>
        <p>
          Create a new Mindlogger account hosted at {{ $store.state.backend }}
        </p>
        <v-text-field
          v-model="username"
          label="username"
        />

        <v-text-field
          v-model="displayName"
          label="display name"
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
          outlined
          color="primary"
          @click="onLogin"
        >
          Login
        </v-btn>
        <v-btn
          color="primary"
          @click="createAccount"
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
    displayName: '',
    password: '',
    error: '',
  }),

  methods: {
    createAccount() {
      this.error = '';
      api.signUp({
        apiHost: this.$store.state.backend,
        body: {
          login: this.username,
          displayName: this.displayName,
          password: this.password
        }
      }).then((resp) => {
        const auth = {
          'authToken': resp.data.authToken,
          'user': {
            '_id': resp.data._id,
            'login': resp.data.login,
            'displayName': resp.data.displayName
          }
        };
        this.$store.commit('setAuth', auth);
      }).catch((e) => {
        this.error = e.message;
      });
    },
    onLogin() {
      this.$emit('login', null)
    }
  }

};
</script>