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
          v-else-if="!createAccount"
          @createAccount="toggleCreateAccount"
          @setBackend="toggleSetBackend"
        />
        <CreateUserForm
          v-else
          @login="toggleCreateAccount"
          @setBackend="toggleSetBackend"
        />
      </v-flex>
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
import SetBackendForm from '../Components/Authentication/SetBackendForm.vue';

export default {
  name: 'Login',

  components: {
    LoginForm,
    CreateUserForm,
    SetBackendForm,
  },

  data: () => ({
    createAccount: false,
    setBackend: false,
  }),

  methods: {
    toggleCreateAccount() {
      this.createAccount = !this.createAccount;
    },
    toggleSetBackend() {
      this.setBackend = !this.setBackend;
    }
  },

};
</script>


