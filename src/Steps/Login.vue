<template>
  <div>
    <v-layout row wrap>
        <v-flex>
          <h1>Login</h1>
          <p>
            Log into your Mindlogger account
          </p>
          <v-text-field
            label="username"
            v-model="username"
          ></v-text-field>

          <v-text-field
            label="password"
            v-model="password"
            type="password"
          ></v-text-field>

          <v-btn @click="login" color="primary">Login</v-btn>

        </v-flex>
    </v-layout>
  </div>
</template>

<script>
export default {
  name: 'Login',

  data: () => ({
    username: '',
    password: '',
    auth: {},
  }),

  computed: {
    readyToContinue() {
      return false;
    }
  },

  mounted() {
    if (this.$store.state.auth) {
      this.auth = this.$store.state.auth;
    }
  },

  methods: {
    continueAction() {
      // this.$store.commit('setBackend', this.backendServer);
    },
    login() {

    }
  },

};
</script>


