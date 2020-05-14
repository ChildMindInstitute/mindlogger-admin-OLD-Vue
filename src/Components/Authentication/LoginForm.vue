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
            v-model="email"
            label="Email"
            prepend-icon="mdi-account"
          />

          <v-text-field
            v-model="password"
            label="Password"
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
        <p 
          class="ml-32 text-underline"
          @click="onForgotPassword"
        >
          Forgot Password?
        </p>
        <v-btn
          class="ml-32"
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
    email: '',
    password: '',
    error: '',
  }),

  methods: {
    login() {
      this.error = '';
      api.signIn({
        apiHost: this.$store.state.backend,
        user: this.email,
        password: this.password
      }).then((resp) => {
        this.$store.commit('setAuth', {auth: resp.data, email: this.email});
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
    onForgotPassword() {
      this.$emit('forgotPassword', null);
    },
  }

};
</script>

<style lang="scss" scoped>
  .ml-32 {
    margin-left: 32px;
  }
  .text-underline {
    text-decoration: underline;
    user-select: none;
    cursor: pointer;
  }
</style>