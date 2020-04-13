<template>
  <v-container>
    <v-layout>
      <v-flex v-if="notLoggedIn">
        <SetBackendForm
          v-if="setBackend"
          @setBackend="toggleSetBackend"
        />
        <LoginForm
          v-else-if="!createAccount && !forgotPassword"
          @createAccount="toggleCreateAccount"
          @forgotPassword="toggleForgotPassword"
          @setBackend="toggleSetBackend"
        />
        <CreateUserForm
          v-else-if="createAccount && !forgotPassword"
          @login="toggleCreateAccount"
          @setBackend="toggleSetBackend"
        />
        <ForgotPasswordForm
          v-else
          @login="toggleForgotPassword"
          @sendRequest="handleSendRequest"
        />
      </v-flex>
      <v-flex v-else>
        <v-card>
          <v-card-text>
            <h1 style="text-align: center">
              Hello, {{ auth.user.login }}
            </h1>
            <p>
              Click "continue" or <v-btn
                color="primary"
                @click="logout"
              >
                Logout
              </v-btn>
            </p>
          </v-card-text>
        </v-card>
      </v-flex>
      
      <v-snackbar
        v-model="snackAlert"
        :color="color"
        :timeout="timeout"
      >
        {{ text }}
        <v-btn
          color="white"
          text
          @click="snackAlert = false"
        >
          Close
        </v-btn>
      </v-snackbar>
    </v-layout>
  </v-container>
</template>

<style scoped>
  .error {
    color: 'red';
  }
</style>

<script>
import _ from 'lodash';
import LoginForm from '../Components/Authentication/LoginForm.vue';
import CreateUserForm from '../Components/Authentication/CreateUserForm.vue';
import ForgotPasswordForm from '../Components/Authentication/ForgotPasswordForm.vue';
import SetBackendForm from '../Components/Authentication/SetBackendForm.vue';

export default {
  name: 'Login',

  components: {
    LoginForm,
    CreateUserForm,
    ForgotPasswordForm,
  },

  data: () => ({
    username: '',
    password: '',
    error: '',
    color: '#0abb8a',
    createAccount: false,
    setBackend: false,
    forgotPassword: false,
    snackAlert: false,
    timeout: 3000,
    text: 'Reset email has been sent',

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

  methods: {
    toggleCreateAccount() {
      this.createAccount = !this.createAccount;
    },
    toggleForgotPassword() {
      this.forgotPassword = !this.forgotPassword;
    },
    handleSendRequest() {
      this.forgotPassword = !this.forgotPassword;
      this.snackAlert = true;
    },
    /**
     * clear the store on logout.
     */
    logout() {
      this.$store.commit('setAuth', {});
    },
    toggleSetBackend() {
      this.setBackend = !this.setBackend;
    }
  },

};
</script>
