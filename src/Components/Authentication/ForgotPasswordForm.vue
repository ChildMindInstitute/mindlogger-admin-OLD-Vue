<template>
  <div>
    <v-card class="elevation-12">
      <v-toolbar
        color="primary"
        dark
        flat
      >
        <v-toolbar-title>Reset Password</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <p>
          Send a link to reset your password hosted at {{ $store.state.backend }}
        </p>

        <v-text-field
          v-model="email"
          label="Email"
        />

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
          Submit
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
    error: '',
  }),
  methods: {
    createAccount() {
      if (!this.email) {
        this.error = 'Please enter your email';
        return;
      } else {
        const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
        if (!regex.test(this.email)) {
          this.error = 'Invalid email address';
          return;
        }
      }
      this.error = '';
      
      api.resetPassword({
        apiHost: this.$store.state.backend,
        body: {
          email: this.email,
        }
      }).then((resp) => {
        this.$emit('sendRequest', null);
      }).catch((e) => {
        this.error = e.message;
      });
    },
    onLogin() {
      this.$emit('login', null)
    }
  }
};
</script> 