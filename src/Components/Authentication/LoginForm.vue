<template>
  <div>
    <v-card class="elevation-12">
      <v-toolbar
        color="primary"
        dark
        flat
      >
        <v-toolbar-title>Login</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <p>
          Log into your Mindlogger account at {{ $store.state.backend }}
          <v-btn
            icon
            style="margin: 0px;"
            @click="onSetBackend"
          >
            <v-icon
              small
              color="primary"
            >
              edit
            </v-icon>
          </v-btn>
        </p>
        <v-form>
          <v-text-field
            v-model="username"
            label="username"
            prepend-icon="mdi-account"
          />

          <v-text-field
            v-model="password"
            label="password"
            type="password"
            prepend-icon="lock"
          />
        </v-form>

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
        this.$router.push('/applets')
      }).catch((e) => {
        this.error = e.message === 'Request failed with status code 401' ? 'Invalid credentials' : e.message;
      });
    },
    onCreateAccount() {
      this.$emit('createAccount', null);
    },
    onSetBackend() {
      this.$emit('setBackend', null);
    },
  }

};
</script>
