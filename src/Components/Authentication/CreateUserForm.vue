<template>
  <div>
    <v-card class="elevation-12">
      <v-toolbar
        color="primary"
        dark
        flat
      >
        <v-toolbar-title>Create Account</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <p>
          Create a new Mindlogger account at {{ $store.state.backend }}
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
            prepend-icon="mdi-account-box-outline"
          />

          <v-text-field
            v-model="firstName"
            label="First Name"
            prepend-icon="mdi-account"
          />
          
          <v-text-field
            v-model="lastName"
            label="Last Name"
            prepend-icon="mdi-account-outline"
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
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    error: '',
  }),

  methods: {
    createAccount() {
      this.error = '';

      api.signUp({
        apiHost: this.$store.state.backend,
        body: {
          email: this.email,
          firstName: this.firstName,
          lastName: this.lastName,
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
        this.$store.commit('setAuth', {auth: auth, email: this.email});
        this.$router.push('/applets')
      }).catch((e) => {
        this.error = e.message;
      });
    },
    onLogin() {
      this.$emit('login', null)
    },
    onSetBackend() {
      this.$emit('setBackend', null);
    },
  }

};
</script>