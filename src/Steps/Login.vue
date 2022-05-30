<template>
  <v-container
    fluid
    fill-height
  >
    <v-layout
      v-if="!loading"
      align-center
      justify-center
    >
      <v-flex
        xs12
        sm8
        md4
      >
        <SetBackendForm
          v-if="setBackend"
          @setBackend="toggleSetBackend"
        />
        <LoginForm
          v-else-if="!createAccount && !forgotPassword"
          @createAccount="toggleCreateAccount"
          @forgotPassword="toggleForgotPassword"
          @setBackend="toggleSetBackend"
          @loginSuccess="loginSuccess"
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
          {{ $t("close") }}
        </v-btn>
      </v-snackbar>
    </v-layout>
  </v-container>
</template>

<style scoped>
.error {
  color: "red";
}
</style>

<script>
import _ from "lodash";
import LoginForm from "../Components/Authentication/LoginForm.vue";
import CreateUserForm from "../Components/Authentication/CreateUserForm.vue";
import ForgotPasswordForm from "../Components/Authentication/ForgotPasswordForm.vue";
import SetBackendForm from "../Components/Authentication/SetBackendForm.vue";
import { AccountMixin } from '../Components/Utils/mixins/AccountMixin';
import api from "../Components/Utils/api/api.vue";

export default {
  name: "Login",
  components: {
    LoginForm,
    CreateUserForm,
    ForgotPasswordForm,
    SetBackendForm,
  },
  mixins: [AccountMixin],

  data: () => ({
    color: "#0abb8a",
    createAccount: false,
    setBackend: false,
    forgotPassword: false,
    snackAlert: false,
    timeout: 3000,
    text: "",
    loading: true
  }),
  created() {
    this.text = this.$t("resetEmailSent");
  },
  async beforeMount() {
    const { token } = this.$route.query;

    if (token) {
      try {
        const resp = await api.getUserDetails({
          apiHost: this.apiHost,
          token,
        });

        if (resp.data) {
          this.setAuth({
            auth: {
              authToken: {
                token
              }
            }
          });

          this.loginSuccess();
        }
      } catch (e) {
        console.log('token error', e.response.data.message);
      }
    }

    this.loading = false;
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
    toggleSetBackend() {
      this.setBackend = !this.setBackend;
    },
    loginSuccess() {
      if (this.$route.query.nextUrl) {
        this.$router.push(this.$route.query.nextUrl).catch(err => {});
      } else {
        this.$router.push("/dashboard").catch(err => {});
      }
    },
  },
};
</script>
