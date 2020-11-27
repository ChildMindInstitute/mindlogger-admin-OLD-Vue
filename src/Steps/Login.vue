<template>
  <v-container
    fluid
    fill-height
  >
    <v-layout
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

export default {
  name: "Login",

  components: {
    LoginForm,
    CreateUserForm,
    ForgotPasswordForm,
    SetBackendForm,
  },

  data: () => ({
    color: "#0abb8a",
    createAccount: false,
    setBackend: false,
    forgotPassword: false,
    snackAlert: false,
    timeout: 3000,
    text: "",
  }),
  created() {
    this.text = this.$t("resetEmailSent");
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
  },
};
</script>
