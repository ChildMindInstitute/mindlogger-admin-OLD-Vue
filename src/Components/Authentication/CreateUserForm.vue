<template>
  <div>
    <h1 style="text-align: center">
      Create Account
    </h1>
    <v-card>
      <v-card-text>
        <p>
          Create a new Mindlogger account hosted at {{ $store.state.backend }}
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
        <v-text-field
          v-model="username"
          label="username"
        />

        <div
          v-if="username == '' && submitted"
          class="error"
        >
          {{ error }}
        </div>

        <v-text-field
          v-model="displayName"
          label="display name"
        />

        <div
          v-if="displayName == '' && submitted"
          class="error"
        >
          {{ error }}
        </div>

        <v-text-field
          v-model="email"
          label="email"
        />

        <div
          v-if="email == '' && submitted"
          class="error"
        >
          {{ error }}
        </div>

        <v-text-field
          v-model="password"
          label="password"
          type="password"
        />

        <div
          v-if="password == '' && submitted"
          class="error"
        >
          {{ error }}
        </div>

        <div
          v-if="errorMsg"
          class="errorMsg"
        >
          {{ errorMsg }}
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
  div.error {
    background-color: white !important;
    color: red;
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
    username: '',
    displayName: '',
    password: '',
    errorMsg: '',
    error: 'This field is required',
    submitted: false,
  }),

  methods: {
    createAccount() {
      // Added simple validation just for now
      
      this.submitted = true;
      if (this.email == '' && this.username == '' && this.password == '' && this.displayName == '') {
        return;
      }
      this.errorMsg = '';
      api.signUp({
        apiHost: this.$store.state.backend,
        body: {
          login: this.username,
          displayName: this.displayName,
          password: this.password,
          email: this.email
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
        this.$router.push('/applets')
      }).catch((e) => {
        this.errorMsg = e.message;
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