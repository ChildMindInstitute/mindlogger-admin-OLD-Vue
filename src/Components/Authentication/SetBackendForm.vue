<template>
  <div>
    <h1 style="text-align: center">
      Login
    </h1>
    <v-card>
      <v-card-text>
        <p>
          Select your server. This server will hold your applet configuration settings and all the data you collect.
        </p>
        <v-combobox
          v-model="backendServer"
          label="Server URL"
          :items="backendServers"
          item-value="url"
          item-text="name"
        />

        <v-btn
          color="primary"
          @click="onOkay"
        >
          Okay
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
    backendServer: '',
    backendServers: [
      {'name': 'MindLogger (api.mindlogger.org)', 'url': 'https://api.mindlogger.org/api/v1'},
      {'name': 'MindLogger development (dev.mindlogger.org)', 'url': 'https://dev.mindlogger.org/api/v1'},
      {'name': 'localhost (localhost:8080)', 'url': 'http://localhost:8080/api/v1'},
      {'name': 'other', 'url': ''}
    ]
  }),

  mounted() {
    if (this.$store.state.backend) {
      this.backendServer = this.$store.state.backend;
    }
  },

  methods: {
    setBackend() {
      if (typeof this.backendServer === 'string' || this.backendServer instanceof String) {
        this.$store.commit('setBackend', this.backendServer.trim());
      } else {
        this.$store.commit('setBackend', this.backendServer.url.trim());
      }
    },
    onOkay() {
      this.setBackend();
      this.$emit('setBackend', null);
    },
  }

};
</script>
