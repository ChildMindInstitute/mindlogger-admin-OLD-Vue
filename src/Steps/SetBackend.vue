<template>
  <div>
    <v-layout row wrap>
        <v-flex>
          <h1>Select your Server</h1>
          <p>
            This server will hold your applet configuration settings
            and all the data you collect.
          </p>
          <v-text-field
            label="Server URL"
            v-model="backendServer"
          ></v-text-field>
        </v-flex>
    </v-layout>
  </div>
</template>

<script>
export default {
  name: 'BackendServer',

  data: () => ({
    backendServer: 'https://mindlogger-dev.vasegurt.com/api/v1',
  }),

  computed: {
    readyToContinue() {
      if (this.backendServer) {
        return true;
      }
      return false;
    }
  },

  mounted() {
    if (this.$store.state.backend) {
      this.backendServer = this.$store.state.backend;
    }
  },

  methods: {
    continueAction() {
      this.$store.commit('setBackend', this.backendServer);
      return this.$store.state.backend;
    }
  },

};
</script>

