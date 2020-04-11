<template>
  <v-container>
    <v-layout>
      <v-flex>
        <LoginForm
          v-if="!createAccount"
          @createAccount="toggleCreateAccount"
        />
        <CreateUserForm
          v-else
          @login="toggleCreateAccount"
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

export default {
  name: 'Login',

  components: {
    LoginForm,
    CreateUserForm
  },

  data: () => ({
    username: '',
    password: '',
    error: '',
    createAccount: false
  }),

  methods: {
    toggleCreateAccount() {
      this.createAccount = !this.createAccount;
    },
  },

};
</script>


